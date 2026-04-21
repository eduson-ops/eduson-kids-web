import { useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

type Controls = {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  jump: boolean
}

interface Props {
  color?: string
  startPos?: [number, number, number]
}

const SPEED = 7
const GRAVITY = 22
const JUMP_VY = 9
const GROUND_Y = 0.5

// Простой character controller без физ-библиотеки.
// Движение в плоскости камеры (forward = куда смотрит камера).
// Прыжок — вертикальная скорость + gravity, ground = y<=GROUND_Y.
// Этого достаточно для MVP 3D-демо. Коллизии с препятствиями — Stage 2 (Rapier).
export default function Player({ color = '#ff5ab1', startPos = [0, GROUND_Y, 0] }: Props) {
  const body = useRef<THREE.Group>(null!)
  const [, get] = useKeyboardControls<keyof Controls>()
  const { camera } = useThree()

  const velY = useRef(0)
  const onGround = useRef(true)
  const facing = useRef(new THREE.Vector3(0, 0, -1))

  useFrame((_, dt) => {
    if (!body.current) return
    const { forward, back, left, right, jump } = get()

    // Направление от камеры в плоскости XZ
    const camDir = new THREE.Vector3()
    camera.getWorldDirection(camDir)
    camDir.y = 0
    camDir.normalize()
    const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0))

    const move = new THREE.Vector3()
    if (forward) move.add(camDir)
    if (back) move.addScaledVector(camDir, -1)
    if (right) move.add(camRight)
    if (left) move.addScaledVector(camRight, -1)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(SPEED * dt)
      body.current.position.x += move.x
      body.current.position.z += move.z
      facing.current.copy(move).normalize()
      // Плавный поворот
      const targetAngle = Math.atan2(facing.current.x, facing.current.z)
      body.current.rotation.y = lerpAngle(body.current.rotation.y, targetAngle, 0.2)
    }

    // Прыжок
    if (jump && onGround.current) {
      velY.current = JUMP_VY
      onGround.current = false
    }
    velY.current -= GRAVITY * dt
    body.current.position.y += velY.current * dt
    if (body.current.position.y <= GROUND_Y) {
      body.current.position.y = GROUND_Y
      velY.current = 0
      onGround.current = true
    }

    // Границы (мягкие)
    const p = body.current.position
    p.x = Math.max(-9, Math.min(9, p.x))
    p.z = Math.max(-28, Math.min(10, p.z))

    // Камера — от третьего лица, плавно следует
    const desiredCam = new THREE.Vector3(
      p.x - camDir.x * 7,
      p.y + 4,
      p.z - camDir.z * 7
    )
    camera.position.lerp(desiredCam, 0.08)
    camera.lookAt(p.x, p.y + 0.5, p.z)
  })

  return (
    <group ref={body} position={startPos}>
      {/* Тело */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Голова */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Глаза (точки) */}
      <mesh position={[-0.15, 1.0, 0.36]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      <mesh position={[0.15, 1.0, 0.36]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Уши */}
      <mesh position={[-0.25, 1.4, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.12, 0.3, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.25, 1.4, 0]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.12, 0.3, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

function lerpAngle(a: number, b: number, t: number) {
  const diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  return a + diff * t
}
