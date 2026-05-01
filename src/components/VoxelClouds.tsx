import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Group } from 'three'

interface CloudDef {
  ox: number
  y: number
  oz: number
  scale: number
  drift: number
  sizeVar: number
  driftPhase: number
}

const CLOUDS: CloudDef[] = [
  { ox: -30, y: 22, oz: -20, scale: 2.0, drift: 0.4, sizeVar: 1.0, driftPhase: 0.0 },
  { ox:  35, y: 26, oz: -35, scale: 2.4, drift: 0.3, sizeVar: 1.3, driftPhase: 0.7 },
  { ox: -10, y: 20, oz:  50, scale: 1.6, drift: 0.5, sizeVar: 1.6, driftPhase: 1.4 },
  { ox:  50, y: 24, oz:  10, scale: 2.1, drift: 0.35, sizeVar: 1.1, driftPhase: 2.1 },
  { ox: -45, y: 28, oz:  25, scale: 1.8, drift: 0.45, sizeVar: 1.4, driftPhase: 2.8 },
  { ox:   5, y: 30, oz:  60, scale: 2.2, drift: 0.3, sizeVar: 1.2, driftPhase: 3.5 },
  { ox: -60, y: 21, oz:  -5, scale: 1.5, drift: 0.5, sizeVar: 1.5, driftPhase: 4.2 },
  { ox:  20, y: 25, oz: -60, scale: 1.9, drift: 0.4, sizeVar: 1.2, driftPhase: 4.9 },
  { ox: -20, y: 23, oz:  40, scale: 2.3, drift: 0.35, sizeVar: 1.0, driftPhase: 5.6 },
  { ox:  60, y: 27, oz: -40, scale: 1.7, drift: 0.45, sizeVar: 1.3, driftPhase: 0.3 },
  { ox: -55, y: 29, oz:  55, scale: 2.0, drift: 0.3, sizeVar: 1.5, driftPhase: 1.1 },
  { ox:  40, y: 22, oz:  45, scale: 1.6, drift: 0.5, sizeVar: 1.1, driftPhase: 1.8 },
]

// 5 boxes per cloud, baked positions/sizes — merged into 1 geometry = 1 draw call per cloud
const BLOCK_DEFS: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
  { pos: [0, 0, 0],         size: [3, 1.2, 1.8] },
  { pos: [1.8, 0.3, 0],    size: [1.6, 1, 1.5] },
  { pos: [-1.6, 0.1, 0.2], size: [1.5, 0.9, 1.4] },
  { pos: [0.5, 0.8, 0.2],  size: [1.3, 0.8, 1.1] },
  { pos: [-0.6, -0.4, -0.3], size: [1.2, 0.6, 1.0] },
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
    float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)) * 4.0;
    float alpha = smoothstep(0.0, 1.0, edge) * 0.82;
    float pulse = sin(iTime * 0.28 + vWorldPos.x * 0.1) * 0.04 + 1.0;
    alpha *= pulse;
    vec3 col = mix(vec3(0.94, 0.96, 1.0), vec3(1.0), vUv.y * 0.3);
    gl_FragColor = vec4(col, alpha);
  }
`

export default function VoxelClouds() {
  const root = useRef<Group>(null!)
  const sharedUniforms = useMemo(() => ({ iTime: { value: 0 } }), [])
  const { camera } = useThree()

  // Merged geometry shared by all clouds (same shape, different group scale/pos)
  const mergedGeo = useMemo(() => {
    const geos = BLOCK_DEFS.map(b => {
      const g = new THREE.BoxGeometry(...b.size)
      g.translate(...b.pos)
      return g
    })
    const merged = mergeGeometries(geos)
    geos.forEach(g => g.dispose())
    return merged
  }, [])

  useFrame((state) => {
    if (!root.current) return
    const t = state.clock.elapsedTime
    sharedUniforms.iTime.value = t
    const cx = camera.position.x
    const cz = camera.position.z

    root.current.children.forEach((child, i) => {
      const def = CLOUDS[i]
      if (!def) return
      child.position.x = cx + def.ox + Math.sin(t * 0.05 + def.driftPhase) * 7 * def.drift
      child.position.y = def.y + Math.sin(t * 0.14 + def.driftPhase) * 0.5
      child.position.z = cz + def.oz
    })
  })

  return (
    <group ref={root}>
      {CLOUDS.map((c, i) => (
        <group key={i} scale={c.scale * c.sizeVar}>
          <mesh geometry={mergedGeo}>
            <shaderMaterial
              vertexShader={cloudVertexShader}
              fragmentShader={cloudFragmentShader}
              uniforms={sharedUniforms}
              transparent
              depthWrite={false}
              side={THREE.FrontSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
