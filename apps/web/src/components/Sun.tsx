import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  /** позиция солнца на небе (как sunPosition в Sky) */
  position: [number, number, number]
  /** на каком расстоянии рисуем билборд-диск */
  distance?: number
}

/**
 * Видимое солнце — плоский яркий диск-билборд, всегда смотрит на камеру.
 * Двойной glow через transparent sprite-плашки: тёплое ядро + мягкий ореол.
 * Не участвует в депс-тесте за счёт renderOrder + transparent + frustumCulled=false.
 */
export default function Sun({ position, distance = 220 }: Props) {
  const dir = new THREE.Vector3(...position).normalize().multiplyScalar(distance)
  return (
    <Billboard position={[dir.x, dir.y, dir.z]} follow>
      {/* Внешнее сияние — широкий мягкий диск */}
      <mesh renderOrder={-2} frustumCulled={false}>
        <circleGeometry args={[22, 32]} />
        <meshBasicMaterial
          color="#fff1a6"
          transparent
          opacity={0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Тёплое промежуточное кольцо */}
      <mesh renderOrder={-1} frustumCulled={false}>
        <circleGeometry args={[13, 32]} />
        <meshBasicMaterial
          color="#ffe066"
          transparent
          opacity={0.75}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Яркое ядро */}
      <mesh renderOrder={0} frustumCulled={false}>
        <circleGeometry args={[7, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  )
}
