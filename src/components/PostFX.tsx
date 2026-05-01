import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import { canPostfx } from '../lib/deviceTier'

export default function PostFX() {
  if (!canPostfx()) return null
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.2}
        mipmapBlur
        kernelSize={KernelSize.MEDIUM}
        blendFunction={BlendFunction.ADD}
      />
      <SMAA />
    </EffectComposer>
  )
}
