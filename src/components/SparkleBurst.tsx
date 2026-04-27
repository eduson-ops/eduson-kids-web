import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  pos: [number, number, number]
  onDone?: () => void
}

const COUNT = 8
const LIFETIME = 0.6       // сек
const GRAVITY = -12        // м/с² (лёгкая псевдо-гравитация для эффекта искр)

/**
 * Вспышка-сверкалка из 8 частиц. Используется на pickup монетки.
 * InstancedMesh переиспользуется (один draw call), матрицы обновляются в useFrame.
 */
export default function SparkleBurst({ pos, onDone }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const geometry = useMemo(() => new THREE.SphereGeometry(0.5, 6, 6), [])
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffd644', toneMapped: false, transparent: true, opacity: 0.95 }),
    []
  )

  // Reusable scratch objects
  const matrix = useMemo(() => new THREE.Matrix4(), [])
  const dummyPos = useMemo(() => new THREE.Vector3(), [])
  const dummyRot = useMemo(() => new THREE.Quaternion(), [])
  const dummyScale = useMemo(() => new THREE.Vector3(), [])

  const positions = useRef<THREE.Vector3[]>([])
  const velocities = useRef<THREE.Vector3[]>([])
  const elapsed = useRef(0)
  const doneCalled = useRef(false)

  useEffect(() => {
    positions.current = []
    velocities.current = []
    for (let i = 0; i < COUNT; i++) {
      positions.current.push(new THREE.Vector3(pos[0], pos[1], pos[2]))
      const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
      const speed = 2.8 + Math.random() * 1.6
      velocities.current.push(
        new THREE.Vector3(
          Math.cos(angle) * speed,
          2.2 + Math.random() * 1.8,
          Math.sin(angle) * speed
        )
      )
    }
    elapsed.current = 0
    doneCalled.current = false
    return () => {
      geometry.dispose()
      material.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos[0], pos[1], pos[2]])

  useFrame((_, dt) => {
    if (!meshRef.current) return
    elapsed.current += dt
    const t = Math.min(1, elapsed.current / LIFETIME)
    const scale = (1 - t) * 0.18 + 0.04  // scale down over lifetime
    material.opacity = 0.95 * (1 - t * t)

    for (let i = 0; i < COUNT; i++) {
      const p = positions.current[i]
      const v = velocities.current[i]
      if (!p || !v) continue
      v.y += GRAVITY * dt
      p.addScaledVector(v, dt)

      dummyPos.copy(p)
      dummyRot.identity()
      dummyScale.setScalar(scale)
      matrix.compose(dummyPos, dummyRot, dummyScale)
      meshRef.current.setMatrixAt(i, matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true

    if (t >= 1 && !doneCalled.current) {
      doneCalled.current = true
      onDone?.()
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} frustumCulled={false} />
  )
}
