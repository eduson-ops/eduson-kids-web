import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'
import { installBlocks, TOOLBOX } from '../lib/blocks'

/**
 * Авторская тема «Лепка» — корпоративная палитра Designbook 1.0,
 * крупные буквы, тёплый светлый фон. Делает блоки узнаваемыми у детей.
 */
const LEPKA_THEME = Blockly.Theme.defineTheme('lepka', {
  name: 'lepka',
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#f5f6fa',
    toolboxBackgroundColour: '#ffffff',
    toolboxForegroundColour: '#2a1f4c',
    flyoutBackgroundColour: '#ffffff',
    flyoutForegroundColour: '#2a1f4c',
    flyoutOpacity: 0.96,
    scrollbarColour: 'rgba(107, 92, 231, 0.35)',
    scrollbarOpacity: 0.6,
    insertionMarkerColour: '#6B5CE7',
    insertionMarkerOpacity: 0.4,
    markerColour: '#6B5CE7',
    cursorColour: '#6B5CE7',
    selectedGlowColour: '#FFD43C',
    selectedGlowOpacity: 0.9,
    replacementGlowColour: '#9FE8C7',
    replacementGlowOpacity: 0.7,
  },
  fontStyle: {
    family: "'Nunito', 'Inter', system-ui, sans-serif",
    weight: '700',
    size: 14,
  },
  startHats: false,
})

interface Props {
  initialXml: string
  onChange: (python: string, xml: string) => void
  onReady?: () => void
}

export default function BlocklyWorkspace({ initialXml, onChange, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return
    installBlocks()

    const ws = Blockly.inject(containerRef.current, {
      toolbox: TOOLBOX,
      trashcan: true,
      renderer: 'zelos',
      theme: LEPKA_THEME,
      grid: {
        spacing: 28,
        length: 3,
        colour: 'rgba(107, 92, 231, 0.18)',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 2.4,
        minScale: 0.4,
        scaleSpeed: 1.1,
        pinch: true,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
      sounds: false,
    })
    workspaceRef.current = ws

    // Load initial XML
    try {
      const parser = new DOMParser()
      const dom = parser.parseFromString(initialXml, 'text/xml')
      const xmlEl = dom.documentElement
      if (xmlEl) Blockly.Xml.domToWorkspace(xmlEl, ws)
    } catch (err) {
      console.warn('Failed to load XML, starting fresh:', err)
    }

    const handleChange = () => {
      const xmlDom = Blockly.Xml.workspaceToDom(ws)
      const xmlText = Blockly.Xml.domToText(xmlDom)
      let python = ''
      try {
        python = pythonGenerator.workspaceToCode(ws)
      } catch (err) {
        python = `# (ошибка генерации: ${String(err)})`
      }
      onChangeRef.current(python, xmlText)
    }

    ws.addChangeListener(handleChange)
    // Fire initial
    setTimeout(() => {
      handleChange()
      onReady?.()
    }, 0)

    // ResizeObserver to keep Blockly sized to container
    const ro = new ResizeObserver(() => Blockly.svgResize(ws))
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      ws.dispose()
      workspaceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="blockly-container" />
}
