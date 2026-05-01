import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { memo, useRef, useState, useMemo } from 'react'
import type { Group } from 'three'
import * as THREE from 'three'
import { addCoin } from '../lib/gameState'
import { SFX } from '../lib/audio'
import SparkleBurst from './SparkleBurst'

interface Props {
  pos: [number, number, number]
  value?: number
}

// Pickup animation: -1 = idle, 0..COLLECT_DURATION = collapsing to sparkle
const COLLECT_DURATION = 0.35

const COIN_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const COIN_FRAGMENT_SHADER = `
  uniform float iTime;
  uniform vec3 baseColor;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    // Light direction (fixed world-space)
    vec3 lightDir = normalize(vec3(1.0, 2.0, 1.5));
    // View direction approximation (camera looks down -Z in view space)
    vec3 viewDir = normalize(cameraPosition - vWorldPos);

    // Specular highlight
    vec3 reflDir = reflect(-lightDir, vNormal);
    float shine = pow(max(dot(reflDir, viewDir), 0.0), 16.0) * 0.8;

    // Rotating UV shimmer — sample a radial gradient
    float angle = iTime * 1.8;
    float cosA = cos(angle);
    float sinA = sin(angle);
    vec2 centered = vUv - 0.5;
    vec2 rotUv = vec2(cosA * centered.x - sinA * centered.y,
                      sinA * centered.x + cosA * centered.y) + 0.5;
    float radial = 1.0 - length(rotUv - 0.5) * 2.0;
    float shimmer = max(radial, 0.0) * 0.4;

    // Pulse
    float pulse = sin(iTime * 3.0) * 0.15 + 0.85;

    vec3 goldColor = baseColor;
    gl_FragColor = vec4(goldColor * pulse + vec3(shine + shimmer), 1.0);
  }
`

function CoinImpl({ pos, value = 1 }: Props) {
  const rb = useRef<RapierRigidBody>(null!)
  const visual = useRef<Group>(null!)
  const collectT = useRef(-1)
  const [done, setDone] = useState(false)
  const [sparkling, setSparkling] = useState(false)
  const iTimeRef = useRef(0)

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      baseColor: { value: new THREE.Color('#FFD700') },
    }),
    []
  )

  useFrame((_, dt) => {
    if (!visual.current || done) return

    // Update shader time
    iTimeRef.current += dt
    uniforms.iTime.value = iTimeRef.current

    if (collectT.current < 0) {
      visual.current.rotation.y += dt * 2.5
      visual.current.position.y = pos[1] + Math.sin(Date.now() * 0.003) * 0.15
    } else {
      collectT.current += dt
      const p = Math.min(collectT.current / COLLECT_DURATION, 1)
      const ease = 1 - p * p
      visual.current.scale.setScalar(ease)
      visual.current.position.y = pos[1] + p * 1.2
      if (p >= 1) setDone(true)
    }
  })

  // Пока сверкалка живёт — продолжаем рендерить её даже после done
  if (done && !sparkling) return null

  return (
    <>
      {!done && (
        <RigidBody
          ref={rb}
          type="fixed"
          colliders="ball"
          position={pos}
          sensor
          onIntersectionEnter={({ other }) => {
            if (other.rigidBodyObject?.name === 'player' && collectT.current < 0) {
              collectT.current = 0
              addCoin(value)
              SFX.coin()
              setSparkling(true)
            }
          }}
        >
          <group ref={visual}>
            {/* Point light to illuminate surroundings with gold glow */}
            <pointLight color="#FFD700" intensity={0.8} distance={3} />
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
              <shaderMaterial
                vertexShader={COIN_VERTEX_SHADER}
                fragmentShader={COIN_FRAGMENT_SHADER}
                uniforms={uniforms}
              />
            </mesh>
            <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.18, 5]} />
              <meshStandardMaterial color="#fff5a0" />
            </mesh>
          </group>
        </RigidBody>
      )}
      {sparkling && (
        <SparkleBurst pos={pos} onDone={() => setSparkling(false)} />
      )}
    </>
  )
}

// D-11: Coin'ов на сцене десятки (по trail трассы), inline `pos={[...]}` —
// каждый ре-рендер мира создавал новый array-ref. Custom comparator
// делает поэлементное сравнение tuple + value primitive.
export default memo(CoinImpl, (prev, next) => (
  prev.pos[0] === next.pos[0] &&
  prev.pos[1] === next.pos[1] &&
  prev.pos[2] === next.pos[2] &&
  prev.value === next.value
))
