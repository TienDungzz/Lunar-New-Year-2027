import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import ApricotTree, { TREE_POSITION } from './ApricotTree';
import Fireworks, { type Launch } from './Fireworks';
import { seededRandom } from '../lib/experience.mjs';
import { batchScene } from '../lib/batchScene.mjs';
import { getCameraPhase, isFireworksSky } from '../lib/sceneVisibility.mjs';
import HearthEffects from './HearthEffects';

export function clearWorldCache() { useGLTF.clear('/models/tet-house.glb'); useGLTF.clear('/models/tet-courtyard.glb'); }

type Props = { phase: string; reduced: boolean; seen: string[]; launch: Launch | null; onOpen: (n: number) => void; onReady: () => void; onTransition: () => void; onError: () => void; modalOpen: boolean; reset: number; visible: boolean };
const COURTYARD_COLUMNS = 32, COURTYARD_ROWS = 24;
const COURTYARD_TILES = COURTYARD_COLUMNS*COURTYARD_ROWS;
function BatchedModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const meshes = useMemo(() => batchScene(gltf.scene) as { geometry: THREE.BufferGeometry; material: THREE.Material }[], [gltf]);
  useEffect(() => () => meshes.forEach(x => x.geometry.dispose()), [meshes]);
  return <group position={[.6, 0, -3.9]}>{meshes.map((x, i) => <mesh key={i} geometry={x.geometry} material={x.material} receiveShadow />)}</group>;
}
function Garden() {
  const stones = useRef<THREE.InstancedMesh>(null);
  const bamboo = useRef<THREE.InstancedMesh>(null);
  const bambooLeaves = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const rng = seededRandom(77), obj = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i = 0; i < COURTYARD_TILES; i++) {
      const row = Math.floor(i/COURTYARD_COLUMNS), col = i%COURTYARD_COLUMNS;
      obj.position.set(2.2-19/2+(col+.5)*19/COURTYARD_COLUMNS, .0325, -1-14/2+(row+.5)*14/COURTYARD_ROWS);
      obj.rotation.set(0, 0, 0); obj.scale.set(19/COURTYARD_COLUMNS-.018, .035, 14/COURTYARD_ROWS-.018); obj.updateMatrix();
      stones.current?.setMatrixAt(i, obj.matrix);
      color.setHSL(.035+rng()*.012,.34+rng()*.08,.29+rng()*.045);
      stones.current?.setColorAt(i,color);
    }
    if (stones.current) stones.current.instanceMatrix.needsUpdate = true;
    if (stones.current?.instanceColor) stones.current.instanceColor.needsUpdate = true;
    let stemIndex = 0, leafIndex = 0;
    for (const x of [-7, 11.5]) for (let i = 0; i < 5; i++) {
      obj.position.set(x+i*.25, 2.2+i*.2, -2+Math.sin(i)*.4);
      obj.rotation.set(0, 0, (i-2)*.04);
      obj.scale.set(.035, 4.4+i*.4, .035); obj.updateMatrix();
      bamboo.current?.setMatrixAt(stemIndex++, obj.matrix);
      for (let j = 0; j < 3; j++) {
        obj.position.set(x+i*.25+.25, 2.8+j*.5, -2+Math.sin(i)*.4);
        obj.rotation.set(0, .5*i, -.6);
        obj.scale.set(.65, .078, .195); obj.updateMatrix();
        bambooLeaves.current?.setMatrixAt(leafIndex++, obj.matrix);
      }
    }
    if (bamboo.current) bamboo.current.instanceMatrix.needsUpdate = true;
    if (bambooLeaves.current) bambooLeaves.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <>
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -.06, 0]}><circleGeometry args={[35, 64]} /><meshStandardMaterial color="#223c34" roughness={1} /></mesh>
    <mesh position={[2.2, -.02, -1]}><boxGeometry args={[19, .07, 14]} /><meshStandardMaterial color="#6b5144" roughness={1} /></mesh>
    <instancedMesh ref={stones} args={[undefined, undefined, COURTYARD_TILES]} receiveShadow><boxGeometry /><meshStandardMaterial color="#ffffff" roughness={.92} /></instancedMesh>
    <instancedMesh ref={bamboo} args={[undefined, undefined, 10]}><cylinderGeometry args={[.7, 1, 1, 5]} /><meshStandardMaterial color="#46604a" /></instancedMesh>
    <instancedMesh ref={bambooLeaves} args={[undefined, undefined, 30]}><sphereGeometry args={[1, 5, 4]} /><meshStandardMaterial color="#284b40" /></instancedMesh>
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[-18+i*5, 1, -18-Math.sin(i)*5]} scale={[4, 2+i%3, 3]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color={i%2 ? '#1b3538' : '#203b3e'} flatShading /></mesh>)}
    {[-1, 1].flatMap(x => [1.3, 4.4].map(z => <group key={`${x}-${z}`} position={[x*2.6, 0, z]}>
      <mesh position={[0, .25, 0]}><boxGeometry args={[.24, .5, .24]} /><meshStandardMaterial color="#39433a" /></mesh>
      <mesh position={[0, .57, 0]}><boxGeometry args={[.27, .22, .27]} /><meshBasicMaterial color="#ffc17a" /></mesh>
      <mesh position={[0, .73, 0]} rotation={[0, Math.PI/4, 0]}><coneGeometry args={[.26, .16, 4]} /><meshStandardMaterial color="#303d35" /></mesh>
      <pointLight color="#ffac59" intensity={3} distance={3} decay={2} />
    </group>))}
  </>;
}
function CameraRig({ phase, reduced, onTransition, reset, modalOpen }: Pick<Props, 'phase' | 'reduced' | 'onTransition' | 'reset' | 'modalOpen'>) {
  const { camera, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const target = useRef(new THREE.Vector3(0, 1.8, -3));
  const [animating, setAnimating] = useState(true);
  const cameraPhase = getCameraPhase(phase);
  const tree = cameraPhase.includes('TREE');
  const narrow = size.width < 700;
  const mobileHome = narrow && size.height > size.width;
  const homeDistance = Math.max(30, 39*(size.height/size.width)/(857/425));
  useEffect(() => {
    setAnimating(true);
    const position = tree ? [TREE_POSITION[0]+(narrow ? 0 : .7), 2.8, TREE_POSITION[2]+(narrow ? 12 : 7.2)] : cameraPhase === 'COUNTDOWN' || cameraPhase === 'LOADING' ? (mobileHome ? [11, 13, homeDistance] : narrow ? [12.8, 8.2, 23.5] : [10.8, 6.5, 15.5]) : [0, 3.8, 17];
    const look = tree ? [TREE_POSITION[0], 2.25, TREE_POSITION[2]] : cameraPhase === 'COUNTDOWN' || cameraPhase === 'LOADING' ? (mobileHome ? [3, 0, -2.5] : [.7, 1.65, -2.5]) : [0, 11, -9];
    const timeline = gsap.timeline({ onComplete: () => {
      setAnimating(false);
      if (controls.current) { controls.current.target.copy(target.current); controls.current.update(); }
      if (cameraPhase.endsWith('TRANSITION')) onTransition();
    } });
    timeline.to(camera.position, { x: position[0], y: position[1], z: position[2], duration: reduced ? .05 : 1.8, ease: 'power2.inOut' }, 0);
    timeline.to(target.current, { x: look[0], y: look[1], z: look[2], duration: reduced ? .05 : 1.8, ease: 'power2.inOut' }, 0);
    return () => { timeline.kill(); };
  }, [cameraPhase, reduced, camera, narrow, mobileHome, homeDistance, reset, onTransition]);
  useFrame(() => { if (animating || phase !== 'TREE_EXPLORE') camera.lookAt(target.current); });
  // Mount controls only after the camera animation. Disabled OrbitControls still
  // call update(), which would otherwise clamp and fight the transition camera.
  return phase === 'TREE_EXPLORE' && !animating ? <OrbitControls ref={controls} target={target.current} enabled={!modalOpen} enablePan={false} minDistance={narrow ? 10.5 : 5.5} maxDistance={narrow ? 15 : 11} minPolarAngle={.65} maxPolarAngle={1.65} minAzimuthAngle={-1.2} maxAzimuthAngle={1.2} enableDamping /> : null;
}
function Ready({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    const prepare = async () => {
      try {
        await Promise.all([
          gl.compileAsync(scene, camera),
          document.fonts.load('400 20px "Tet Serif"'),
          document.fonts.load('400 12px "Tet Sans"'),
        ]);
      } catch { /* An unavailable font can fall back without blocking the scene. */ }
      if (!cancelled) requestAnimationFrame(() => { if (!cancelled) onReady(); });
    };
    void prepare(); return () => { cancelled = true; };
  }, [onReady, gl, scene, camera]);
  return null;
}
function World(props: Props) {
  const fireworksSky = isFireworksSky(props.phase);
  return <Canvas className="world__canvas" dpr={[1, innerWidth < 700 ? 1.25 : 1.6]} frameloop={props.visible ? 'always' : 'never'} camera={{ position: [10.5, 6.5, 15], fov: 43, near: .1, far: 110 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.12;
    gl.debug.onShaderError = () => props.onError();
    gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); props.onError(); });
  }}>
    <fog attach="fog" args={['#2c1b24', 22, 62]} />
    <ambientLight intensity={.85} color="#d1b5af" />
    <hemisphereLight args={['#d8bdac', '#493022', 1.5]} />
    <directionalLight position={[-8, 10, 7]} color="#b5d8e4" intensity={fireworksSky ? 0 : 1.65} />
    <pointLight position={[.6, 2.3, -.7]} color="#ffb960" intensity={20} distance={10} decay={2} />
    <pointLight position={[-4, 3, 3]} color="#ffd691" intensity={9} distance={8} decay={2} />
    <pointLight position={[-2.75, 1.8, 1.9]} color="#ff9f45" intensity={5} distance={5} decay={2} />
    <pointLight position={[3.95, 1.8, 1.9]} color="#ffb85d" intensity={5} distance={5} decay={2} />
    <Stars radius={55} depth={20} count={900} factor={2} saturation={0} fade speed={props.reduced ? 0 : .2} />
    {!fireworksSky && <mesh position={[-13, 16, -25]}><sphereGeometry args={[1.05, 24, 24]} /><meshBasicMaterial color="#eee1ba" /></mesh>}
    <Garden />
    <Suspense fallback={null}>
      <BatchedModel url="/models/tet-house.glb" />
      <BatchedModel url="/models/tet-courtyard.glb" />
      <HearthEffects reduced={props.reduced} />
      <ApricotTree active={props.phase === 'TREE_EXPLORE' && !props.modalOpen} seen={props.seen} onOpen={props.onOpen} reduced={props.reduced} />
      <Ready onReady={props.onReady} />
    </Suspense>
    <Fireworks active={props.phase === 'FIREWORKS' && props.visible} launch={props.launch} reduced={props.reduced} />
    <CameraRig {...props} />
  </Canvas>;
}



export default memo(World);
