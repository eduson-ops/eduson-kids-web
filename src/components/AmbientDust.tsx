import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { canPostfx } from '../lib/deviceTier'

const DUST_COUNT = 80
const SPREAD = 28
const HEIGHT = 10

const pseudo = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1

export default function AmbientDust() {
  const enabled = canPostfx()
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const { camera } = useThree()

  const particles = useMemo(() => {
    // [offsetX, offsetY, offsetZ, rise-speed, phase]
    const arr = new Float32Array(DUST_COUNT * 5)
    for (let i = 0; i < DUST_COUNT; i++) {
      const b = i * 5
      arr[b]     = (pseudo(i * 5)     - 0.5) * SPREAD
      arr[b + 1] = pseudo(i * 5 + 1) * HEIGHT
      arr[b + 2] = (pseudo(i * 5 + 2) - 0.5) * SPREAD
      arr[b + 3] = 0.06 + pseudo(i * 5 + 3) * 0.16
      arr[b + 4] = pseudo(i * 5 + 4) * Math.PI * 2
    }
    return arr
  }, [])

  useFrame(({ clock }, dt) => {
    if (!enabled || !meshRef.current) return
    const t = clock.getElapsedTime()
    const cx = camera.position.x
    const cz = camera.position.z
    for (let i = 0; i < DUST_COUNT; i++) {
      const b = i * 5
      particles[b + 1]! += particles[b + 3]! * dt
      if (particles[b + 1]! > HEIGHT) particles[b + 1] = 0
      const drift = Math.sin(t * 0.22 + particles[b + 4]!) * 0.7
      dummy.position.set(
        cx + particles[b]! + drift,
        particles[b + 1]!,
        cz + particles[b + 2]! + drift * 0.7,
      )
      const s = 0.020 + Math.sin(t * 0.65 + particles[b + 4]!) * 0.005
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!enabled) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, DUST_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#fffde8" transparent opacity={0.42} depthWrite={false} />
    </instancedMesh>
  )
}
