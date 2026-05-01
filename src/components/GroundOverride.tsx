import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const INIT_DELAY_MS = 500

const GROUND_VERT = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const GROUND_FRAG = `
  uniform vec3 uBaseColor;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vWorldPos.xz * 0.4;
    float n1 = noise(uv * 1.0) * 0.5
             + noise(uv * 2.3) * 0.3
             + noise(uv * 5.1) * 0.2;

    // Color variation: base ± 12%
    vec3 col = uBaseColor * (0.88 + n1 * 0.24);

    // Subtle tile lines (very faint)
    vec2 grid = fract(vWorldPos.xz * 0.5);
    float line = max(step(0.97, grid.x), step(0.97, grid.y));
    col *= 1.0 - line * 0.08;

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function GroundOverride() {
  const { scene } = useThree()

  useEffect(() => {
    const replaced = new Map<THREE.Mesh, THREE.Material>()

    const apply = () => {
      scene.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return
        const mesh = obj as THREE.Mesh
        if (replaced.has(mesh)) return
        if (mesh.userData?.skipToon || mesh.userData?.skipGround) return

        const mat = mesh.material
        if (!mat || Array.isArray(mat)) return

        // Only target MeshToonMaterial (already processed by ToonOverride)
        if (mat.type !== 'MeshToonMaterial') return

        // Check if geometry is a large flat plane (ground-like)
        const geo = mesh.geometry
        if (!geo) return

        const bbox = new THREE.Box3().setFromObject(mesh)
        const size = new THREE.Vector3()
        bbox.getSize(size)

        // Large flat surface near y=0
        if (size.x < 18 || size.z < 18) return
        if (size.y > 3) return

        const toon = mat as THREE.MeshToonMaterial
        const baseColor = toon.color.clone()

        replaced.set(mesh, mat)
        const groundMat = new THREE.ShaderMaterial({
          vertexShader: GROUND_VERT,
          fragmentShader: GROUND_FRAG,
          uniforms: {
            uBaseColor: { value: baseColor },
            uTime: { value: 0 },
          },
        })
        mesh.material = groundMat
      })
    }

    const t = setTimeout(apply, INIT_DELAY_MS)
    return () => {
      clearTimeout(t)
      replaced.forEach((origMat, mesh) => { mesh.material = origMat })
      replaced.clear()
    }
  }, [scene])

  return null
}
