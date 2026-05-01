import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'

interface CloudDef {
  x: number
  y: number
  z: number
  scale: number
  drift: number
  /** random scale multiplier 1.0–1.6 baked at definition time */
  sizeVar: number
}

const CLOUDS: CloudDef[] = [
  { x: -30, y: 22, z: -20, scale: 2.0, drift: 0.4, sizeVar: 1.0 },
  { x: 35, y: 26, z: -35, scale: 2.4, drift: 0.3, sizeVar: 1.3 },
  { x: -10, y: 20, z: -50, scale: 1.6, drift: 0.5, sizeVar: 1.6 },
  { x: 50, y: 24, z: 10, scale: 2.1, drift: 0.35, sizeVar: 1.1 },
  { x: -45, y: 28, z: 25, scale: 1.8, drift: 0.45, sizeVar: 1.4 },
  { x: 5, y: 30, z: 60, scale: 2.2, drift: 0.3, sizeVar: 1.2 },
  { x: -60, y: 21, z: -5, scale: 1.5, drift: 0.5, sizeVar: 1.5 },
]

const cloudVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cloudFragmentShader = /* glsl */ `
  uniform float iTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    // Soft edge fade
    float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)) * 4.0;
    float alpha = smoothstep(0.0, 1.0, edge) * 0.85;

    // Gentle breathing pulse
    float pulse = sin(iTime * 0.3 + vWorldPos.x * 0.1) * 0.05 + 1.0;
    alpha *= pulse;

    // Slightly blue-white at bottom, pure white at top
    vec3 col = mix(vec3(0.95, 0.97, 1.0), vec3(1.0), vUv.y * 0.3);

    gl_FragColor = vec4(col, alpha);
  }
`

/**
 * Voxel-pixel облака — композиция кубов с мягкими краями через кастомный шейдер.
 * Soft fade на UV-границах, лёгкое «дыхание» через iTime, слегка варьированный размер.
 */
export default function VoxelClouds() {
  const root = useRef<Group>(null!)
  const timeRef = useRef(0)

  // Shared uniforms object — all cloud materials share the same iTime ref
  const sharedUniforms = useMemo(() => ({ iTime: { value: 0 } }), [])

  useFrame((state) => {
    if (!root.current) return
    const t = state.clock.elapsedTime
    timeRef.current = t
    sharedUniforms.iTime.value = t

    root.current.children.forEach((child, i) => {
      const def = CLOUDS[i]
      if (!def) return
      child.position.x = def.x + Math.sin(t * 0.05 + i) * 6 * def.drift
      child.position.y = def.y + Math.sin(t * 0.15 + i * 0.8) * 0.4
    })
  })

  return (
    <group ref={root}>
      {CLOUDS.map((c, i) => (
        <Cloud key={i} scale={c.scale * c.sizeVar} uniforms={sharedUniforms} />
      ))}
    </group>
  )
}

interface CloudProps {
  scale: number
  uniforms: { iTime: { value: number } }
}

function Cloud({ scale, uniforms }: CloudProps) {
  const blocks = useMemo<
    Array<{ pos: [number, number, number]; size: [number, number, number] }>
  >(
    () => [
      { pos: [0, 0, 0], size: [3, 1.2, 1.8] },
      { pos: [1.8, 0.3, 0], size: [1.6, 1, 1.5] },
      { pos: [-1.6, 0.1, 0.2], size: [1.5, 0.9, 1.4] },
      { pos: [0.5, 0.8, 0.2], size: [1.3, 0.8, 1.1] },
      { pos: [-0.6, -0.4, -0.3], size: [1.2, 0.6, 1.0] },
    ],
    []
  )

  return (
    <group scale={[scale, scale, scale]}>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <shaderMaterial
            vertexShader={cloudVertexShader}
            fragmentShader={cloudFragmentShader}
            uniforms={uniforms}
            transparent={true}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      ))}
    </group>
  )
}
