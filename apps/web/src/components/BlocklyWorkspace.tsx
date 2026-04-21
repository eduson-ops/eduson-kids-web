import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { pythonGenerator } from 'blockly/python'
import { installBlocks, TOOLBOX } from '../lib/blocks'

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
      theme: Blockly.Themes.Classic,
      grid: {
        spacing: 24,
        length: 3,
        colour: '#2a3142',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 2,
        minScale: 0.4,
        scaleSpeed: 1.1,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: false,
      },
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
