import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

/**
 * Pointer-lock mouse-look для третьего лица.
 * Клик по канвасу → lock → мышь крутит yaw / pitch.
 * ESC → release lock.
 *
 * Сохраняет текущие углы в window.__ekCam для доступа из Player (там мы
 * накладываем yaw на движение и camera follow).
 */

declare global {
  interface Window {
    __ekCam?: { yaw: number; pitch: number; locked: boolean }
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
      if (!cam.locked) {
        canvas.requestPointerLock?.()
      }
    }
    const onLockChange = () => {
      cam.locked = document.pointerLockElement === canvas
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!cam.locked) return
      cam.yaw -= e.movementX * 0.0025
      cam.pitch -= e.movementY * 0.0022
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
