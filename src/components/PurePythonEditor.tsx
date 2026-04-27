import { useRef, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { PYTHON_API_REFERENCE } from '../lib/python-world-runtime'

interface Props {
  code: string
  onChange: (code: string) => void
  onRun?: () => void
  isRunning?: boolean
  error?: string | null
}

/**
 * PurePythonEditor — редактор Python на базе Monaco.
 * - Тёмная тема "kubik-dark" с брендовыми цветами токенов
 * - JetBrains Mono 14px, word-wrap on, minimap off
 * - Cmd/Ctrl+Enter → onRun()
 * - Autocomplete с функциями нашего API (move_forward, tower, say, …)
 * - API-drawer справа по кнопке «📖 API»
 *
 * Monaco лениво инициализируется — первый раз может занять ~100мс (подгрузка vs-fonts).
 * Это приемлемо: ScriptTab сам лениво-грузит режим L3.
 */
export default function PurePythonEditor({ code, onChange, onRun, isRunning, error }: Props) {
  const [showRef, setShowRef] = useState(false)
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const onRunRef = useRef(onRun)
  onRunRef.current = onRun

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Брендовая тёмная тема (один раз на приложение)
    monaco.editor.defineTheme('kubik-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword',  foreground: '6B5CE7', fontStyle: 'bold' },
        { token: 'string',   foreground: '9FE8C7' },
        { token: 'number',   foreground: 'FFD43C' },
        { token: 'comment',  foreground: '3d4a5c', fontStyle: 'italic' },
        { token: 'function', foreground: 'FFB4C8' },
        { token: 'operator', foreground: 'FF9454' },
        { token: 'type',     foreground: 'A9D8FF' },
        { token: 'delimiter', foreground: 'dce0f1' },
      ],
      colors: {
        'editor.background': '#0B0A11',
        'editor.foreground': '#dce0f1',
        'editorLineNumber.foreground': '#3d4760',
        'editorLineNumber.activeForeground': '#FFD43C',
        'editorCursor.foreground': '#FFD43C',
        'editor.selectionBackground': '#6B5CE755',
        'editor.inactiveSelectionBackground': '#6B5CE733',
        'editor.lineHighlightBackground': '#14102299',
        'editorBracketMatch.background': '#6B5CE744',
        'editorBracketMatch.border': '#6B5CE7',
        'editorIndentGuide.background': '#1a1a2e',
        'editorIndentGuide.activeBackground': '#2a2a4e',
        'editorWidget.background': '#14102298',
        'editorSuggestWidget.background': '#0B0A11',
        'editorSuggestWidget.border': '#6B5CE744',
        'editorSuggestWidget.selectedBackground': '#6B5CE722',
      },
    })
    monaco.editor.setTheme('kubik-dark')

    // Ctrl/Cmd + Enter → run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current?.()
    })

    // Завершение — наш API + brand keywords (явные Monaco-типы)
    type MonacoModel = Parameters<Parameters<typeof monaco.languages.registerCompletionItemProvider>[1]['provideCompletionItems']>[0]
    type MonacoPos = Parameters<Parameters<typeof monaco.languages.registerCompletionItemProvider>[1]['provideCompletionItems']>[1]

    monaco.languages.registerCompletionItemProvider('python', {
      triggerCharacters: ['.', ' ', '('],
      provideCompletionItems: (model: MonacoModel, position: MonacoPos) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        type Suggestion = {
          label: string
          kind: number
          insertText: string
          insertTextRules: number
          detail: string
          documentation: string
          range: typeof range
        }
        const suggestions: Suggestion[] = PYTHON_API_REFERENCE.map((item) => {
          const name = item.fn.split('(')[0]
          const argsPart = item.fn.substring(name.length)
          const snippet = name + argsPart.replace(/\(([^)]*)\)/, (_m, inside: string) => {
            const args = inside.split(',').map((a) => a.trim()).filter(Boolean)
            if (args.length === 0) return '()$0'
            const placeholders = args.map((a, i) => `\${${i + 1}:${a}}`).join(', ')
            return `(${placeholders})$0`
          })
          return {
            label: item.fn,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRules.InsertAsSnippet,
            detail: item.desc,
            documentation: item.desc,
            range,
          }
        })
        const colors = ['red','blue','green','yellow','purple','orange','black','white','pink','cyan']
        for (const c of colors) {
          suggestions.push({
            label: `"${c}"`,
            kind: monaco.languages.CompletionItemKind.Color,
            insertText: `"${c}"`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRules.InsertAsSnippet,
            detail: 'цвет',
            documentation: `Цвет ${c} (для place_block, tower, …)`,
            range,
          })
        }
        return { suggestions }
      },
    })
  }

  const handleChange = (value: string | undefined) => {
    onChange(value ?? '')
  }

  const insertAtCursor = (text: string) => {
    const ed = editorRef.current
    if (!ed) return
    const sel = ed.getSelection()
    if (!sel) return
    ed.executeEdits('insert-api', [{ range: sel, text, forceMoveMarkers: true }])
    ed.focus()
  }

  return (
    <div className={`py-editor ${error ? 'has-error' : ''}`}>
      <div className="py-editor-header">
        <span className="py-editor-logo">🐍</span>
        <strong className="py-editor-title">Python</strong>
        <span className="py-editor-subtitle">Monaco · Ctrl+Enter — запустить</span>
        <div className="py-editor-actions">
          <button
            className={`py-btn-ref ${showRef ? 'active' : ''}`}
            onClick={() => setShowRef((v) => !v)}
            title="Справка API"
            type="button"
          >
            📖 API
          </button>
          {onRun && (
            <button
              className={`py-btn-run ${isRunning ? 'running' : ''}`}
              onClick={onRun}
              disabled={isRunning}
              type="button"
            >
              {isRunning ? '⏳ Выполняется…' : '▶ Запустить'}
            </button>
          )}
        </div>
      </div>

      <div className="py-editor-body">
        <div className="py-editor-monaco-wrap">
          <Editor
            value={code}
            onChange={handleChange}
            onMount={handleMount}
            language="python"
            theme="kubik-dark"
            loading={<div className="py-editor-loading">Загружаем редактор…</div>}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', ui-monospace, Consolas, 'Courier New', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'on',
              roundedSelection: false,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
          />
        </div>

        {showRef && (
          <div className="py-editor-refdrawer">
            <div className="py-ref-title">📖 API функции · клик — вставить</div>
            <div className="py-ref-grid">
              {PYTHON_API_REFERENCE.map((item) => (
                <div
                  key={item.fn}
                  className="py-ref-row clickable"
                  onClick={() => insertAtCursor(item.fn)}
                  title="Кликни чтобы вставить в курсор"
                >
                  <code className="py-ref-fn">{item.fn}</code>
                  <span className="py-ref-desc">{item.desc}</span>
                </div>
              ))}
            </div>
            <div className="py-ref-footer">
              Цвета: red blue green yellow purple orange black white pink cyan
              <br />
              Горячие: <kbd>Ctrl/Cmd + Enter</kbd> — запуск · <kbd>Ctrl + Space</kbd> — автодополнение
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="py-editor-errorbar">
          <span className="py-error-icon">⚠️</span>
          <span className="py-error-text">{error}</span>
        </div>
      )}
    </div>
  )
}
