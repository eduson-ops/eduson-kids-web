import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  position?: [number, number, number]
  width?: number
  depth?: number
}

export default function WaterSurface({
  position = [0, 0, 0],
  width = 20,
  depth = 20,
}: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.iTime!.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        uniforms={uniforms}
        vertexShader={`
          uniform float iTime;
          varying vec2 vUv;
          varying vec3 vWorldPos;
          varying vec3 vNormal;

          void main() {
            vUv = uv;

            // Sine-wave ripple displacement (Y in local space, which is Z after rotation)
            vec3 pos = position;
            pos.z += sin(pos.x * 1.2 + iTime * 1.5) * 0.12
                   + sin(pos.y * 0.9 + iTime * 1.1) * 0.10;

            vec4 worldPos = modelMatrix * vec4(pos, 1.0);
            vWorldPos = worldPos.xyz;

            // Approximate displaced normal for fresnel
            float dx = cos(pos.x * 1.2 + iTime * 1.5) * 0.12 * 1.2
                     + cos(pos.y * 0.9 + iTime * 1.1) * 0.10 * 0.9;
            vNormal = normalize(normalMatrix * vec3(-dx, 1.0, 0.0));

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform float iTime;
          uniform vec3 cameraPosition;
          varying vec2 vUv;
          varying vec3 vWorldPos;
          varying vec3 vNormal;

          void main() {
            // Scrolling UV for animated surface detail
            vec2 uv1 = vUv + vec2(iTime * 0.04, iTime * 0.02);
            vec2 uv2 = vUv - vec2(iTime * 0.03, iTime * 0.05);

            // Base color: deep blue mixed with teal via travelling sine wave
            vec3 deepBlue = vec3(0.039, 0.310, 0.549);  // #0a4f8c
            vec3 teal     = vec3(0.051, 0.620, 0.557);  // #0d9e8e

            float colorMix = 0.5 + 0.5 * sin(uv1.x * 6.28 + uv1.y * 4.0 + iTime * 0.8);
            vec3 baseColor = mix(deepBlue, teal, colorMix);

            // Subtle lighter highlights from UV2
            float ripple = 0.5 + 0.5 * sin(uv2.x * 9.0 + uv2.y * 7.0 + iTime * 1.2);
            baseColor += vec3(0.04, 0.09, 0.12) * ripple;

            // Fresnel — transparent at glancing angles
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            float fresnel = 1.0 - clamp(dot(viewDir, vNormal), 0.0, 1.0);
            fresnel = pow(fresnel, 2.0);

            // Specular highlight
            vec3 lightDir = normalize(vec3(0.6, 1.0, 0.4));
            vec3 halfVec  = normalize(lightDir + viewDir);
            float spec    = pow(clamp(dot(vNormal, halfVec), 0.0, 1.0), 64.0);
            vec3 finalColor = baseColor + vec3(0.6, 0.8, 0.9) * spec * 0.5;

            // Alpha: base 0.82 + fresnel adds a bit of edge transparency
            float alpha = 0.82 - fresnel * 0.25;

            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </mesh>
  )
}
