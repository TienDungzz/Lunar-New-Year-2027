import { useEffect, useMemo, useRef, useState } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seededRandom } from '../lib/experience.mjs';
import { WISH_COUNT } from '../data/wishes';

export const TREE_POSITION: [number, number, number] = [-4.3, 0, 1.4];
const branchTips: [number, number, number][] = [
  [-1.26, 2.72, .42], [-.62, 3.4, .1], [.4, 3.92, .05], [1.23, 3.3, .24],
  [1.64, 2.48, .2], [.72, 2.46, 1.02], [-.35, 2.38, 1.27], [-1.64, 2.1, .48],
  [-.9, 1.76, .94], [.16, 1.62, 1.18], [1.3, 1.74, .67], [-.24, 3.07, 1.2],
];
export const anchors = [0, 1, 3, 4, 6, 8, 10, 11].map(index => branchTips[index]).slice(0, WISH_COUNT);
function Branch({ from, to, radius }: { from: number[]; to: number[]; radius: number }) {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    return new THREE.CatmullRomCurve3([a, a.clone().lerp(b, .5).add(new THREE.Vector3(.12, .12, -.06)), b]);
  }, [from, to]);
  return <mesh><tubeGeometry args={[curve, 6, radius, 6, false]} /><meshStandardMaterial color="#58432b" roughness={.96} /></mesh>;
}
function Ornament({ index, seen, active, reduced, onOpen }: { index: number; seen: boolean; active: boolean; reduced: boolean; onOpen: (index: number) => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = reduced ? 0 : Math.sin(clock.elapsedTime*1.2+index)*.045;
  });
  const handleClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (active && e.delta < 5) onOpen(index); };
  return <group position={anchors[index]} ref={ref}>
    <mesh position={[0, .18, 0]}><cylinderGeometry args={[.008, .008, .36, 5]} /><meshStandardMaterial color="#dcae59" /></mesh>
    <group onClick={handleClick} onPointerOver={e => { if (active) { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; } }} onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}>
      <mesh position={[0, -.14, 0]}>
        <boxGeometry args={[.24, .34, .035]} />
        <meshStandardMaterial color={seen ? '#b38243' : '#bd382e'} emissive={hovered ? '#fbc96e' : '#b83520'} emissiveIntensity={hovered ? .6 : .12} roughness={.5} />
      </mesh>
      <mesh position={[0, -.13, .024]} rotation={[0, 0, Math.PI/4]}><planeGeometry args={[.1, .1]} /><meshBasicMaterial color="#ffd88a" side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -.37, 0]}><cylinderGeometry args={[.018, .023, .16, 5]} /><meshStandardMaterial color="#f5bd5e" /></mesh>
      {active && <mesh position={[0, -.15, 0]} visible={false}><boxGeometry args={[.47, .58, .4]} /><meshBasicMaterial /></mesh>}
    </group>
  </group>;
}
export default function ApricotTree({ active, seen, onOpen, reduced }: { active: boolean; seen: string[]; onOpen: (index: number) => void; reduced: boolean }) {
  const petals = useRef<THREE.InstancedMesh>(null);
  const branches = useMemo(() => branchTips.map((p, i) => ({ from: [0, .6+(i%3)*.38, 0], to: [p[0]*1.12, p[1]+.3, p[2]-.12], radius: .035+(i%3)*.013 })), []);
  const blossoms = useMemo(() => {
    const rng = seededRandom(82), result: { x: number; y: number; z: number; r: number; s: number }[] = [];
    for (const b of branches) for (let i = 0; i < 35; i++) {
      const t = .48+rng()*.55;
      result.push({ x: b.from[0]+(b.to[0]-b.from[0])*t+(rng()-.5)*.8,
        y: b.from[1]+(b.to[1]-b.from[1])*t+(rng()-.5)*.7,
        z: b.from[2]+(b.to[2]-b.from[2])*t+(rng()-.5)*.8, r: rng()*Math.PI, s: .055+rng()*.025 });
    }
    return result;
  }, [branches]);
  useEffect(() => {
    if (!petals.current) return;
    const object = new THREE.Object3D(); let i = 0;
    for (const flower of blossoms) for (let p = 0; p < 5; p++) {
      const a = p/5*Math.PI*2+flower.r;
      object.position.set(flower.x+Math.cos(a)*flower.s*.62, flower.y+Math.sin(a)*flower.s*.62, flower.z);
      object.rotation.set(.2, flower.r, a);
      object.scale.set(flower.s*.65, flower.s, flower.s*.28); object.updateMatrix();
      petals.current.setMatrixAt(i++, object.matrix);
    }
    petals.current.instanceMatrix.needsUpdate = true;
  }, [blossoms]);
  return <group position={TREE_POSITION}>
    <mesh position={[0, .28, 0]}><cylinderGeometry args={[.73, .48, .55, 12]} /><meshStandardMaterial color="#8b4c30" roughness={.8} /></mesh>
    <mesh position={[0, .57, 0]}><cylinderGeometry args={[.77, .77, .12, 12]} /><meshStandardMaterial color="#b76d40" /></mesh>
    <mesh position={[0, .64, 0]}><cylinderGeometry args={[.66, .66, .03, 12]} /><meshStandardMaterial color="#352e20" /></mesh>
    <Branch from={[0, .55, 0]} to={[.12, 2.1, .08]} radius={.15} />
    {branches.map((b, i) => <Branch key={i} {...b} />)}
    <instancedMesh ref={petals} args={[undefined, undefined, blossoms.length*5]} frustumCulled={false}>
      <sphereGeometry args={[1, 5, 4]} /><meshStandardMaterial color="#f4c64e" emissive="#c68514" emissiveIntensity={.12} roughness={.62} />
    </instancedMesh>
    {anchors.map((_, index) => <Ornament key={index} index={index} seen={seen.includes(`wish-${String(index+1).padStart(2,'0')}`)} active={active} reduced={reduced} onOpen={onOpen} />)}
  </group>;
}
