import { EffectComposer, Bloom, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'
import { canPostfx } from '../lib/deviceTier'

export default function PostFX() {
  if (!canPostfx()) return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.2}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.1}
        mipmapBlur={false}
        kernelSize={KernelSize.SMALL}
        blendFunction={BlendFunction.ADD}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.35} darkness={0.45} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  )
}
