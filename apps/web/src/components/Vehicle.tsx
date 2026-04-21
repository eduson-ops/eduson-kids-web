import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

interface Props {
  pos: [number, number, number]
  color?: string
  /** если dev подложит /models/car-retro.glb — URL сюда */
  modelUrl?: string
}

export default function Vehicle({ pos, color = '#ff5464', modelUrl }: Props) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      {modelUrl ? <GLBCar url={modelUrl} /> : <ProceduralCar color={color} />}
    </RigidBody>
  )
}

function GLBCar({ url }: { url: string }) {
  const gltf = useGLTF(url)
  return <primitive object={gltf.scene} />
}

function ProceduralCar({ color }: { color: string }) {
  return (
    <group>
      {/* кузов */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2.2, 0.6, 1.1]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* крыша-кабина */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[1.2, 0.5, 1]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
      </mesh>
      {/* лобовое стекло */}
      <mesh position={[0.35, 1.05, 0]}>
        <boxGeometry args={[0.02, 0.4, 0.9]} />
        <meshStandardMaterial
          color="#88c2ff"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* колёса */}
      {[
        [0.7, 0.2, 0.55],
        [-0.7, 0.2, 0.55],
        [0.7, 0.2, -0.55],
        [-0.7, 0.2, -0.55],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      {/* фары */}
      <mesh position={[1.1, 0.5, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[1.1, 0.5, -0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}
