import { EffectComposer, Bloom, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import { canPostfx } from '../lib/deviceTier'

export default function PostFX() {
  if (!canPostfx()) return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.28}
        luminanceThreshold={0.86}
        luminanceSmoothing={0.2}
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
