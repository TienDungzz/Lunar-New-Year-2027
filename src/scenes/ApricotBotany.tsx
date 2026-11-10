import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createApricotBotany } from './apricotStructure';

export default function ApricotBotany({ tips }: { tips: [number, number, number][] }) {
  const data = useMemo(() => createApricotBotany(tips), [tips]);
  const petals = useRef<THREE.InstancedMesh>(null), centers = useRef<THREE.InstancedMesh>(null);
  const filaments = useRef<THREE.InstancedMesh>(null), anthers = useRef<THREE.InstancedMesh>(null);
  const buds = useRef<THREE.InstancedMesh>(null), leaves = useRef<THREE.InstancedMesh>(null);
  useEffect(() => () => data.bark.dispose(), [data]);
  useEffect(() => {
    const object = new THREE.Object3D(), color = new THREE.Color();
    const place = (mesh: THREE.InstancedMesh | null, index: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, flower: typeof data.flowers[number], angle = 0) => {
      object.position.set(x, y, z).applyQuaternion(flower.rotation).add(flower.position);
      object.quaternion.copy(flower.rotation).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle));
      object.scale.set(sx, sy, sz); object.updateMatrix(); mesh?.setMatrixAt(index, object.matrix);
    };
    data.flowers.forEach((flower, i) => {
      const s = flower.size;
      for (let petal = 0; petal < 5; petal++) {
        const angle = petal/5*Math.PI*2+i*2.4;
        place(petals.current, i*5+petal, Math.sin(angle)*s*.65, .008, Math.cos(angle)*s*.65, s*.72, s*.16, s, flower, angle);
        color.setHSL(.125+(i%5)*.004, .92, .51+(i%4)*.035);
        petals.current?.setColorAt(i*5+petal, color);
      }
      place(centers.current, i, 0, .015, 0, s*.28, s*.19, s*.28, flower);
      for (let stamen = 0; stamen < 10; stamen++) {
        const angle = stamen/10*Math.PI*2+i, radius = s*(stamen%2 ? .27 : .42), height = s*(stamen%3 ? .65 : .9);
        const x = Math.sin(angle)*radius, z = Math.cos(angle)*radius;
        place(filaments.current, i*10+stamen, x, height/2, z, .0025, height, .0025, flower);
        place(anthers.current, i*10+stamen, x, height, z, .007, .006, .007, flower);
      }
    });
    data.buds.forEach((bud, i) => place(buds.current, i, 0, .02, 0, bud.size*.55, bud.size, bud.size*.55, bud));
    data.leaves.forEach((leaf, i) => place(leaves.current, i, .05, .04, 0, leaf.size*.38, .009, leaf.size, leaf, i));
    for (const ref of [petals, centers, filaments, anthers, buds, leaves]) if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
      ref.current.computeBoundingSphere();
    }
  }, [data]);
  return <group>
    <mesh geometry={data.bark}><meshStandardMaterial color="#69503a" roughness={.96} /></mesh>
    <instancedMesh ref={petals} args={[undefined, undefined, data.flowers.length*5]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color="#ffffff" roughness={.7} side={THREE.DoubleSide} /></instancedMesh>
    <instancedMesh ref={centers} args={[undefined, undefined, data.flowers.length]}><sphereGeometry args={[1, 7, 5]} /><meshStandardMaterial color="#dba52a" roughness={.8} /></instancedMesh>
    <instancedMesh ref={filaments} args={[undefined, undefined, data.flowers.length*10]}><cylinderGeometry args={[1, 1, 1, 3]} /><meshStandardMaterial color="#f9bc35" roughness={.7} /></instancedMesh>
    <instancedMesh ref={anthers} args={[undefined, undefined, data.flowers.length*10]}><sphereGeometry args={[1, 4, 3]} /><meshStandardMaterial color="#d67d17" roughness={.8} /></instancedMesh>
    <instancedMesh ref={buds} args={[undefined, undefined, data.buds.length]}><sphereGeometry args={[1, 7, 5]} /><meshStandardMaterial color="#789d28" roughness={.66} /></instancedMesh>
    <instancedMesh ref={leaves} args={[undefined, undefined, data.leaves.length]}><sphereGeometry args={[1, 7, 4]} /><meshStandardMaterial color="#769c36" roughness={.8} /></instancedMesh>
  </group>;
}
