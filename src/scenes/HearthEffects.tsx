import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Matches the cooking-pot anchor exported by build_environment.py.
export default function HearthEffects({ reduced }: { reduced: boolean }) {
  const flame = useRef<THREE.InstancedMesh>(null), light = useRef<THREE.PointLight>(null);
  const state = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24*3),3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(24),1));
    geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(24),1));
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      vertexShader: `attribute float alpha;attribute float size;varying float vAlpha;void main(){vAlpha=alpha;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(240.*size/-p.z,3.,44.);}`,
      fragmentShader: `varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(.94,.9,.8,exp(-d*d*5.)*vAlpha);}`,
    });
    return { geometry, material, object: new THREE.Object3D() };
  }, []);
  const update = (time: number) => {
    const positions = state.geometry.attributes.position.array as Float32Array;
    const alpha = state.geometry.attributes.alpha.array as Float32Array;
    const size = state.geometry.attributes.size.array as Float32Array;
    for (let i = 0; i < 24; i++) {
      const t = (time*.23+i/24)%1;
      positions[i*3] = Math.sin(t*6+i*.7)*t*.15;
      positions[i*3+1] = 1.43+t*1.05;
      positions[i*3+2] = Math.cos(t*5+i*.6)*t*.12;
      alpha[i] = Math.sin(t*Math.PI)*.085; size[i] = .6+t*1.3;
    }
    for (const name of ['position','alpha','size']) state.geometry.attributes[name].needsUpdate = true;
    for (let i = 0; i < 7; i++) {
      const flicker = 1+Math.sin(time*7+i*1.7)*.2;
      state.object.position.set((i-3)*.11,.32,.32+Math.sin(i)*.06);
      state.object.scale.set(.075,.17*flicker,.06); state.object.rotation.set(0,0,Math.sin(time*3+i)*.12); state.object.updateMatrix();
      flame.current?.setMatrixAt(i,state.object.matrix);
    }
    if (flame.current) flame.current.instanceMatrix.needsUpdate = true;
    if (light.current) light.current.intensity = 4.5+Math.sin(time*6)*.5;
  };
  useEffect(() => { update(0); }, [reduced]);
  useEffect(() => () => { state.geometry.dispose(); state.material.dispose(); }, [state]);
  useFrame(({ clock }) => { if (!reduced) update(clock.elapsedTime); });
  return <group position={[5.05,0,-1]}>
    <points geometry={state.geometry} material={state.material} frustumCulled={false} />
    <instancedMesh ref={flame} args={[undefined,undefined,7]}><coneGeometry args={[1,2,5]} /><meshBasicMaterial color="#ffaf34" toneMapped={false} /></instancedMesh>
    <pointLight ref={light} position={[0,.37,.4]} intensity={4.5} color="#ff7e28" distance={4} decay={2} />
  </group>;
}
