import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import {
  installHtmlBlocks,
  SITE_TOOLBOX,
  SITE_STARTER_XML,
  generateSiteCode,
} from '../sites/htmlBlocks'

interface Props {
  /** Стартовый XML workspace. Если пусто — загружаем стартер-сайт */
  initialXml?: string
  /** Колбэк при изменении: HTML + CSS + тема + XML-сериализация */
  onChange: (html: string, css: string, theme: string, xml: string) => void
}

/**
 * HTML-Blockly workspace — отдельный от игрового Blockly, со своим набором блоков.
 * Использует `htmlGenerator` из htmlBlocks.ts для выдачи пары {html, css}.
 *
 * Тема «Лепка» (светлая) переиспользуется — определена один раз
 * в BlocklyWorkspace.tsx, доступна глобально.
 */
export default function HtmlBlocklyWorkspace({ initialXml, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wsRef = useRef<Blockly.WorkspaceSvg | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current) return
    installHtmlBlocks()

    const theme = Blockly.Themes.Classic
    const ws = Blockly.inject(containerRef.current, {
      toolbox: SITE_TOOLBOX,
      trashcan: true,
      renderer: 'zelos',
      theme,
      grid: { spacing: 28, length: 3, colour: 'rgba(107,92,231,0.18)', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1, maxScale: 2.4, minScale: 0.4, scaleSpeed: 1.1, pinch: true },
      move: { scrollbars: true, drag: true, wheel: false },
      sounds: false,
    })
    wsRef.current = ws

    const xmlToLoad = initialXml && initialXml.trim() ? initialXml : SITE_STARTER_XML
    try {
      const dom = new DOMParser().parseFromString(xmlToLoad, 'text/xml').documentElement
      if (dom) Blockly.Xml.domToWorkspace(dom, ws)
    } catch (err) {
      console.warn('HTML Blockly XML load failed, starter:', err)
    }

    const handle = () => {
      const xmlDom = Blockly.Xml.workspaceToDom(ws)
      const xmlText = Blockly.Xml.domToText(xmlDom)
      try {
        const { html, css, theme } = generateSiteCode(ws)
        onChangeRef.current(html, css, theme, xmlText)
      } catch (err) {
        console.warn('HTML gen failed:', err)
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
  }, [])

  return <div ref={containerRef} className="blockly-container" />
}
