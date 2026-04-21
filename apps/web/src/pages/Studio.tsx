import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BuildTab from '../studio/BuildTab'
import ScriptTab from '../studio/ScriptTab'
import TestTab from '../studio/TestTab'
import { getState, resetScene, subscribe, type EditorState } from '../studio/editorState'
import { SFX } from '../lib/audio'

type Tab = 'build' | 'script' | 'test'

export default function Studio() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('build')
  const [state, setState] = useState<EditorState>(getState())
  const [saved, setSaved] = useState<string>('сохранено')

  useEffect(() => subscribe(setState), [])

  useEffect(() => {
    // Индикатор автосохранения: "..." → "сохранено"
    setSaved('сохраняем…')
    const t = setTimeout(() => setSaved('сохранено ✓'), 400)
    return () => clearTimeout(t)
  }, [state])

  const onHome = () => {
    SFX.click()
    navigate('/')
  }

  const onReset = () => {
    if (confirm('Сбросить сцену до начальной? Твои изменения пропадут.')) {
      resetScene()
    }
  }

  const count = state.parts.length

  return (
    <div className="studio-root">
      <header className="studio-header">
        <button className="home-btn" onClick={onHome} aria-label="В лобби">
          ←
        </button>
        <div className="studio-brand">
          🎨 <strong>Студия</strong>
        </div>
        <nav className="studio-tabs">
          <button
            className={`studio-tab ${tab === 'build' ? 'active' : ''}`}
            onClick={() => setTab('build')}
          >
            🧱 Строить
          </button>
          <button
            className={`studio-tab ${tab === 'script' ? 'active' : ''}`}
            onClick={() => setTab('script')}
          >
            🧩 Скрипт
          </button>
          <button
            className={`studio-tab ${tab === 'test' ? 'active' : ''}`}
            onClick={() => setTab('test')}
          >
            ▶ Тест
          </button>
        </nav>
        <div className="studio-stats">
          <span title="Объектов в сцене">📦 {count}</span>
          <span className={`save-indicator ${saved.includes('✓') ? 'ok' : ''}`}>{saved}</span>
        </div>
        <div className="studio-actions">
          <button className="ghost" onClick={onReset}>
            Сброс
          </button>
          <button className="publish" disabled title="Публикация в v1.0">
            📤 Опубликовать
          </button>
        </div>
      </header>

      <main className="studio-main">
        {tab === 'build' && <BuildTab />}
        {tab === 'script' && <ScriptTab />}
        {tab === 'test' && <TestTab state={state} />}
      </main>
    </div>
  )
}
