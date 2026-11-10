import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { seededRandom } from '../lib/experience.mjs';

export type Bloom = { position: THREE.Vector3; rotation: THREE.Quaternion; size: number };
const UP = new THREE.Vector3(0, 1, 0);

function wood(from: THREE.Vector3, to: THREE.Vector3, radius: number) {
  const curve = new THREE.CatmullRomCurve3([from, from.clone().lerp(to, .45).add(new THREE.Vector3(.15, .1, -.08)), to]);
  const geometry = new THREE.TubeGeometry(curve, 12, 1, 7, false);
  const positions = geometry.attributes.position;
  const point = new THREE.Vector3();
  for (let ring = 0; ring <= 12; ring++) {
    const center = curve.getPointAt(ring/12);
    const thickness = radius*(1-.8*ring/12);
    for (let side = 0; side <= 7; side++) {
      const index = ring*8+side;
      point.fromBufferAttribute(positions, index).sub(center).multiplyScalar(thickness).add(center);
      positions.setXYZ(index, point.x, point.y, point.z);
    }
  }
  geometry.computeVertexNormals();
  return { curve, geometry };
}

export function createApricotBotany(tips: [number, number, number][]) {
  const rng = seededRandom(82), pieces: THREE.BufferGeometry[] = [];
  const flowers: Bloom[] = [], buds: Bloom[] = [], leaves: Bloom[] = [];
  const trunk = wood(new THREE.Vector3(0, .6, 0), new THREE.Vector3(.12, 3.2, -.15), .19);
  pieces.push(trunk.geometry);
  for (const [index, tip] of tips.entries()) {
    const from = new THREE.Vector3(.08, 1.05+(index%4)*.36, -.02);
    const main = wood(from, new THREE.Vector3(...tip).add(new THREE.Vector3(0, .25, -.1)), .065+(index%3)*.013);
    pieces.push(main.geometry);
    for (let fork = 0; fork < 4; fork++) {
      const start = main.curve.getPoint(.36+fork*.17);
      const direction = new THREE.Vector3((rng()-.5)*.85, .25+rng()*.45, (rng()-.5)*.85);
      const twig = wood(start, start.clone().add(direction), .018);
      pieces.push(twig.geometry);
      for (let item = 0; item < 6; item++) {
        const position = twig.curve.getPoint(.15+item*.15);
        const normal = new THREE.Vector3((rng()-.5)*1.3, .25+rng()*.6, .45+rng()*.6).normalize();
        const stem = wood(position, position.clone().addScaledVector(normal, .09+rng()*.07), .006);
        pieces.push(stem.geometry);
        flowers.push({ position: stem.curve.getPoint(1), rotation: new THREE.Quaternion().setFromUnitVectors(UP, normal), size: .075+rng()*.035 });
      }
      for (let item = 0; item < 4; item++) {
        const position = twig.curve.getPoint(.4+item*.18);
        const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(rng()*.8, rng()*6.28, (rng()-.5)*1.5));
        buds.push({ position: position.clone().add(new THREE.Vector3(.035, .05, 0)), rotation, size: .035+rng()*.017 });
        if (item%2 === 0) leaves.push({ position, rotation, size: .08+rng()*.04 });
      }
    }
  }
  const bark = mergeGeometries(pieces)!;
  pieces.forEach(piece => piece.dispose());
  return { bark, flowers, buds, leaves };
}
