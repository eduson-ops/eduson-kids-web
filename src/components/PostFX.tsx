import { EffectComposer, Bloom, SMAA, SSAO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import { canPostfx, detectDeviceTier } from '../lib/deviceTier'

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
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.35} darkness={0.45} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  )
}
