import { useEffect, useRef, useState } from 'react'

/**
 * Touch D-pad + jump button for mobile Play mode.
 * Dispatches keyboard events so the existing CharacterController reacts.
 * Only shown on touch devices.
 */

const KEYS: Record<string, string> = {
  up: 'w', down: 's', left: 'a', right: 'd', jump: ' ',
}

function fakeKey(key: string, type: 'keydown' | 'keyup') {
  const e = new KeyboardEvent(type, { key, bubbles: true, cancelable: true })
  window.dispatchEvent(e)
}

interface BtnState {
  up: boolean; down: boolean; left: boolean; right: boolean; jump: boolean
}

export default function MobileControls() {
  const [visible, setVisible] = useState(false)
  const pressed = useRef<BtnState>({ up: false, down: false, left: false, right: false, jump: false })

  useEffect(() => {
    // Only show on touch-capable devices
    const hasTouchscreen = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
    setVisible(hasTouchscreen)
  }, [])

  if (!visible) return null

  function press(btn: keyof BtnState) {
    if (pressed.current[btn]) return
    pressed.current[btn] = true
    fakeKey(KEYS[btn], 'keydown')
  }

  function release(btn: keyof BtnState) {
    if (!pressed.current[btn]) return
    pressed.current[btn] = false
    fakeKey(KEYS[btn], 'keyup')
  }

  function btnProps(btn: keyof BtnState) {
    return {
      onPointerDown: (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); press(btn) },
      onPointerUp: () => release(btn),
      onPointerCancel: () => release(btn),
      onPointerLeave: () => release(btn),
    }
  }

  return (
    <div className="mobile-controls" aria-hidden="true">
      {/* D-pad */}
      <div className="mobile-dpad">
        <button className="dpad-btn dpad-up" {...btnProps('up')}>▲</button>
        <button className="dpad-btn dpad-left" {...btnProps('left')}>◀</button>
        <div className="dpad-center" />
        <button className="dpad-btn dpad-right" {...btnProps('right')}>▶</button>
        <button className="dpad-btn dpad-down" {...btnProps('down')}>▼</button>
      </div>
      {/* Jump button */}
      <button className="mobile-jump" {...btnProps('jump')}>
        ↑<span style={{ fontSize: 10, display: 'block' }}>Прыжок</span>
      </button>
    </div>
  )
}
