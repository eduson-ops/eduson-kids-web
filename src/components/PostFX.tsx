import { EffectComposer, Bloom, SMAA, SSAO, ToneMapping, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { canPostfx, detectDeviceTier } from '../lib/deviceTier'

// Pre-allocated to avoid per-render allocation
const CA_HIGH = new THREE.Vector2(0.0004, 0.0003)
const CA_MED  = new THREE.Vector2(0.00018, 0.00013)

export default function PostFX() {
  if (!canPostfx()) return null
  const high = detectDeviceTier() === 'high'
  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <SSAO
        samples={high ? 24 : 12}
        radius={0.08}
        intensity={1.8}
        luminanceInfluence={0.5}
        resolutionScale={0.5}
        blendFunction={BlendFunction.MULTIPLY}
      />
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.3}
        mipmapBlur
        kernelSize={KernelSize.MEDIUM}
        blendFunction={BlendFunction.ADD}
      />
      <ChromaticAberration offset={high ? CA_HIGH : CA_MED} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.35} darkness={0.45} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  )
}
