import { useGLTF, RoundedBox } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { memo, useRef, useMemo } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getToonGradientMap } from '../lib/toonGradient'
import { detectDeviceTier } from '../lib/deviceTier'
const _isLow = detectDeviceTier() === 'low'

interface Props {
  pos: [number, number, number]
  modelUrl?: string
  label?: string
  bodyColor?: string
}

function NPCImpl({ pos, modelUrl, label, bodyColor = '#ffd1e8' }: Props) {
  const bob = useRef<Group>(null!)
  const frameSkip = useRef(0)

  useFrame(({ clock }) => {
    if (_isLow && (frameSkip.current++ & 1)) return
    if (bob.current) {
      bob.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 1.8) * 0.06
    }
  })

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={pos}>
        <group ref={bob}>
          {modelUrl
            ? <GLBModel url={modelUrl} />
            : <ProceduralVendor bodyColor={bodyColor} label={label} />}
        </group>
      </RigidBody>
    </group>
  )
}

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

// ─── ToonOutline helper ───────────────────────────────────────────────────────
function ToonOutline({ args, radius = 0.07 }: { args: [number, number, number]; radius?: number }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={2} scale={1.07}>
      <meshBasicMaterial color="#0d0d0d" side={THREE.BackSide} />
    </RoundedBox>
  )
}

// ─── ProceduralVendor ─────────────────────────────────────────────────────────
function ProceduralVendor({ bodyColor, label }: { bodyColor: string; label?: string }) {
  const gradientMap = getToonGradientMap()

  // Canvas face texture for the vendor character
  const faceTexture = useMemo(() => {
    const S = 96
    const canvas = document.createElement('canvas')
    canvas.width = S; canvas.height = S
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = bodyColor
    ctx.fillRect(0, 0, S, S)
    // Eyes
    for (const ex of [28, 68]) {
      const ey = 46
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.ellipse(ex, ey, 13, 13, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#4a7ac7'
      ctx.beginPath(); ctx.ellipse(ex, ey + 1, 8, 9, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#111111'
      ctx.beginPath(); ctx.ellipse(ex + 1, ey + 1, 5, 5, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.ellipse(ex + 3, ey - 2, 2.5, 2.5, 0, 0, Math.PI * 2); ctx.fill()
    }
    // Eyebrows (slightly inward-raised = friendly)
    ctx.strokeStyle = '#7a3a1a'; ctx.lineWidth = 5; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(16, 28); ctx.lineTo(42, 31); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(54, 31); ctx.lineTo(80, 28); ctx.stroke()
    // Happy smile
    ctx.strokeStyle = '#cc3333'; ctx.lineWidth = 5; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(48, 68, 18, Math.PI + 0.35, Math.PI * 2 - 0.35); ctx.stroke()
    // Blush
    ctx.fillStyle = 'rgba(255,100,100,0.28)'
    ctx.beginPath(); ctx.ellipse(10, 64, 9, 6, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(86, 64, 9, 6, 0, 0, Math.PI * 2); ctx.fill()
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [bodyColor])

  // Canvas label badge with actual text
  const labelTexture = useMemo(() => {
    if (!label) return null
    const W = 256; const H = 56
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, W, H)
    // Badge background
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.beginPath()
    ctx.roundRect(4, 4, W - 8, H - 8, 12)
    ctx.fill()
    // White border
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(4, 4, W - 8, H - 8, 12)
    ctx.stroke()
    // Text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, W / 2, H / 2)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [label])

  return (
    <group>
      {/* ─── Floating name badge ─────────────────────────────── */}
      {labelTexture && (
        <mesh position={[0, 3.0, 0]}>
          <planeGeometry args={[1.8, 0.4]} />
          <meshBasicMaterial map={labelTexture} transparent depthWrite={false} />
        </mesh>
      )}

      {/* ─── Counter / stall ─────────────────────────────────── */}
      {/* Counter base */}
      <mesh position={[0, 0.52, 0.58]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.04, 1.05]} />
        <meshToonMaterial color="#7c5228" gradientMap={gradientMap} />
      </mesh>
      {/* Counter top slab */}
      <mesh position={[0, 1.08, 0.58]} castShadow>
        <boxGeometry args={[2.32, 0.12, 1.16]} />
        <meshToonMaterial color="#a07040" gradientMap={gradientMap} />
      </mesh>

      {/* Awning — alternating stripes */}
      {([-0.825, -0.275, 0.275, 0.825] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.84, 0.58]}>
          <boxGeometry args={[0.55, 0.07, 1.3]} />
          <meshToonMaterial
            color={i % 2 === 0 ? '#ff4455' : '#ffffff'}
            gradientMap={gradientMap}
          />
        </mesh>
      ))}
      {/* Awning front lip */}
      <mesh position={[0, 1.77, 1.2]}>
        <boxGeometry args={[2.3, 0.18, 0.08]} />
        <meshToonMaterial color="#cc2233" gradientMap={gradientMap} />
      </mesh>
      {/* Awning back rail */}
      <mesh position={[0, 1.88, 0.0]}>
        <boxGeometry args={[2.3, 0.06, 0.06]} />
        <meshToonMaterial color="#cc2233" gradientMap={gradientMap} />
      </mesh>
      {/* Support pillars */}
      {([-1.0, 1.0] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.35, 1.2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.7, 8]} />
          <meshToonMaterial color="#5a3515" gradientMap={gradientMap} />
        </mesh>
      ))}

      {/* Product on counter: glowing potion */}
      <mesh position={[0.55, 1.25, 0.5]} castShadow>
        <cylinderGeometry args={[0.13, 0.17, 0.38, 10]} />
        <meshToonMaterial color="#ff3344" emissive="#ff1122" emissiveIntensity={0.5} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0.55, 1.48, 0.5]}>
        <cylinderGeometry args={[0.055, 0.11, 0.11, 8]} />
        <meshToonMaterial color="#cc2233" gradientMap={gradientMap} />
      </mesh>
      <pointLight position={[0.55, 1.3, 0.5]} color="#ff3344" intensity={0.7} distance={2.5} />

      {/* Second product: star fruit */}
      <mesh position={[-0.5, 1.2, 0.5]} castShadow rotation={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[0.15]} />
        <meshToonMaterial color="#ffd644" emissive="#ffd644" emissiveIntensity={0.3} gradientMap={gradientMap} />
      </mesh>

      {/* ─── Vendor character ────────────────────────────────── */}
      <group position={[0, 1.12, -0.12]}>
        {/* Body */}
        <RoundedBox args={[0.75, 0.72, 0.5]} radius={0.07} smoothness={2} castShadow>
          <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
        </RoundedBox>
        <ToonOutline args={[0.75, 0.72, 0.5]} radius={0.07} />

        {/* Head */}
        <group position={[0, 0.72, 0]}>
          <RoundedBox args={[0.62, 0.58, 0.52]} radius={0.07} smoothness={2} castShadow>
            <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
          </RoundedBox>
          <ToonOutline args={[0.62, 0.58, 0.52]} radius={0.07} />

          {/* Face */}
          <mesh position={[0, 0.04, 0.268]}>
            <planeGeometry args={[0.54, 0.44]} />
            <meshToonMaterial map={faceTexture} gradientMap={gradientMap} />
          </mesh>

          {/* Cat ears */}
          <mesh position={[-0.22, 0.38, 0]} rotation={[0, 0, -0.15]} castShadow>
            <coneGeometry args={[0.1, 0.24, 4]} />
            <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.22, 0.38, 0]} rotation={[0, 0, 0.15]} castShadow>
            <coneGeometry args={[0.1, 0.24, 4]} />
            <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
          </mesh>
          {/* Inner ear detail */}
          <mesh position={[-0.22, 0.38, 0.05]} rotation={[0, 0, -0.15]}>
            <coneGeometry args={[0.055, 0.14, 4]} />
            <meshToonMaterial color="#ff9eb5" gradientMap={gradientMap} />
          </mesh>
          <mesh position={[0.22, 0.38, 0.05]} rotation={[0, 0, 0.15]}>
            <coneGeometry args={[0.055, 0.14, 4]} />
            <meshToonMaterial color="#ff9eb5" gradientMap={gradientMap} />
          </mesh>
        </group>

        {/* Arms (short, raised slightly like "welcoming") */}
        <group position={[-0.45, 0.12, 0]} rotation={[0, 0, 0.5]}>
          <RoundedBox args={[0.22, 0.45, 0.22]} radius={0.06} smoothness={2} position={[0, -0.22, 0]} castShadow>
            <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
          </RoundedBox>
          {/* Hand */}
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshToonMaterial color="#ffb8cc" gradientMap={gradientMap} />
          </mesh>
        </group>
        <group position={[0.45, 0.12, 0]} rotation={[0, 0, -0.5]}>
          <RoundedBox args={[0.22, 0.45, 0.22]} radius={0.06} smoothness={2} position={[0, -0.22, 0]} castShadow>
            <meshToonMaterial color={bodyColor} gradientMap={gradientMap} />
          </RoundedBox>
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshToonMaterial color="#ffb8cc" gradientMap={gradientMap} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
