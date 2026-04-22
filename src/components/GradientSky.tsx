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
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}
