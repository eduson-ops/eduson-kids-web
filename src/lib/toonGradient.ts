import * as THREE from 'three'

let _gradientMap: THREE.DataTexture | null = null

export function getToonGradientMap(): THREE.DataTexture {
  if (_gradientMap) return _gradientMap
  const data = new Uint8Array([38, 102, 185, 245])
  const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  _gradientMap = tex
  return tex
}
