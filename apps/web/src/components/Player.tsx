import { useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Avatar } from '../lib/avatars'
import AvatarModel from './AvatarModel'
import type { AvatarModelHandle } from './AvatarModel'
import { SFX } from '../lib/audio'

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
const CAP_HEIGHT = 0.5
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
  const desiredRotY = useRef(0)
  const prevGrounded = useRef(true)
  const footstepTimer = useRef(0)

  const startVec = new THREE.Vector3(...startPos)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__ekCam) {
      window.__ekCam = { yaw: 0, pitch: -0.2, locked: false }
    }
  }, [])

  useFrame((_, dt) => {
    if (!body.current) return
    const { forward, back, left, right, jump } = get()

    // Yaw/pitch берутся из CameraController (pointer-lock) или 0 если нет
    const cam = window.__ekCam ?? { yaw: 0, pitch: -0.2, locked: false }

    // Forward-вектор в плоскости XZ, задан yaw камеры
    const sinY = Math.sin(cam.yaw)
    const cosY = Math.cos(cam.yaw)
    const camFwd = new THREE.Vector3(-sinY, 0, -cosY)
    const camRight = new THREE.Vector3(cosY, 0, -sinY)

    const move = new THREE.Vector3()
    if (forward) move.add(camFwd)
    if (back) move.addScaledVector(camFwd, -1)
    if (right) move.add(camRight)
    if (left) move.addScaledVector(camRight, -1)

    const curVel = body.current.linvel()
    let vx = curVel.x
    let vz = curVel.z
    if (move.lengthSq() > 0) {
      move.normalize()
      vx = move.x * SPEED
      vz = move.z * SPEED
      desiredRotY.current = Math.atan2(move.x, move.z)
    } else {
      vx *= 0.8
      vz *= 0.8
    }

    // Grounded ray
    const pos = body.current.translation()
    const rayOrigin = { x: pos.x, y: pos.y - (CAP_HEIGHT + CAP_RADIUS) + 0.05, z: pos.z }
    const rayDir = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    const hit = world.castRay(ray, 0.25, true, undefined, undefined, undefined, body.current)
    const grounded = hit !== null

    // Звук приземления
    if (grounded && !prevGrounded.current && curVel.y < -3) {
      SFX.land()
    }
    prevGrounded.current = grounded

    if (jump && grounded) {
      body.current.setLinvel({ x: vx, y: JUMP, z: vz }, true)
      SFX.jump()
    } else {
      body.current.setLinvel({ x: vx, y: curVel.y, z: vz }, true)
    }

    // Поворот визуала
    if (meshGroup.current) {
      meshGroup.current.rotation.y = lerpAngle(
        meshGroup.current.rotation.y,
        desiredRotY.current,
        0.2
      )
    }

    // Анимация + шаги
    const speed2D = Math.hypot(vx, vz)
    phase.current += dt * Math.max(3, speed2D * 2)
    idlePhase.current += dt * 2
    visual.current?.update({
      speed: speed2D,
      phase: phase.current,
      airborne: !grounded && Math.abs(curVel.y) > 0.3,
      idlePhase: idlePhase.current,
    })

    if (grounded && speed2D > 1) {
      footstepTimer.current += dt * speed2D
      if (footstepTimer.current > 3.2) {
        footstepTimer.current = 0
        SFX.step()
      }
    } else {
      footstepTimer.current = 0
    }

    // Камера: orbit за персонажем. Distance 7, high 4, углы yaw/pitch
    const dist = 7
    const camHeight = 4
    const pitchY = Math.sin(cam.pitch) * dist * 0.6
    const pitchDist = Math.cos(cam.pitch) * dist

    const desiredCam = new THREE.Vector3(
      pos.x - camFwd.x * pitchDist,
      pos.y + camHeight + pitchY,
      pos.z - camFwd.z * pitchDist
    )
    camera.position.lerp(desiredCam, cam.locked ? 0.18 : 0.08)
    camera.lookAt(pos.x, pos.y + 0.5, pos.z)

    // Respawn
    if (pos.y < -20) {
      body.current.setTranslation({ x: startVec.x, y: startVec.y + 2, z: startVec.z }, true)
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
  })

  return (
    <RigidBody
      ref={body}
      name="player"
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
