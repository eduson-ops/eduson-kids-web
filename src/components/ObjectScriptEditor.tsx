import { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'
import { installObjectBlocks, OBJECT_TOOLBOX, OBJECT_STARTER_XML } from '../lib/objectBlocks'
import { setObjectScript, type ObjectScript, type PartObject } from '../studio/editorState'
import { setWorldScript, getWorldScript } from '../lib/worldScripts'
import { SFX } from '../lib/audio'

/**
 * ObjectScriptEditor — модалка-Blockly для одного «скриптуемого» объекта.
 * Работает в двух контекстах:
 *   1. Studio (Build-таб): редактируем PartObject (scope: 'part')
 *   2. Play (live-карта):   редактируем WorldObject (scope: 'world')
 *
 * При любом изменении блоков генерируется Python и немедленно сохраняется
 * в соответствующий стор — «Готово» это просто закрытие.
 */

interface StudioTarget {
  scope: 'part'
  part: PartObject
}
interface PlayTarget {
  scope: 'world'
  worldId: string
  objectId: string
  label: string
}
type Target = StudioTarget | PlayTarget

interface Props {
  target: Target
  onClose: () => void
}

function loadInitial(target: Target): string {
  if (target.scope === 'part') return target.part.scripts?.xml || OBJECT_STARTER_XML
  return getWorldScript(target.worldId, target.objectId)?.xml || OBJECT_STARTER_XML
}

function saveScript(target: Target, script: ObjectScript | null) {
  if (target.scope === 'part') setObjectScript(target.part.id, script)
  else setWorldScript(target.worldId, target.objectId, script)
}

function headerTitle(target: Target): { title: string; meta: string } {
  if (target.scope === 'part') {
    return {
      title: target.part.name,
      meta: `${target.part.type} · id ${target.part.id.slice(0, 6)}`,
    }
  }
  return {
    title: target.label,
    meta: `мир ${target.worldId} · ${target.objectId}`,
  }
}

export default function ObjectScriptEditor({ target, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wsRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<string>('')
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => { dialogRef.current?.focus() }, [])

  const { title, meta } = headerTitle(target)

  useEffect(() => {
    if (!containerRef.current) return
    installObjectBlocks()

    const ws = Blockly.inject(containerRef.current, {
      toolbox: OBJECT_TOOLBOX,
      trashcan: true,
      renderer: 'zelos',
      theme: Blockly.Themes.Classic,
      grid: { spacing: 28, length: 3, colour: 'rgba(107,92,231,0.18)', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 2, minScale: 0.4, scaleSpeed: 1.1, pinch: true },
      move: { scrollbars: true, drag: true, wheel: false },
      sounds: false,
    })
    wsRef.current = ws

    const xml = loadInitial(target)
    try {
      const dom = new DOMParser().parseFromString(xml, 'text/xml').documentElement
      if (dom) Blockly.Xml.domToWorkspace(dom, ws)
    } catch (err) {
      console.warn('Object XML load failed:', err)
    }

    const handle = () => {
      try {
        const xmlDom = Blockly.Xml.workspaceToDom(ws)
        const xmlText = Blockly.Xml.domToText(xmlDom)
        const python = pythonGenerator.workspaceToCode(ws)
        setPreview(python || '# (пусто — добавь hat-блок события)')
        saveScript(target, { xml: xmlText, python })
      } catch (err) {
        console.warn('Object gen failed:', err)
      }
    }
    ws.addChangeListener(handle)
    setTimeout(handle, 0)

    const ro = new ResizeObserver(() => Blockly.svgResize(ws))
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      ws.dispose()
      wsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.scope === 'part' ? target.part.id : `${target.worldId}:${target.objectId}`])

  const clearScript = () => {
    saveScript(target, null)
    SFX.click()
    onClose()
  }

  return (
    <div className="obj-script-backdrop" onClick={onClose} role="presentation">
      <div ref={dialogRef} className="obj-script-modal" role="dialog" aria-modal="true" aria-label="Скрипт объекта" tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <header className="obj-script-header">
          <div>
            <strong>📜 Скрипт объекта</strong>
            <span className="obj-script-target">
              · {title} <code>{meta}</code>
            </span>
          </div>
          <div className="obj-script-actions">
            {!confirmClear ? (
              <button className="ghost" onClick={() => setConfirmClear(true)} title="Убрать скрипт с объекта">
                🗑 Удалить
              </button>
            ) : (
              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12 }}>Удалить скрипт?</span>
                <button className="ghost" style={{ color: '#ff5464', borderColor: '#ff5464' }} onClick={clearScript}>Да</button>
                <button className="ghost" onClick={() => setConfirmClear(false)}>Нет</button>
              </span>
            )}
            <button className="kb-btn" onClick={onClose}>
              ✓ Готово
            </button>
          </div>
        </header>

        <div className="obj-script-body">
          <div className="obj-script-canvas" ref={containerRef} />
          <aside className="obj-script-preview">
            <header>
              <span>🐍</span>
              <strong>Python</strong>
              <small>генерируется из блоков</small>
            </header>
            <pre className="obj-script-py">{preview}</pre>
            <div className="obj-script-hint">
              <div>💡 Скрипт запустится в <b>▶ Тест</b> / <b>Play</b>:</div>
              <ul>
                <li><code>@при запуске</code> — сразу</li>
                <li><code>@когда коснулся</code> — при столкновении</li>
                <li><code>@каждые N сек</code> — повторяется</li>
                <li><code>@когда получен сигнал</code> — broadcast</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
