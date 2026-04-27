import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { getBuildState } from '../lib/buildModeState'

/**
 * Pointer-lock mouse-look для третьего лица.
 * Клик по канвасу → lock → мышь крутит yaw / pitch.
 * ESC → release lock.
 *
 * Сохраняет текущие углы в window.__ekCam для доступа из Player (там мы
 * накладываем yaw на движение и camera follow).
 *
 * P-09: НЕ запрашиваем pointer-lock когда активен build mode — иначе
 * клики по Scriptable / NPC / build-пикапу глотаются lock-запросом.
 */

declare global {
  interface Window {
    __ekCam?: { yaw: number; pitch: number; locked: boolean }
    __ekPlayerPos?: { x: number; y: number; z: number }
  }
}

export default function CameraController() {
  const { gl } = useThree()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.__ekCam) window.__ekCam = { yaw: 0, pitch: -0.2, locked: false }
    const cam = window.__ekCam

    const canvas = gl.domElement

    const onClick = () => {
      // P-09: пропускаем pointer-lock в build mode — он перехватывает клики по
      // Scriptable/NPC/pick-up. Лок только в обычном play-mode.
      if (getBuildState().active) return
      if (!cam.locked) {
        canvas.requestPointerLock?.()
      }
    }
    const onLockChange = () => {
      cam.locked = document.pointerLockElement === canvas
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!cam.locked) return
      cam.yaw -= e.movementX * 0.0018
      cam.pitch -= e.movementY * 0.0010
      // clamp pitch
      cam.pitch = Math.max(-1.2, Math.min(0.8, cam.pitch))
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
      if (document.pointerLockElement === canvas) document.exitPointerLock?.()
      cam.locked = false
    }
  }, [gl])

  return null
}
