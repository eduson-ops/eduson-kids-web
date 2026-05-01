import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import * as THREE from 'three'
import { getToonGradientMap } from '../lib/toonGradient'

interface Props {
  url: string
  scale?: number
  rotY?: number
}

function applyToon(root: THREE.Object3D, gradientMap: THREE.DataTexture) {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return
    obj.castShadow = true
    obj.receiveShadow = true
    const oldMat = obj.material as THREE.MeshStandardMaterial
    obj.material = new THREE.MeshToonMaterial({
      color: oldMat.color?.clone() ?? new THREE.Color(0xffffff),
      emissive: oldMat.emissive?.clone() ?? new THREE.Color(0x000000),
      emissiveIntensity: (oldMat as any).emissiveIntensity ?? 0,
      gradientMap,
    })
  })
}

export default function GltfNPC({ url, scale = 1, rotY = 0 }: Props) {
  const gradientMap = getToonGradientMap()
  const gltf = useGLTF(url)
  const group = useRef<THREE.Group>(null!)
  const { actions } = useAnimations(gltf.animations, group)

  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(gltf.scene)
    applyToon(c, gradientMap)
    return c
  }, [gltf.scene, gradientMap])

  const autoScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const h = Math.max(size.y, 0.01)
    return (1.5 / h) * scale
  }, [cloned, scale])

  useEffect(() => {
    const a = actions['idle'] ?? Object.values(actions)[0]
    if (a) a.reset().fadeIn(0.2).play()
    return () => { Object.values(actions).forEach(a => a?.stop()) }
  }, [actions])

  return (
    <group ref={group} scale={[autoScale, autoScale, autoScale]} rotation={[0, rotY, 0]}>
      <primitive object={cloned} />
    </group>
  )
}
