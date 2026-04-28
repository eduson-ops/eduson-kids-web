import { useEffect, useRef, useState } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
} from '@codemirror/view'
import {
  defaultKeymap,
  historyKeymap,
  history,
  indentWithTab,
} from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import {
  indentOnInput,
  foldGutter,
  foldKeymap,
  syntaxHighlighting,
  HighlightStyle,
  bracketMatching,
} from '@codemirror/language'
import {
  autocompletion,
  completionKeymap,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete'
import { searchKeymap } from '@codemirror/search'
import { oneDark } from '@codemirror/theme-one-dark'
import { tags as t } from '@lezer/highlight'
import { PYTHON_API_REFERENCE } from '../lib/python-world-runtime'

interface Props {
  code: string
  onChange: (code: string) => void
  onRun?: () => void
  isRunning?: boolean
  error?: string | null
  // NOTE: `readOnly` is accepted for drop-in parity; Monaco's `readOnly`
  // option maps to CodeMirror's `EditorState.readOnly` facet.
  readOnly?: boolean
}

/**
 * CodeMirrorPythonEditor — mobile-first Python editor.
 *
 * Same public API as PurePythonEditor, but built on CodeMirror 6 (~150 KB
 * vs Monaco's ~2 MB). Bundled for phones/tablets where Monaco's touch caret
 * fights the virtual keyboard.
 *
 * Parity notes vs Monaco:
 *  + lineNumbers, foldGutter, history, indentOnInput, autocompletion, search
 *  + PYTHON_API_REFERENCE completions (same list as Monaco)
 *  + Ctrl/Cmd + Enter → onRun()
 *  + Theme "kubik-dark" matches Monaco tokens
 *  - No minimap (CM6 has none — not needed)
 *  - No Language Server protocol (Monaco doesn't use one here either)
 *  - No cursorSmoothCaretAnimation (CM6 has own smooth caret by default)
 */

// Brand colors (kubik-dark) — kept in sync with PurePythonEditor theme.
const KUBIK_HIGHLIGHT = HighlightStyle.define([
  { tag: t.keyword, color: '#6B5CE7', fontWeight: 'bold' },
  { tag: [t.string, t.special(t.string)], color: '#9FE8C7' },
  { tag: [t.number, t.bool, t.null], color: '#FFD43C' },
  { tag: t.comment, color: '#3d4a5c', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#FFB4C8' },
  { tag: t.operator, color: '#FF9454' },
  { tag: [t.typeName, t.className], color: '#A9D8FF' },
  { tag: [t.punctuation, t.bracket], color: '#dce0f1' },
  { tag: t.variableName, color: '#dce0f1' },
  { tag: t.propertyName, color: '#A9D8FF' },
])

const KUBIK_THEME = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0B0A11',
      color: '#dce0f1',
      height: '100%',
      fontSize: '15px', // larger on mobile than desktop 14 for touch
      fontFamily: "'JetBrains Mono', ui-monospace, Consolas, 'Courier New', monospace",
    },
    '.cm-content': {
      caretColor: '#FFD43C',
      padding: '12px 0',
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#FFD43C', borderLeftWidth: '2px' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#6B5CE755',
    },
    '.cm-activeLine': { backgroundColor: '#14102299' },
    '.cm-activeLineGutter': { backgroundColor: '#14102299', color: '#FFD43C' },
    '.cm-gutters': {
      backgroundColor: '#0B0A11',
      color: '#3d4760',
      border: 'none',
      borderRight: '1px solid #1a1a2e',
    },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 8px' },
    '.cm-foldGutter .cm-gutterElement': { color: '#3d4760' },
    // Larger scrollbars + softer rail for touch
    '.cm-scroller': {
      scrollbarWidth: 'thin',
      scrollbarColor: '#6B5CE744 #0B0A11',
      fontFamily: 'inherit',
    },
    '.cm-scroller::-webkit-scrollbar': { width: '12px', height: '12px' },
    '.cm-scroller::-webkit-scrollbar-thumb': {
      background: '#6B5CE744',
      borderRadius: '6px',
    },
    '.cm-scroller::-webkit-scrollbar-track': { background: '#0B0A11' },
    '.cm-tooltip.cm-tooltip-autocomplete': {
      backgroundColor: '#0B0A11',
      border: '1px solid #6B5CE744',
      borderRadius: '8px',
      color: '#dce0f1',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
      backgroundColor: '#6B5CE722',
      color: '#FFD43C',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
      padding: '6px 10px',
    },
    '.cm-matchingBracket': {
      outline: '1px solid #6B5CE7',
      backgroundColor: '#6B5CE744',
    },
    '.cm-panels': { backgroundColor: '#14102298', color: '#dce0f1' },
  },
  { dark: true },
)

const COLOR_WORDS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white', 'pink', 'cyan']

function eksonCompletions(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[\w"]*/)
  if (!word) return null
  if (word.from === word.to && !context.explicit) return null

  const options = [
    ...PYTHON_API_REFERENCE.map((item) => {
      const name = item.fn.split('(')[0]!
      const argsPart = item.fn.substring(name.length)
      const snippet = name + argsPart.replace(/\(([^)]*)\)/, (_m, inside: string) => {
        const args = inside.split(',').map((a) => a.trim()).filter(Boolean)
        if (args.length === 0) return '()'
        // CM6 snippets use #{name} — keep args visible so kids see signature.
        return `(${args.join(', ')})`
      })
      return {
        label: item.fn,
        apply: snippet,
        type: 'function' as const,
        detail: 'Eduson API',
        info: item.desc,
        boost: 10,
      }
    }),
    ...COLOR_WORDS.map((c) => ({
      label: `"${c}"`,
      apply: `"${c}"`,
      type: 'text' as const,
      detail: 'цвет',
      info: `Цвет ${c} (для place_block, tower, …)`,
    })),
  ]

  return { from: word.from, options, validFor: /^[\w"]*$/ }
}

export default function CodeMirrorPythonEditor({
  code,
  onChange,
  onRun,
  isRunning,
  error,
  readOnly = false,
}: Props) {
  const [showRef, setShowRef] = useState(false)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const readOnlyCompRef = useRef<Compartment>(new Compartment())
  const onChangeRef = useRef(onChange)
  const onRunRef = useRef(onRun)
  onChangeRef.current = onChange
  onRunRef.current = onRun

  // Init editor once
  useEffect(() => {
    if (!hostRef.current || viewRef.current) return
    const runKey = keymap.of([
      {
        key: 'Mod-Enter',
        preventDefault: true,
        run: () => {
          onRunRef.current?.()
          return true
        },
      },
      {
        // Swallow Ctrl/Cmd+S so the browser's "Save page" dialog doesn't pop
        // during live demos. Autosave already happens via editorState.persist().
        key: 'Mod-s',
        preventDefault: true,
        run: () => true,
      },
    ])

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        foldGutter(),
        drawSelection(),
        history(),
        indentOnInput(),
        bracketMatching(),
        // NOTE: auto-close brackets intentionally off — fights Russian (ЙЦУКЕН) keyboard
        // long-press punctuation on iOS / Android.
        syntaxHighlighting(KUBIK_HIGHLIGHT),
        highlightActiveLine(),
        EditorView.lineWrapping, // word-wrap on
        autocompletion({
          override: [eksonCompletions],
          activateOnTyping: true,
          icons: true,
          defaultKeymap: true,
        }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        runKey,
        python(),
        oneDark, // base, overridden by KUBIK_THEME below
        KUBIK_THEME,
        readOnlyCompRef.current.of(EditorState.readOnly.of(readOnly)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
      ],
    })

    viewRef.current = new EditorView({ state, parent: hostRef.current })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external `code` → editor
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== code) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      })
    }
  }, [code])

  // Sync `readOnly` via compartment (no editor rebuild)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: readOnlyCompRef.current.reconfigure(EditorState.readOnly.of(readOnly)),
    })
  }, [readOnly])

  const insertAtCursor = (text: string) => {
    const view = viewRef.current
    if (!view) return
    const { from, to } = view.state.selection.main
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    })
    view.focus()
  }

  return (
    <div className={`py-editor ${error ? 'has-error' : ''}`}>
      <div className="py-editor-header">
        <span className="py-editor-logo">🐍</span>
        <strong className="py-editor-title">Python</strong>
        <span className="py-editor-subtitle">CodeMirror · Ctrl+Enter — запустить</span>
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
          <div ref={hostRef} className="py-editor-cm-host" style={{ height: '100%', width: '100%' }} />
        </div>

        {showRef && (
          <div className="py-editor-refdrawer">
            <div className="py-ref-title">📖 API функции · тап — вставить</div>
            <div className="py-ref-grid">
              {PYTHON_API_REFERENCE.map((item) => (
                <div
                  key={item.fn}
                  className="py-ref-row clickable"
                  onClick={() => insertAtCursor(item.fn)}
                  title="Тапни чтобы вставить в курсор"
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
