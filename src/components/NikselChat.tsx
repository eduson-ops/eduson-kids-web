import { useEffect, useRef, useState } from 'react'
import Niksel from '../design/mascot/Niksel'
import { NikselMini } from '../design/mascot/Niksel'
import { askNiksel, type ChatMessage } from '../lib/nikselChat'

/**
 * NikselChat — плавающий чат-помощник на Kimi (Moonshot AI).
 *
 * Поведение:
 *  - Кнопка-пингвин справа-снизу на всех страницах платформы.
 *  - Клик → открывается панель 380×560 с историей + полем ввода.
 *  - Поддержка вставки скриншота (Ctrl+V или drag/file-picker).
 *  - Никсель НЕ решает задачу — задаёт наводящие вопросы.
 *
 * Локальная история диалога живёт в localStorage (ek_niksel_chat_v1)
 * чтобы ребёнок не терял контекст между переходами.
 */

const STORAGE_KEY = 'ek_niksel_chat_v1'
const MAX_HISTORY = 20 // храним 20 последних сообщений

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChatMessage[]
    return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : []
  } catch {
    return []
  }
}

function saveHistory(h: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-MAX_HISTORY)))
  } catch {
    /* quota */
  }
}

export default function NikselChat() {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<ChatMessage[]>(() => loadHistory())
  const [input, setInput] = useState('')
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveHistory(history)
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [history])

  // Ctrl+V вставка картинки из буфера (только когда чат открыт)
  useEffect(() => {
    if (!open) return
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return
      const items = Array.from(e.clipboardData.items)
      const img = items.find((i) => i.type.startsWith('image/'))
      if (!img) return
      e.preventDefault()
      const file = img.getAsFile()
      if (!file) return
      readImageAsDataUrl(file).then(setPendingImage).catch(() => {})
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [open])

  const pickImage = () => fileRef.current?.click()

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const url = await readImageAsDataUrl(f)
      setPendingImage(url)
    } catch {
      setErr('Не получилось прочитать картинку')
    } finally {
      e.target.value = ''
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setErr(null)
    setSending(true)
    const newUserMsg: ChatMessage = {
      role: 'user',
      text,
      image: pendingImage ?? undefined,
    }
    const nextHistory = [...history, newUserMsg]
    setHistory(nextHistory)
    setInput('')
    setPendingImage(null)
    try {
      const reply = await askNiksel(history, text, pendingImage ?? undefined)
      setHistory([...nextHistory, { role: 'assistant', text: reply }])
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      // Откатываем юзер-сообщение если упал запрос? Оставим, чтобы кидало «повторить».
    } finally {
      setSending(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const reset = () => {
    setHistory([])
    setInput('')
    setPendingImage(null)
    setErr(null)
    setConfirmReset(false)
  }

  return (
    <>
      <button
        className={`nk-chat-fab ${open ? 'active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Закрыть Никселя' : 'Спросить Никселя'}
        aria-label={open ? 'Закрыть чат с Никселем' : 'Открыть чат с Никселем'}
      >
        {open ? '×' : <NikselMini size={42} />}
      </button>

      {open && (
        <aside className="nk-chat-panel" role="dialog" aria-label="Чат с Никселем">
          <header className="nk-chat-head">
            <div className="nk-chat-head-l">
              <div className="nk-chat-avatar">
                <Niksel pose="wave" size={48} />
              </div>
              <div>
                <strong>Никсель</strong>
                <small>Спрашивай — помогу разобраться</small>
              </div>
            </div>
            {confirmReset ? (
              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button className="nk-chat-reset" onClick={reset} title="Подтвердить очистку" style={{ color: '#ff5464' }}>✓</button>
                <button className="nk-chat-reset" onClick={() => setConfirmReset(false)} title="Отмена">✕</button>
              </span>
            ) : (
              <button
                className="nk-chat-reset"
                onClick={() => setConfirmReset(true)}
                title="Очистить историю"
                aria-label="Очистить историю"
              >
                ↻
              </button>
            )}
          </header>

          <div className="nk-chat-scroll" ref={scrollRef}>
            {history.length === 0 && (
              <div className="nk-chat-welcome">
                <p>
                  Привет! Я Никсель. 👋 Спроси меня что-то про урок, код или платформу.
                  Могу посмотреть скриншот — вставь через <kbd>Ctrl+V</kbd> или кнопку 📎.
                </p>
                <p style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-soft)' }}>
                  Я не решаю задания за тебя — помогу понять, где застрял.
                </p>
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className={`nk-chat-msg nk-chat-msg--${m.role}`}>
                {m.image && (
                  <img src={m.image} alt="Приложенная картинка" className="nk-chat-img" />
                )}
                <div className="nk-chat-bubble">{m.text}</div>
              </div>
            ))}
            {sending && (
              <div className="nk-chat-msg nk-chat-msg--assistant">
                <div className="nk-chat-bubble nk-chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {err && <div className="nk-chat-err">{err}</div>}

          {pendingImage && (
            <div className="nk-chat-preview">
              <img src={pendingImage} alt="Приложенная" />
              <button onClick={() => setPendingImage(null)} title="Убрать">×</button>
            </div>
          )}

          <form
            className="nk-chat-input"
            onSubmit={(e) => {
              e.preventDefault()
              void send()
            }}
          >
            <button
              type="button"
              className="nk-chat-attach"
              onClick={pickImage}
              title="Прикрепить картинку"
              aria-label="Прикрепить картинку"
            >
              📎
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFilePicked}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Спроси что хочешь…"
              rows={1}
              disabled={sending}
            />
            <button
              type="submit"
              className="nk-chat-send"
              disabled={sending || !input.trim()}
              title="Отправить (Enter)"
              aria-label="Отправить"
            >
              ➤
            </button>
          </form>
        </aside>
      )}
    </>
  )
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = () => rej(r.error)
    r.readAsDataURL(file)
  })
}
