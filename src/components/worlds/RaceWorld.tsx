import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import Coin from '../Coin'
import GoalTrigger from '../GoalTrigger'
import { ParkedCar, Tree } from '../Scenery'
import GradientSky from '../GradientSky'

// ─── Neon lane-marking dash ────────────────────────────────────────────────

const laneDashVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const laneDashFrag = `
  uniform float iTime;
  varying vec2 vUv;
  void main() {
    float chase = mod(iTime * 0.5 + vUv.y * 4.0, 1.0);
    vec3 col = chase > 0.5 ? vec3(1.0, 1.0, 1.0) : vec3(0.0, 1.0, 1.0);
    gl_FragColor = vec4(col, 0.8);
  }
`

interface LaneDashProps {
  position: [number, number, number]
  timeRef: React.MutableRefObject<number>
}

function LaneDash({ position, timeRef }: LaneDashProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({ iTime: { value: 0 } }),
    []
  )

  useFrame(() => {
    if (matRef.current) {
      matRef.current.uniforms['iTime']!.value = timeRef.current
    }
  })

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
    >
      <planeGeometry args={[0.15, 1.5]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={laneDashVert}
        fragmentShader={laneDashFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Wind line ─────────────────────────────────────────────────────────────

interface WindLineData {
  x: number
  y: number
  z: number
}

function WindLines() {
  const groupRef = useRef<THREE.Group>(null)

  // Pre-compute stable random positions for 20 wind lines
  const lines = useMemo<WindLineData[]>(() => {
    const data: WindLineData[] = []
    const seed = [
      0.12, 0.87, 0.34, 0.65, 0.21, 0.78, 0.45, 0.93, 0.07, 0.56,
      0.39, 0.71, 0.18, 0.83, 0.52, 0.29, 0.67, 0.44, 0.96, 0.03,
    ]
    for (let i = 0; i < 20; i++) {
      const s = seed[i] ?? 0.5
      data.push({
        x: (s - 0.5) * 24,        // spread -12 to +12
        y: 0.5 + s * 2.5,         // 0.5-3m above ground
        z: -s * 70,               // spread along track
      })
    }
    return data
  }, [])

  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((_state, delta) => {
    meshRefs.current.forEach((mesh) => {
      if (!mesh) return
      mesh.position.z += delta * 15
      if (mesh.position.z > 6) {
        mesh.position.z -= 80
      }
    })
  })

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={[line.x, line.y, line.z]}
        >
          <boxGeometry args={[0.02, 0.02, 3.0]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Checkered finish shader ───────────────────────────────────────────────

const checkerVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const checkerFrag = `
  varying vec2 vUv;
  void main() {
    float check = mod(floor(vUv.x * 8.0) + floor(vUv.y * 8.0), 2.0);
    vec3 col = check > 0.5 ? vec3(1.0) : vec3(0.0);
    gl_FragColor = vec4(col, 1.0);
  }
`

function CheckeredFinish() {
  const uniforms = useMemo(() => ({}), [])

  return (
    <group position={[0, 0.05, -70]}>
      {/* Checkered surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 2]} />
        <shaderMaterial
          vertexShader={checkerVert}
          fragmentShader={checkerFrag}
          uniforms={uniforms}
          depthWrite={false}
        />
      </mesh>
      {/* Gold frame — left bar */}
      <mesh position={[-7.2, 0.5, 0]}>
        <boxGeometry args={[0.25, 1.0, 2.1]} />
        <meshStandardMaterial color="#ffd700" emissive="#cc8800" emissiveIntensity={0.6} />
      </mesh>
      {/* Gold frame — right bar */}
      <mesh position={[7.2, 0.5, 0]}>
        <boxGeometry args={[0.25, 1.0, 2.1]} />
        <meshStandardMaterial color="#ffd700" emissive="#cc8800" emissiveIntensity={0.6} />
      </mesh>
      {/* Gold frame — front edge */}
      <mesh position={[0, 0.08, 1.05]}>
        <boxGeometry args={[14.5, 0.16, 0.1]} />
        <meshStandardMaterial color="#ffd700" emissive="#cc8800" emissiveIntensity={0.8} />
      </mesh>
      {/* Gold frame — back edge */}
      <mesh position={[0, 0.08, -1.05]}>
        <boxGeometry args={[14.5, 0.16, 0.1]} />
        <meshStandardMaterial color="#ffd700" emissive="#cc8800" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

// ─── Wet-road sheen ────────────────────────────────────────────────────────

const sheenVert = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const sheenFrag = `
  uniform float iTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
    vec3 viewDir  = normalize(cameraPosition - vWorldPos);
    vec3 refl     = reflect(-viewDir, vNormal);
    float spec    = pow(max(dot(refl, lightDir), 0.0), 32.0) * 0.6;
    float ripple  = sin(vWorldPos.z * 0.3 + iTime * 2.0) * 0.2;
    vec3 base     = vec3(0.13, 0.2, 0.26);
    vec3 col      = base + spec * (1.0 + ripple);
    gl_FragColor  = vec4(col, 0.3);
  }
`

function GroundSheen() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({ iTime: { value: 0 } }),
    []
  )

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms['iTime']!.value = clock.elapsedTime
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -30]}>
      <planeGeometry args={[14, 80]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={sheenVert}
        fragmentShader={sheenFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Ground & Grass ────────────────────────────────────────────────────────

function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.25, -30]}>
      <mesh receiveShadow>
        <boxGeometry args={[14, 0.5, 80]} />
        <meshStandardMaterial color="#4a4e5a" />
      </mesh>
    </RigidBody>
  )
}

function Grass() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -30]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#6fd83e" roughness={0.9} />
    </mesh>
  )
}

function Wall({
  pos,
  size,
  color = '#ffffff',
}: {
  pos: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

function Checkpoint({ z, color }: { z: number; color: string }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-6, 2, 0]} castShadow>
        <boxGeometry args={[0.4, 4, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[6, 2, 0]} castShadow>
        <boxGeometry args={[0.4, 4, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[12, 0.3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

// ─── Lane markings ─────────────────────────────────────────────────────────

// Center dashes (z = -5 to -68, every 3 units) + edge dashes on both sides
function LaneMarkings() {
  const timeRef = useRef(0)

  useFrame(({ clock }) => {
    timeRef.current = clock.elapsedTime
  })

  // Center line dashes: every 3 units from z=-5 to z=-68
  const centerZs: number[] = []
  for (let z = -5; z >= -68; z -= 3) {
    centerZs.push(z)
  }

  // Left and right edge dashes (every 4 units, offset from center)
  const edgeZs: number[] = []
  for (let z = -5; z >= -68; z -= 4) {
    edgeZs.push(z)
  }

  return (
    <>
      {/* Center dashes */}
      {centerZs.map((z) => (
        <LaneDash
          key={`c${z}`}
          position={[0, 0.02, z]}
          timeRef={timeRef}
        />
      ))}
      {/* Left edge dashes */}
      {edgeZs.map((z) => (
        <LaneDash
          key={`l${z}`}
          position={[-5.5, 0.02, z]}
          timeRef={timeRef}
        />
      ))}
      {/* Right edge dashes */}
      {edgeZs.map((z) => (
        <LaneDash
          key={`r${z}`}
          position={[5.5, 0.02, z]}
          timeRef={timeRef}
        />
      ))}
    </>
  )
}

// ─── Main export ────────────────────────────────────────────────────────────

export default function RaceWorld() {
  return (
    <>
      {/* 1. Sunset sky */}
      <GradientSky top="#0a0520" bottom="#ff4010" radius={440} />

      <Grass />
      <Ground />

      {/* 5. Wet road sheen */}
      <GroundSheen />

      {/* 2. Neon lane markings */}
      <LaneMarkings />

      {/* 3. Speed wind lines */}
      <WindLines />

      <Wall pos={[-7.2, 0.6, -30]} size={[0.4, 1.2, 80]} color="#ff5464" />
      <Wall pos={[7.2, 0.6, -30]} size={[0.4, 1.2, 80]} color="#ff5464" />
      {[-12, -24, -36, -48, -60].map((z, i) => (
        <Wall key={i} pos={[i % 2 === 0 ? -3 : 3, 0.5, z]} size={[0.8, 1, 0.8]} color="#ffa31a" />
      ))}
      <Checkpoint z={-15} color="#ffd644" />
      <Checkpoint z={-35} color="#4c97ff" />
      <Checkpoint z={-55} color="#c879ff" />

      {/* Машины на обочине */}
      <ParkedCar pos={[-4, 0, -20]} model="police" rotY={Math.PI / 2} />
      <ParkedCar pos={[4, 0, -32]} model="taxi" rotY={-Math.PI / 2} />
      <ParkedCar pos={[-4, 0, -45]} model="sedan" rotY={Math.PI / 2} />
      <ParkedCar pos={[4, 0, -58]} model="firetruck" rotY={-Math.PI / 2} />
      <ParkedCar pos={[-4, 0, -68]} model="race" rotY={Math.PI / 2} />

      {/* Деревья по обочинам */}
      <Tree pos={[-10, 0, -8]} variant={0} />
      <Tree pos={[10, 0, -18]} variant={1} />
      <Tree pos={[-10, 0, -28]} variant={2} />
      <Tree pos={[10, 0, -40]} variant={3} />
      <Tree pos={[-10, 0, -52]} variant={4} />
      <Tree pos={[10, 0, -64]} variant={0} />

      {/* Монетки по траектории */}
      {[-8, -16, -22, -30, -40, -50, -64].map((z, i) => (
        <Coin key={i} pos={[i % 2 === 0 ? -2 : 2, 1, z]} />
      ))}

      {/* 4. Checkered finish line */}
      <CheckeredFinish />

      {/* Финиш trigger (физика) */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.1, -70]}>
        <mesh receiveShadow>
          <boxGeometry args={[14, 0.2, 2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </RigidBody>
      <GoalTrigger
        pos={[0, 2, -70]}
        size={[14, 4, 2]}
        result={{ kind: 'win', label: 'ФИНИШ!', subline: 'Вся трасса пройдена!' }}
      />
    </>
  )
}

export const RACE_SPAWN: [number, number, number] = [0, 3, 4]
