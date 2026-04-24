import { useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Avatar } from '../lib/avatars'
import AvatarModel from './AvatarModel'
import PlayerCharacter, { type PlayerVisualHandle } from './PlayerCharacter'
import Penguin3D from '../design/mascot/Penguin3D'
import { SFX } from '../lib/audio'

type Controls = {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
}

interface Props {
  avatar: Avatar
  startPos?: [number, number, number]
}

const SPEED = 7
const SPEED_SPRINT = 12
// P-07: tuned for arcier feel — higher peak, punchier fall.
const JUMP = 9
const AIR_JUMP = 7
const FALL_GRAVITY_MULT = 1.5    // во время падения добавочная гравитация поверх world-gravity
const WORLD_GRAVITY = 25         // абсолютное значение g, должно матчить <Physics gravity={[0,-25,0]}>
const CAP_HEIGHT = 0.5
const CAP_RADIUS = 0.45

// ─── Feel tuning ────────────────────────────────────────
const COYOTE_TIME = 0.12         // сек после схода с края — прыжок ещё работает
const JUMP_BUFFER = 0.15         // сек до приземления — нажатие jump всё равно сработает
const VAR_JUMP_CUT = 0.5         // множитель для short-hop (release jump при подъёме)
const VAR_JUMP_MIN_Y = 4         // минимум vy для cut-off (не ниже — полноценный прыжок)
const AIR_CONTROL = 0.4          // множитель реакции управления в воздухе
const GROUND_ACCEL = 15          // быстрота набора целевой скорости (lerp-rate)
const CAM_STIFFNESS = 120        // пружина камеры (k)
const CAM_DAMPING = 14           // демпфер камеры (c)  — слегка underdamped для живости

export default function Player({ avatar, startPos = [0, 3, 6] }: Props) {
  const body = useRef<RapierRigidBody>(null!)
  const visual = useRef<PlayerVisualHandle>(null!)
  const meshGroup = useRef<THREE.Group>(null!)
  const [, get] = useKeyboardControls<keyof Controls>()
  const { camera } = useThree()
  const { rapier, world } = useRapier()

  // Numeric per-frame state
  const phase = useRef(0)
  const idlePhase = useRef(0)
  const desiredRotY = useRef(0)
  const prevGrounded = useRef(true)
  const footstepTimer = useRef(0)
  const airJumps = useRef(0)
  const prevJump = useRef(false)
  const pendingRespawn = useRef(false)
  const coyoteTimer = useRef(0)
  const jumpBufferTimer = useRef(0)
  // P-04: фиксируем кадр, на котором стартовал прыжок, чтобы jump-cut
  // не срабатывал на том же кадре, когда release пришёл одновременно с press.
  const justJumped = useRef(false)
  const shakeTimer = useRef(0)
  const shakeTotal = useRef(0)
  const shakeIntensity = useRef(0)

  // Hoisted Vector3s — аллоцируются один раз, reuse через .set()
  const vCamFwd = useRef(new THREE.Vector3())
  const vCamRight = useRef(new THREE.Vector3())
  const vMove = useRef(new THREE.Vector3())
  const vDesiredCam = useRef(new THREE.Vector3())
  const vStart = useRef(new THREE.Vector3(startPos[0], startPos[1], startPos[2]))
  const vCamVel = useRef(new THREE.Vector3())   // velocity спринг-системы камеры

  useEffect(() => {
    vStart.current.set(startPos[0], startPos[1], startPos[2])
  }, [startPos])

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__ekCam) {
      window.__ekCam = { yaw: 0, pitch: -0.2, locked: false }
    }
    const onHit = () => { pendingRespawn.current = true }
    const onShake = (e: Event) => {
      const detail = (e as CustomEvent).detail as { intensity?: number; duration?: number } | undefined
      if (!detail) return
      const intensity = Math.max(0, Math.min(1.5, detail.intensity ?? 0.3))
      const duration = Math.max(0.05, Math.min(2.0, detail.duration ?? 0.3))
      shakeIntensity.current = Math.max(shakeIntensity.current, intensity)
      shakeTotal.current = duration
      shakeTimer.current = duration
    }
    // Python-team-управление (из ScriptTab → commandBus → TestTab → events)
    const onMove = (e: Event) => {
      if (!body.current) return
      const { dx = 0, dz = 0 } = (e as CustomEvent).detail ?? {}
      const t = body.current.translation()
      body.current.setTranslation({ x: t.x + dx, y: t.y, z: t.z + dz }, true)
    }
    const onTurn = (e: Event) => {
      const { degrees = 0 } = (e as CustomEvent).detail ?? {}
      desiredRotY.current += (Number(degrees) * Math.PI) / 180
    }
    const onJump = () => {
      if (!body.current) return
      const v = body.current.linvel()
      body.current.setLinvel({ x: v.x, y: JUMP, z: v.z }, true)
    }
    window.addEventListener('ek:enemy-hit', onHit)
    window.addEventListener('ek:shake', onShake)
    window.addEventListener('ek:player-move', onMove)
    window.addEventListener('ek:player-turn', onTurn)
    window.addEventListener('ek:player-jump', onJump)
    return () => {
      window.removeEventListener('ek:enemy-hit', onHit)
      window.removeEventListener('ek:shake', onShake)
      window.removeEventListener('ek:player-move', onMove)
      window.removeEventListener('ek:player-turn', onTurn)
      window.removeEventListener('ek:player-jump', onJump)
    }
  }, [])

  useFrame((_, dt) => {
    if (!body.current) return
    const { forward, back, left, right, jump, sprint } = get()

    // Camera yaw/pitch из CameraController (pointer-lock) или 0
    const cam = window.__ekCam ?? { yaw: 0, pitch: -0.2, locked: false }
    const sinY = Math.sin(cam.yaw)
    const cosY = Math.cos(cam.yaw)
    vCamFwd.current.set(-sinY, 0, -cosY)
    vCamRight.current.set(cosY, 0, -sinY)

    // Build move direction (reuse vMove)
    vMove.current.set(0, 0, 0)
    if (forward) vMove.current.add(vCamFwd.current)
    if (back) vMove.current.addScaledVector(vCamFwd.current, -1)
    if (right) vMove.current.add(vCamRight.current)
    if (left) vMove.current.addScaledVector(vCamRight.current, -1)

    const curVel = body.current.linvel()
    let vx = curVel.x
    let vz = curVel.z
    let vy = curVel.y
    const topSpeed = sprint ? SPEED_SPRINT : SPEED

    // Grounded raycast (тянем из позиции капсулы чуть ниже подошвы)
    const pos = body.current.translation()
    const rayOrigin = { x: pos.x, y: pos.y - (CAP_HEIGHT + CAP_RADIUS) + 0.05, z: pos.z }
    const rayDir = { x: 0, y: -1, z: 0 }
    const ray = new rapier.Ray(rayOrigin, rayDir)
    const hit = world.castRay(ray, 0.25, true, undefined, undefined, undefined, body.current)
    const grounded = hit !== null

    // Coyote time: "подарочная" секунда после схода с края
    if (grounded) {
      coyoteTimer.current = COYOTE_TIME
      if (!prevGrounded.current) {
        if (curVel.y < -3) SFX.land()
        airJumps.current = 0
      }
    } else {
      coyoteTimer.current = Math.max(0, coyoteTimer.current - dt)
    }

    // Jump buffer + edge-trigger на release для variable-height
    const jumpPressed = jump && !prevJump.current
    const jumpReleased = !jump && prevJump.current
    if (jumpPressed) {
      jumpBufferTimer.current = JUMP_BUFFER
    } else {
      jumpBufferTimer.current = Math.max(0, jumpBufferTimer.current - dt)
    }

    // Target горизонтальная скорость от ввода (no alloc — just scalars)
    let targetVx = 0
    let targetVz = 0
    const inputLen2 = vMove.current.lengthSq()
    if (inputLen2 > 0) {
      vMove.current.normalize()
      targetVx = vMove.current.x * topSpeed
      targetVz = vMove.current.z * topSpeed
      desiredRotY.current = Math.atan2(vMove.current.x, vMove.current.z)
    }

    // Air-control blending: на земле быстро, в воздухе мягче
    const control = grounded ? 1.0 : AIR_CONTROL
    if (inputLen2 > 0) {
      const blend = Math.min(1, dt * GROUND_ACCEL * control)
      vx += (targetVx - vx) * blend
      vz += (targetVz - vz) * blend
    } else if (grounded) {
      // Без ввода на земле: трение
      vx *= 0.8
      vz *= 0.8
    } else {
      // Без ввода в воздухе: почти сохраняем импульс
      vx *= 0.99
      vz *= 0.99
    }

    // Jump execution (buffered + coyote + double-jump)
    let jumpedThisFrame = false
    if (jumpBufferTimer.current > 0) {
      if (coyoteTimer.current > 0) {
        vy = JUMP
        coyoteTimer.current = 0
        jumpBufferTimer.current = 0
        jumpedThisFrame = true
        SFX.jump()
      } else if (airJumps.current < 1) {
        airJumps.current++
        vy = AIR_JUMP
        jumpBufferTimer.current = 0
        jumpedThisFrame = true
        SFX.jump()
      }
    }

    // Variable-height jump: отпустил Space при подъёме — short hop.
    // P-04 fix: не режем, если прыжок стартовал на этом же кадре (justJumped) —
    // иначе буферизованный press+release за один кадр убивает полный прыжок.
    if (jumpReleased && vy > VAR_JUMP_MIN_Y && !justJumped.current && !jumpedThisFrame) {
      vy *= VAR_JUMP_CUT
    }
    // grace-period: одна frame задержка перед тем, как jump-cut разрешён
    justJumped.current = jumpedThisFrame

    // P-07: punchier fall — дополнительная гравитация во время опускания (vy < 0).
    // World уже тянет вниз с WORLD_GRAVITY; добавляем (mult-1) сверху.
    if (!grounded && vy < 0) {
      vy -= WORLD_GRAVITY * (FALL_GRAVITY_MULT - 1) * dt
    }

    body.current.setLinvel({ x: vx, y: vy, z: vz }, true)

    prevJump.current = jump
    prevGrounded.current = grounded

    // Вращение визуала
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

    // ─── Camera: spring-damped follow ──────────────────
    const dist = 5.5
    const camHeight = 2.5
    const pitchY = Math.sin(cam.pitch) * dist * 0.6
    const pitchDist = Math.cos(cam.pitch) * dist

    vDesiredCam.current.set(
      pos.x - vCamFwd.current.x * pitchDist,
      pos.y + camHeight + pitchY,
      pos.z - vCamFwd.current.z * pitchDist
    )

    // Per-axis spring integration: a = k*(target-p) - c*v ; v += a*dt ; p += v*dt
    // Clamp dt для стабильности при лагах
    const dtC = Math.min(dt, 1 / 30)
    const diffX = vDesiredCam.current.x - camera.position.x
    const diffY = vDesiredCam.current.y - camera.position.y
    const diffZ = vDesiredCam.current.z - camera.position.z
    vCamVel.current.x += (CAM_STIFFNESS * diffX - CAM_DAMPING * vCamVel.current.x) * dtC
    vCamVel.current.y += (CAM_STIFFNESS * diffY - CAM_DAMPING * vCamVel.current.y) * dtC
    vCamVel.current.z += (CAM_STIFFNESS * diffZ - CAM_DAMPING * vCamVel.current.z) * dtC
    camera.position.x += vCamVel.current.x * dtC
    camera.position.y += vCamVel.current.y * dtC
    camera.position.z += vCamVel.current.z * dtC

    // Screen-shake (линейный decay от 1 к 0)
    if (shakeTimer.current > 0) {
      shakeTimer.current = Math.max(0, shakeTimer.current - dt)
      const t = shakeTotal.current > 0 ? shakeTimer.current / shakeTotal.current : 0
      const mag = shakeIntensity.current * t
      camera.position.x += (Math.random() - 0.5) * mag * 2
      camera.position.y += (Math.random() - 0.5) * mag * 2
      if (shakeTimer.current === 0) shakeIntensity.current = 0
    }

    camera.lookAt(pos.x, pos.y + 0.5, pos.z)

    // Экспозиция позиции игрока глобально — читают миры-песочницы
    // для механик (pet follow, ability aim, ownership proximity и т.д.)
    if (typeof window !== 'undefined') {
      const w = window as unknown as { __ekPlayerPos?: { x: number; y: number; z: number } }
      w.__ekPlayerPos = { x: pos.x, y: pos.y, z: pos.z }
    }

    // Respawn: падение в pit или удар врага
    if (pos.y < -20 || pendingRespawn.current) {
      pendingRespawn.current = false
      airJumps.current = 0
      coyoteTimer.current = 0
      jumpBufferTimer.current = 0
      vCamVel.current.set(0, 0, 0)
      body.current.setTranslation(
        { x: vStart.current.x, y: vStart.current.y + 2, z: vStart.current.z },
        true
      )
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
        {(!avatar.character || avatar.character === 'penguin') ? (
          <Penguin3D ref={visual} />
        ) : avatar.character !== 'custom' ? (
          <PlayerCharacter ref={visual} which={avatar.character} />
        ) : (
          <AvatarModel ref={visual} avatar={avatar} />
        )}
      </group>
    </RigidBody>
  )
}

function lerpAngle(a: number, b: number, t: number) {
  const diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  return a + diff * t
}
