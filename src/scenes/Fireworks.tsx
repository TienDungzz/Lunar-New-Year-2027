import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { seededRandom, fireworkTypes } from '../lib/experience.mjs';
import { MAX_ACTIVE_BURSTS } from '../lib/fireworkShow.mjs';
import { createFireworkPlan, sampleFlight, sampleSpark } from '../lib/fireworkDynamics.mjs';
import type { TextGlyph } from '../lib/fireworkText';
import { getTextScale } from '../lib/textSalvo.mjs';
import { FIREWORK_PALETTE } from '../lib/fireworkPalette.mjs';

export type Launch = { id: number; type: string; points?: number[][]; glyphs?: TextGlyph[]; text?: string; strength?: number };
const MAX = 30000;
type Burst = { born: number; center: THREE.Vector3; plan: ReturnType<typeof createFireworkPlan>; color: THREE.Color; scale: number; text: boolean };
export default function Fireworks({ launch, active, reduced }: { launch: Launch | null; active: boolean; reduced: boolean }) {
  const { camera, size } = useThree();
  const bursts = useRef<Burst[]>([]);
  const state = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    for (const attribute of ['position', 'color']) geometry.setAttribute(attribute, new THREE.BufferAttribute(new Float32Array(MAX*3), 3));
    for (const attribute of ['alpha', 'size']) geometry.setAttribute(attribute, new THREE.BufferAttribute(new Float32Array(MAX), 1));
    geometry.setDrawRange(0, 0);
    const material = new THREE.ShaderMaterial({
      vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float alpha; attribute float size; varying vec3 vColor; varying float vAlpha;
        void main(){vColor=color;vAlpha=alpha;vec4 p=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*p; gl_PointSize=clamp(175.*size/-p.z,2.5,14.);}`,
      fragmentShader: `varying vec3 vColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float core=exp(-d*d*20.);float halo=exp(-d*d*5.);gl_FragColor=vec4(vColor*(1.8+core), (core+halo*.45)*vAlpha);}`,
    });
    return { geometry, material, right: new THREE.Vector3(), up: new THREE.Vector3(), forward: new THREE.Vector3(), point: new THREE.Vector3(),
      flight: [0,0,0], spark: { x: 0, y: 0, z: 0, alpha: 0, size: 0 },
      palette: Object.fromEntries(Object.entries(FIREWORK_PALETTE).map(([name,color]) => [name,new THREE.Color(color)])) };
  }, []);
  useEffect(() => () => { state.geometry.dispose(); state.material.dispose(); }, [state]);
  useEffect(() => { bursts.current = []; state.geometry.setDrawRange(0, 0); }, [active, reduced, state]);
  useEffect(() => {
    if (!active || !launch) return;
    const rng = seededRandom(launch.id*37), count = launch.points?.length ?? (size.width < 700 ? 240 : 420);
    const plan = createFireworkPlan(launch.type, launch.id*37, count, reduced, launch.points, launch.glyphs);
    const text = launch.type === 'text' || launch.type === 'opening';
    const height = 2*Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov/2))*20, width = height*size.width/size.height;
    const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion), up = new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    const center = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(20).add(camera.position)
      .addScaledVector(right, text ? 0 : (rng()-.5)*width*.4)
      .addScaledVector(up, text ? 0 : height*(.1+(rng()-.5)*.12));
    bursts.current.push({ born: performance.now()/1000, center, plan, text, color: new THREE.Color(fireworkTypes.find(x => x.id === launch.type)?.color || '#ffd477'),
      scale: text ? getTextScale(width,height,plan.halfWidth,plan.halfHeight) : Math.min(width*.25, height*.23)/plan.radius*(launch.strength ?? 1) });
    bursts.current = bursts.current.slice(-MAX_ACTIVE_BURSTS);
  }, [launch, active]);
  useFrame(() => {
    if (!active) return;
    const now = performance.now()/1000;
    const positions = state.geometry.attributes.position.array as Float32Array, colors = state.geometry.attributes.color.array as Float32Array;
    const alphas = state.geometry.attributes.alpha.array as Float32Array, sizes = state.geometry.attributes.size.array as Float32Array;
    state.right.set(1,0,0).applyQuaternion(camera.quaternion); state.up.set(0,1,0).applyQuaternion(camera.quaternion); state.forward.set(0,0,1).applyQuaternion(camera.quaternion);
    bursts.current = bursts.current.filter(b => now-b.born < b.plan.duration);
    let index = 0;
    const write = (burst: Burst, x: number, y: number, z: number, color: THREE.Color, alpha: number, pointSize: number) => {
      if (index >= MAX) return;
      state.point.copy(burst.center).addScaledVector(state.right,x*burst.scale).addScaledVector(state.up,y*burst.scale).addScaledVector(state.forward,z*burst.scale);
      const j = index++;
      positions[j*3] = state.point.x; positions[j*3+1] = state.point.y; positions[j*3+2] = state.point.z;
      colors[j*3] = color.r; colors[j*3+1] = color.g; colors[j*3+2] = color.b; alphas[j] = alpha; sizes[j] = pointSize;
    };
    for (const burst of bursts.current) {
      if (burst.text) {
        // Keep the line centered even while the camera finishes moving or the
        // viewport changes orientation. All glyph shells share this plane.
        burst.center.copy(camera.position).addScaledVector(state.forward,-20);
        const height = 2*Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov/2))*20;
        burst.scale = getTextScale(height*size.width/size.height,height,burst.plan.halfWidth,burst.plan.halfHeight);
      }
      const age = now-burst.born;
      for (const stage of burst.plan.stages) {
        const color = stage.color === 'base' ? burst.color : state.palette[stage.color as keyof typeof state.palette];
        if (age < stage.at) {
          for (let tail = 0; tail < 38; tail++) {
            const p = sampleFlight(stage, age-tail*.009, state.flight);
            if (p) write(burst, p[0],p[1],p[2], color, (1-tail/38)*.95, tail < 3 ? 1.8 : 1.05);
          }
          continue;
        }
        for (let i = 0; i < stage.points.length; i++) for (let tail = 0; tail < stage.trails; tail++) {
          const spark = sampleSpark(stage, age, i, tail, reduced, state.spark);
          if (spark) write(burst, spark.x,spark.y,spark.z, i%13 === 0 ? state.palette.white : color, spark.alpha, spark.size);
        }
      }
    }
    state.geometry.setDrawRange(0,index);
    for (const attribute of ['position','color','alpha','size']) state.geometry.attributes[attribute].needsUpdate = true;
  });
  return <points geometry={state.geometry} material={state.material} frustumCulled={false} />;
}
