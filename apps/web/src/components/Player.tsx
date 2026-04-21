import { useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Avatar } from '../lib/avatars'
import AvatarModel from './AvatarModel'
import type { AvatarModelHandle } from './AvatarModel'

type Controls = {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  jump: boolean
}

interface Props {
  avatar: Avatar
  startPos?: [number, number, number]
}

const SPEED = 7
const JUMP = 10
const CAP_HEIGHT = 0.5 // половина высоты капсулы (без сфер)
const CAP_RADIUS = 0.45

export default function Player({ avatar, startPos = [0, 3, 6] }: Props) {
  const body = useRef<RapierRigidBody>(null!)
  const visual = useRef<AvatarModelHandle>(null!)
  const meshGroup = useRef<THREE.Group>(null!)
  const [, get] = useKeyboardControls<keyof Controls>()
  const { camera } = useThree()
  const { rapier, world } = useRapier()

  const phase = useRef(0)
  const idlePhase = useRef(0)
  const facing = useRef(new THREE.Vector3(0, 0, -1))
  const desiredRotY = useRef(0)

  // На всякий: если персонаж выпал за пределы — телепортируем обратно
  const startVec = new THREE.Vector3(...startPos)

  useEffect(() => {
    // Стартовая камера — сразу за игроком
    camera.position.set(startPos[0], startPos[1] + 4, startPos[2] + 8)
    camera.lookAt(startPos[0], startPos[1], startPos[2])
  }, [camera, startPos])

  useFrame((_, dt) => {
    if (!body.current) return
    const { forward, back, left, right, jump } = get()

    // Направления камеры в плоскости
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

    const curVel = body.current.linvel()
    let vx = curVel.x
    let vz = curVel.z
    if (move.lengthSq() > 0) {
      move.normalize()
      vx = move.x * SPEED
      vz = move.z * SPEED
      facing.current.copy(move)
      desiredRotY.current = Math.atan2(move.x, move.z)
    } else {
      // трение в воздухе поменьше, на земле — почти полная остановка
      vx *= 0.8
      vz *= 0.8
    }

    // Проверка "на земле" — raycast вниз
    const pos = body.current.translation()
    const rayOrigin = { x: pos.x, y: pos.y - (CAP_HEIGHT + CAP_RADIUS) + 0.05, z: pos.z }
    const rayDir = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    const hit = world.castRay(ray, 0.25, true, undefined, undefined, undefined, body.current)
    const grounded = hit !== null

    if (jump && grounded) {
      body.current.setLinvel({ x: vx, y: JUMP, z: vz }, true)
    } else {
      body.current.setLinvel({ x: vx, y: curVel.y, z: vz }, true)
    }

    // Поворот визуала плавно
    if (meshGroup.current) {
      meshGroup.current.rotation.y = lerpAngle(
        meshGroup.current.rotation.y,
        desiredRotY.current,
        0.2
      )
    }

    // Анимация
    const speed2D = Math.hypot(vx, vz)
    phase.current += dt * Math.max(3, speed2D * 2)
    idlePhase.current += dt * 2
    visual.current?.update({
      speed: speed2D,
      phase: phase.current,
      airborne: !grounded && Math.abs(curVel.y) > 0.3,
      idlePhase: idlePhase.current,
    })

    // Камера follow
    const desiredCam = new THREE.Vector3(
      pos.x - camDir.x * 7,
      pos.y + 4,
      pos.z - camDir.z * 7
    )
    camera.position.lerp(desiredCam, 0.08)
    camera.lookAt(pos.x, pos.y + 0.5, pos.z)

    // Respawn если упал в бездну
    if (pos.y < -20) {
      body.current.setTranslation({ x: startVec.x, y: startVec.y + 2, z: startVec.z }, true)
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <RigidBody
      ref={body}
      type="dynamic"
      colliders={false}
      position={startPos}
      enabledRotations={[false, false, false]}
      linearDamping={0.1}
      mass={1}
    >
      <CapsuleCollider args={[CAP_HEIGHT, CAP_RADIUS]} friction={0.8} />
      <group ref={meshGroup} position={[0, -CAP_HEIGHT - CAP_RADIUS, 0]}>
        <AvatarModel ref={visual} avatar={avatar} />
      </group>
    </RigidBody>
  )
}

function lerpAngle(a: number, b: number, t: number) {
  const diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  return a + diff * t
}
