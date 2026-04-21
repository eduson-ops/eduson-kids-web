import { useEffect, useState } from 'react'
import BlocklyWorkspace from '../components/BlocklyWorkspace'
import { getState, setBlocklyXml, setLuaCode, subscribe, type EditorState } from './editorState'

/**
 * Скриптинг-таб. На MVP используем существующий BlocklyWorkspace
 * (он генерит Python из Scratch-like блоков). Это хорошая baseline.
 * В v1.0 заменим генератор на Luau-lite post-processor (ADR-006).
 */
export default function ScriptTab() {
  const [state, setState] = useState<EditorState>(getState())
  useEffect(() => subscribe(setState), [])

  return (
    <div className="studio-script">
      <aside className="script-help">
        <header>
          <span className="script-icon">🧩</span>
          <h3>Блоки и скрипт</h3>
        </header>
        <p className="script-intro">
          Слева бери блоки и составляй правила своей игры. Справа — как это будет выглядеть как код.
        </p>

        <details open>
          <summary>События</summary>
          <p>«при запуске», «когда коснулся» — отсюда начинается игра.</p>
        </details>

        <details>
          <summary>Движение</summary>
          <p>Передвигай игрока: «идти вперёд», «повернуть налево», «прыгнуть».</p>
        </details>

        <details>
          <summary>Повторы</summary>
          <p>«повторить N раз» — повторяет блоки внутри себя.</p>
        </details>

        <details>
          <summary>Как работает Play</summary>
          <p>Нажми таб <strong>«▶ Тест»</strong> чтобы проверить — твой скрипт запустится в живой игре.</p>
        </details>
      </aside>

      <section className="script-blockly">
        <BlocklyWorkspace
          initialXml={state.blocklyXml}
          onChange={(python, xml) => {
            setBlocklyXml(xml)
            setLuaCode(python)
          }}
        />
      </section>

      <aside className="script-preview">
        <header>
          <span className="py-icon">🐍</span>
          <strong>Код</strong>
          <small>автогенерируется</small>
        </header>
        <pre className="script-code">{state.luaCode || '# пусто'}</pre>
        <footer className="script-note">
          <small>
            В v1.0 переходим на <strong>Luau</strong> — как в настоящем Roblox Studio, сможешь потом
            свои игры туда переносить.
          </small>
        </footer>
      </aside>
    </div>
  )
}
