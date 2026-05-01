import { BackSide, Color } from 'three'
import { useMemo } from 'react'

interface Props {
  /** цвет у зенита */
  top?: string
  /** цвет у горизонта */
  bottom?: string
  /** радиус купола — должен быть больше camera.far если хотите выйти за fog */
  radius?: number
}

/**
 * Гарантированно голубое небо — большая инвертированная сфера с вертикальным
 * градиентом через GLSL-шейдер. В отличие от drei `<Sky>`, цвет тут не зависит
 * от угла камеры относительно солнца, поэтому небо одинаково голубое везде,
 * куда бы игрок ни смотрел.
 */
export default function GradientSky({
  top = '#4c97ff',
  bottom = '#d4ebff',
  radius = 450,
}: Props) {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new Color(top) },
      bottomColor: { value: new Color(bottom) },
      offset: { value: 50 },
      exponent: { value: 0.5 },
    }),
    [top, bottom]
  )

  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[radius, 32, 16]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vWorldPos;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPos;
          void main() {
            float h = normalize(vWorldPos + vec3(0.0, offset, 0.0)).y;
            float t = pow(max(h, 0.0), exponent);
            vec3 col = mix(bottomColor, topColor, t);

            // Horizon glow — warm orange band
            float horizonGlow = pow(1.0 - abs(normalize(vWorldPos + vec3(0.0, offset, 0.0)).y), 4.0) * 0.3;
            col = mix(col, vec3(1.0, 0.5, 0.1), horizonGlow * 0.4);

            // Sun disc + halo
            vec3 sunDir = normalize(vec3(50.0, 45.0, 20.0));
            vec3 viewDir = normalize(vWorldPos);
            float sunDot = dot(viewDir, sunDir);

            // Core disc
            float sunDisc = smoothstep(0.9995, 0.9999, sunDot);
            // Inner halo
            float halo1 = pow(max(sunDot, 0.0), 64.0) * 0.6;
            // Outer halo
            float halo2 = pow(max(sunDot, 0.0), 16.0) * 0.15;

            vec3 sunColor = vec3(1.0, 0.95, 0.7);
            vec3 haloColor = mix(vec3(1.0, 0.6, 0.2), sunColor, 0.5);

            col = col + sunDisc * sunColor + halo1 * haloColor + halo2 * haloColor * 0.5;

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}
