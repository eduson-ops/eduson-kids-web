import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlocklyWorkspace from '../components/BlocklyWorkspace'
import PythonPanel from '../components/PythonPanel'
import GameCanvas from '../components/GameCanvas'
import type { GameCanvasHandle } from '../components/GameCanvas'
import { runPython, resetRuntime } from '../lib/pyodide-executor'
import type { Command } from '../lib/blocks'

const STORAGE_KEY = 'ek_project_v1'
const STARTER_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="ek_on_start" x="40" y="40">
    <statement name="DO">
      <block type="ek_say">
        <field name="TEXT">Привет!</field>
        <next>
          <block type="ek_repeat">
            <field name="TIMES">4</field>
            <statement name="DO">
              <block type="ek_move_forward">
                <field name="STEPS">2</field>
                <next>
                  <block type="ek_turn_right"></block>
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`

type Status = 'idle' | 'loading' | 'running' | 'error'

export default function Editor() {
  const navigate = useNavigate()
  const [childName, setChildName] = useState('Игрок')
  const [pythonCode, setPythonCode] = useState<string>('# нажми «Запустить»')
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [xml, setXml] = useState<string | null>(null)
  const canvasRef = useRef<GameCanvasHandle>(null)

  useEffect(() => {
    const name = localStorage.getItem('ek_child_name')
    if (!name) {
      navigate('/', { replace: true })
      return
    }
    setChildName(name)
    const saved = localStorage.getItem(STORAGE_KEY)
    setXml(saved || STARTER_XML)
  }, [navigate])

  const handleWorkspaceChange = useCallback(
    (generatedPython: string, workspaceXml: string) => {
      setPythonCode(generatedPython)
      localStorage.setItem(STORAGE_KEY, workspaceXml)
    },
    []
  )

  const onRun = async () => {
    if (status === 'running' || status === 'loading') return
    setStatus('running')
    setErrorMsg(null)
    try {
      canvasRef.current?.reset()
      const commands: Command[] = await runPython(pythonCode)
      await canvasRef.current?.play(commands)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus('error')
      return
    }
    setStatus('idle')
  }

  const onReset = () => {
    canvasRef.current?.reset()
    resetRuntime()
    setErrorMsg(null)
    setStatus('idle')
  }

  const onLogout = () => {
    localStorage.removeItem('ek_child_code')
    localStorage.removeItem('ek_child_name')
    navigate('/')
  }

  return (
    <div className="editor-root">
      <header className="editor-header">
        <div className="editor-brand" onClick={() => navigate('/')}>
          🎮 <strong>Eduson Kids</strong>
        </div>
        <div className="editor-who">Привет, {childName}</div>
        <div className="editor-actions">
          <button
            className="run"
            onClick={onRun}
            disabled={status === 'running' || status === 'loading'}
          >
            {status === 'loading' && '⏳ Загружаю Python…'}
            {status === 'running' && '▶ Играю…'}
            {status === 'idle' && '▶ Запустить'}
            {status === 'error' && '▶ Попробовать снова'}
          </button>
          <button className="ghost" onClick={onReset}>Сброс</button>
          <button className="ghost" onClick={onLogout}>Выйти</button>
        </div>
      </header>
      {errorMsg && (
        <div className="editor-error">
          <strong>Ошибка Python:</strong>{' '}
          <code>{errorMsg}</code>
        </div>
      )}
      <div className="editor-grid">
        <section className="editor-pane blockly" aria-label="Блоки">
          {xml !== null && (
            <BlocklyWorkspace
              initialXml={xml}
              onChange={handleWorkspaceChange}
              onReady={() => setStatus('idle')}
            />
          )}
        </section>
        <section className="editor-pane python" aria-label="Python-код">
          <PythonPanel code={pythonCode} />
        </section>
        <section className="editor-pane canvas" aria-label="Игровое поле">
          <GameCanvas ref={canvasRef} />
        </section>
      </div>
    </div>
  )
}
