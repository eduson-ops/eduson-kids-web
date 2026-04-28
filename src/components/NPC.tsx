import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { memo, useRef } from 'react'
import type { Group } from 'three'
import { useFrame } from '@react-three/fiber'

interface Props {
  pos: [number, number, number]
  /** если подложен .glb в /public/models — имя файла */
  modelUrl?: string
  label?: string
  bodyColor?: string
}

/**
 * NPC — продавец-котик за прилавком (как на скрине Блокселей).
 * По умолчанию процедурный (кубы), но если dev подложит модельку в
 * /public/models/npc-vendor.glb — сюда передаётся `modelUrl="/models/npc-vendor.glb"`
 * и рендерится она.
 */
function NPCImpl({ pos, modelUrl, label, bodyColor = '#ffd1e8' }: Props) {
  const bob = useRef<Group>(null!)

  useFrame(() => {
    if (bob.current) {
      bob.current.position.y = pos[1] + Math.sin(Date.now() * 0.002) * 0.08
    }
  })

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={pos}>
        <group ref={bob}>
          {modelUrl ? <GLBModel url={modelUrl} /> : <ProceduralVendor bodyColor={bodyColor} />}
        </group>
      </RigidBody>
      {label && (
        <mesh position={[pos[0], pos[1] + 2.4, pos[2]]} rotation={[0, 0, 0]}>
          <planeGeometry args={[label.length * 0.22 + 0.4, 0.45]} />
          <meshBasicMaterial color="#000" opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  )
}

// D-11: NPC из World*-компонентов с inline `pos={[...]}`/строковыми label/bodyColor.
// Custom comparator: tuple-equality + primitive equality.
const NPC = memo(NPCImpl, (prev, next) => (
  prev.pos[0] === next.pos[0] &&
  prev.pos[1] === next.pos[1] &&
  prev.pos[2] === next.pos[2] &&
  prev.modelUrl === next.modelUrl &&
  prev.label === next.label &&
  prev.bodyColor === next.bodyColor
))
export default NPC

function GLBModel({ url }: { url: string }) {
  const gltf = useGLTF(url)
  return <primitive object={gltf.scene} />
}

function ProceduralVendor({ bodyColor }: { bodyColor: string }) {
  return (
    <group>
      {/* прилавок */}
      <mesh position={[0, 0.5, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1, 1.2]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      {/* навес */}
      <mesh position={[0, 1.7, 0.6]} castShadow>
        <boxGeometry args={[2.6, 0.1, 1.6]} />
        <meshStandardMaterial color="#ff5464" />
      </mesh>
      {/* столбики навеса */}
      <mesh position={[-1.1, 1.1, 1.1]}>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshStandardMaterial color="#3b2a14" />
      </mesh>
      <mesh position={[1.1, 1.1, 1.1]}>
        <boxGeometry args={[0.1, 1.2, 0.1]} />
        <meshStandardMaterial color="#3b2a14" />
      </mesh>
      {/* товар — красная банка */}
      <mesh position={[0, 1.15, 0.3]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 12]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={0.3} />
      </mesh>

      {/* продавец-котик за прилавком */}
      <group position={[0, 1.1, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.9, 0.6]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.7, 0.6, 0.6]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* глаза */}
        <mesh position={[-0.15, 0.8, 0.31]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.15, 0.8, 0.31]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* ушки */}
        <mesh position={[-0.2, 1.15, 0]} rotation={[0, 0, -0.2]} castShadow>
          <coneGeometry args={[0.12, 0.25, 4]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0.2, 1.15, 0]} rotation={[0, 0, 0.2]} castShadow>
          <coneGeometry args={[0.12, 0.25, 4]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>
    </group>
  )
}
