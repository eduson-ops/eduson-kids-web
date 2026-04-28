/**
 * ChatRoom — generic real-time chat UI.
 * No external CSS — inline styles only.
 */

import { useEffect, useRef, useState } from 'react'
import {
  getChatSocket,
  joinRoom,
  sendMessage,
  onMessage,
  onHistory,
  type ChatMessage,
} from '../../lib/chatClient'

interface Props {
  room: string
  senderLogin: string
  senderName: string
  senderRole: string
  height?: number
}

const ROLE_COLORS: Record<string, string> = {
  teacher: '#7c3aed',
  parent: '#0d9488',
  child: '#6b7280',
  admin: '#dc2626',
}

function demoMsg(id: string, login: string, name: string, role: string, text: string, minutesAgo: number): ChatMessage {
  const d = new Date(Date.now() - minutesAgo * 60_000)
  return { id, room: 'demo', senderLogin: login, senderName: name, senderRole: role, text, createdAt: d.toISOString() }
}

const DEMO_MESSAGES: ChatMessage[] = [
  demoMsg('d1', 'teacher_anna', 'Анна Игоревна', 'teacher', 'Привет, ребята! 👋 Сегодня продолжаем урок 3 — переменные и счёт.', 18),
  demoMsg('d2', 'masha_7b', 'Маша', 'child', 'Привет! А как сделать так чтобы монетки считались?', 15),
  demoMsg('d3', 'teacher_anna', 'Анна Игоревна', 'teacher', 'Отличный вопрос! Используй переменную coins и прибавляй к ней в событии OnCollect.', 14),
  demoMsg('d4', 'petya_7b', 'Петя', 'child', 'Я сделал! У меня уже 30 монеток 🎉', 12),
  demoMsg('d5', 'parent_svetlana', 'Светлана (мама Маши)', 'parent', 'Добрый день! Маша сегодня занималась, всё хорошо?', 8),
  demoMsg('d6', 'teacher_anna', 'Анна Игоревна', 'teacher', 'Добрый день! Да, Маша молодец, очень активно участвует 👍', 7),
]

function roleColor(role: string): string {
  return ROLE_COLORS[role] ?? ROLE_COLORS.child
}

function roleLabelRu(role: string): string {
  if (role === 'teacher') return 'учитель'
  if (role === 'parent') return 'родитель'
  if (role === 'admin') return 'куратор'
  return 'ученик'
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function ChatRoom({ room, senderLogin, height = 480 }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [connected, setConnected] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const socket = getChatSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    if (socket.connected) setConnected(true)

    joinRoom(room)

    const cleanHistory = onHistory((msgs) => setMessages(msgs))
    const cleanMessage = onMessage((msg) => {
      setMessages((prev) => {
        // Avoid duplicates by id
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    // ── Mobile lifecycle: disconnect on background, reconnect on foreground ──
    // Prevents reconnect-storms + duplicate messages when the user locks phone
    // or switches apps. Relies on `app:background` / `app:foreground` events
    // dispatched by MobileAppShell via Capacitor + visibilitychange.
    let needsReconnect = false
    let hiddenAt = 0
    const HIDDEN_GRACE_MS = 5000

    const handleBackground = () => {
      if (socket.connected) {
        needsReconnect = true
        try {
          socket.disconnect()
        } catch {
          // ignore
        }
      }
    }
    const handleForeground = () => {
      if (!needsReconnect) return
      needsReconnect = false
      try {
        socket.connect()
        // Re-emit join so the server re-subscribes us to the room + resends history.
        // `onHistory` listener above replaces messages, so duplicates are avoided.
        // TODO: if no `history` event comes back after reconnect, fall back to REST fetch.
        joinRoom(room)
      } catch {
        // ignore
      }
    }

    // Web fallback: visibilitychange. Only fires the disconnect path after a
    // grace period so brief tab-switches don't thrash the connection.
    let graceTimer: ReturnType<typeof setTimeout> | null = null
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
        if (graceTimer) clearTimeout(graceTimer)
        graceTimer = setTimeout(() => {
          if (document.visibilityState === 'hidden') handleBackground()
        }, HIDDEN_GRACE_MS)
      } else {
        if (graceTimer) {
          clearTimeout(graceTimer)
          graceTimer = null
        }
        // Only reconnect if we actually disconnected (i.e. was hidden > grace).
        if (hiddenAt && Date.now() - hiddenAt >= HIDDEN_GRACE_MS) {
          handleForeground()
        }
        hiddenAt = 0
      }
    }

    window.addEventListener('app:background', handleBackground)
    window.addEventListener('app:foreground', handleForeground)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      cleanHistory()
      cleanMessage()
      window.removeEventListener('app:background', handleBackground)
      window.removeEventListener('app:foreground', handleForeground)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (graceTimer) clearTimeout(graceTimer)
    }
  }, [room])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || !connected) return
    sendMessage(room, text)
    setInputText('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="ek-chat-room"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        border: '1px solid var(--border, #e5e2f0)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--paper, #fffbf3)',
        fontFamily: 'inherit',
      }}
    >
      {/* Connection status bar */}
      <div
        style={{
          padding: '6px 16px',
          background: connected ? '#d1fae5' : '#fee2e2',
          color: connected ? '#065f46' : '#991b1b',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: connected ? '#10b981' : '#ef4444',
            display: 'inline-block',
          }}
        />
        {connected ? 'Подключено' : 'Нет соединения…'}
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
        aria-live="polite"
        aria-label="История чата"
      >
        {messages.length === 0 && connected && (
          <div
            style={{
              color: 'var(--ink-soft, #6b7280)',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 32,
            }}
          >
            Пока нет сообщений. Начни первым!
          </div>
        )}
        {(messages.length > 0 ? messages : !connected ? DEMO_MESSAGES : []).map((msg) => {
          const color = roleColor(msg.senderRole)
          const isOwn = msg.senderLogin === senderLogin
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: 10,
                flexDirection: isOwn ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar initial */}
              <div
                aria-hidden
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {msg.senderName.charAt(0).toUpperCase()}
              </div>

              {/* Bubble */}
              <div
                style={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: isOwn ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Name + role */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#15141b' }}>
                    {msg.senderName}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#fff',
                      background: color,
                      borderRadius: 4,
                      padding: '1px 5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {roleLabelRu(msg.senderRole)}
                  </span>
                </div>

                {/* Text bubble */}
                <div
                  style={{
                    background: isOwn ? color : 'var(--ink-900, #f3f0ff)',
                    color: isOwn ? '#fff' : '#15141b',
                    padding: '8px 12px',
                    borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    fontSize: 14,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>

                {/* Time */}
                <span style={{ fontSize: 10, color: 'var(--ink-soft, #6b7280)' }}>
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div
        className="chat-composer"
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 12px',
          paddingBottom: 'calc(10px + var(--kb-height, 0px))',
          borderTop: '1px solid var(--border, #e5e2f0)',
          background: 'var(--paper, #fffbf3)',
          alignItems: 'flex-end',
          transition: 'padding-bottom 180ms ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? 'Написать сообщение… (Enter — отправить)' : 'Нет соединения…'}
          aria-label="Сообщение в чат"
          disabled={!connected}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            borderRadius: 10,
            border: '1px solid var(--border, #e5e2f0)',
            padding: '8px 12px',
            fontSize: 16, /* ≥16 prevents iOS input zoom */
            fontFamily: 'inherit',
            background: 'var(--bg, #fff)',
            color: '#15141b',
            outline: 'none',
            minHeight: 44,
            maxHeight: 100,
            overflow: 'auto',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!connected || !inputText.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: 'none',
            background: connected && inputText.trim() ? 'var(--violet, #6b5ce7)' : '#d1d5db',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            cursor: connected && inputText.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          aria-label="Отправить"
        >
          Отправить
        </button>
      </div>
    </div>
  )
}
