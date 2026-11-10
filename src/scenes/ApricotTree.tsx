import { useRef, useState } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ApricotBotany from './ApricotBotany';
import { WISH_COUNT } from '../data/wishes';

export const TREE_POSITION: [number, number, number] = [-4.3, 0, 1.4];
const branchTips: [number, number, number][] = [
  [-1.26, 2.72, .42], [-.62, 3.4, .1], [.4, 3.92, .05], [1.23, 3.3, .24],
  [1.64, 2.48, .2], [.72, 2.46, 1.02], [-.35, 2.38, 1.27], [-1.64, 2.1, .48],
  [-.9, 1.76, .94], [.16, 1.62, 1.18], [1.3, 1.74, .67], [-.24, 3.07, 1.2],
];
export const anchors = [0, 1, 3, 4, 6, 8, 10, 11].map(index => branchTips[index]).slice(0, WISH_COUNT);
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
  return <group position={TREE_POSITION}>
    <mesh position={[0, .28, 0]}><cylinderGeometry args={[.73, .48, .55, 12]} /><meshStandardMaterial color="#8b4c30" roughness={.8} /></mesh>
    <mesh position={[0, .57, 0]}><cylinderGeometry args={[.77, .77, .12, 12]} /><meshStandardMaterial color="#b76d40" /></mesh>
    <mesh position={[0, .64, 0]}><cylinderGeometry args={[.66, .66, .03, 12]} /><meshStandardMaterial color="#352e20" /></mesh>
    <ApricotBotany tips={branchTips} />
    {anchors.map((_, index) => <Ornament key={index} index={index} seen={seen.includes(`wish-${String(index+1).padStart(2,'0')}`)} active={active} reduced={reduced} onOpen={onOpen} />)}
  </group>;
}
