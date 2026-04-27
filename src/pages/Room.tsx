/**
 * Room — branded LiveKit video conference room.
 * Route: /room/:roomId   Full-screen, no PlatformShell.
 * Token is generated client-side for testing — move to backend for production.
 */

import '@livekit/components-styles'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  DisconnectButton,
  Chat,
  useParticipants,
  useTracks,
  useLocalParticipant,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { NikselMini } from '../design/mascot/Niksel'
import { apiRoomToken } from '../lib/api'

const LK_URL_FALLBACK = 'wss://edusonlms-apk4qgt4.livekit.cloud'
const LK_KEY_FALLBACK = 'APIsABHfKrBN9xG'
const LK_SECRET_FALLBACK = 'fTjEXOUcKkeeDuIUxyqfRKzQbdZFq4MXBjQbrSM66qLC'

// ── Fallback: client-side JWT when backend is unavailable ─────────────────
function b64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
async function makeFallbackToken(roomName: string, identity: string): Promise<{ token: string; url: string }> {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = b64url(JSON.stringify({
    iss: LK_KEY_FALLBACK, sub: identity, iat: now, exp: now + 7200,
    video: { room: roomName, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true },
  }))
  const signingInput = `${header}.${payload}`
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(LK_SECRET_FALLBACK), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  return { token: `${signingInput}.${b64url(sig)}`, url: LK_URL_FALLBACK }
}
// ─────────────────────────────────────────────────────────────────────────

// ── Branded inner layout ──────────────────────────────────────────────────
function EdusonConference({ roomId, onLeave }: { roomId: string; onLeave: () => void }) {
  const [chatOpen, setChatOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  const remoteCount = participants.filter((p) => p.identity !== localParticipant?.identity).length

  return (
    <div className="ek-room">
      {/* ── Top bar ── */}
      <header className="ek-room-header">
        <div className="ek-room-header-brand">
          <NikselMini size={28} />
          <span className="ek-room-header-title">Эдюсон Kids</span>
          <span className="ek-room-header-divider">·</span>
          <span className="ek-room-header-room">{roomId}</span>
        </div>
        <div className="ek-room-header-right">
          <span className="ek-room-participants">
            👥 {participants.length} {participants.length === 1 ? 'участник' : 'участника'}
          </span>
          <button className="ek-room-copy-btn" onClick={copyLink}>
            {linkCopied ? '✓ Скопировано' : '🔗 Ссылка'}
          </button>
        </div>
      </header>

      {/* ── Main area ── */}
      <div className="ek-room-body">
        {/* Video grid */}
        <div className="ek-room-stage">
          {remoteCount === 0 ? (
            <div className="ek-room-waiting">
              <div className="ek-room-waiting-icon">⏳</div>
              <p className="ek-room-waiting-title">Ожидание участников…</p>
              <p className="ek-room-waiting-sub">Поделись ссылкой, чтобы другие могли подключиться</p>
              <button className="ek-room-waiting-copy" onClick={copyLink}>
                {linkCopied ? '✓ Ссылка скопирована' : '🔗 Скопировать ссылку на урок'}
              </button>
            </div>
          ) : (
            <GridLayout tracks={tracks} className="ek-room-grid">
              <ParticipantTile />
            </GridLayout>
          )}
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <aside className="ek-room-chat-panel">
            <div className="ek-room-chat-head">
              <span>💬 Чат</span>
              <button className="ek-room-chat-close" onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <Chat className="ek-room-chat" messageFormatter={(msg) => msg} />
          </aside>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <footer className="ek-room-controls">
        <div className="ek-room-controls-group">
          <TrackToggle source={Track.Source.Microphone} className="ek-ctrl-btn" showIcon>
            <span className="ek-ctrl-label">Микрофон</span>
          </TrackToggle>
          <TrackToggle source={Track.Source.Camera} className="ek-ctrl-btn" showIcon>
            <span className="ek-ctrl-label">Камера</span>
          </TrackToggle>
          <TrackToggle source={Track.Source.ScreenShare} className="ek-ctrl-btn" showIcon>
            <span className="ek-ctrl-label">Экран</span>
          </TrackToggle>
        </div>

        <div className="ek-room-controls-center">
          <DisconnectButton className="ek-ctrl-leave" onClick={onLeave}>
            ✕ Завершить
          </DisconnectButton>
        </div>

        <div className="ek-room-controls-group">
          <button
            className={`ek-ctrl-btn ek-ctrl-btn--icon ${chatOpen ? 'ek-ctrl-btn--active' : ''}`}
            onClick={() => setChatOpen((v) => !v)}
            title="Открыть чат"
          >
            💬 <span className="ek-ctrl-label">Чат</span>
          </button>
        </div>
      </footer>

      <RoomAudioRenderer />
    </div>
  )
}

// ── Join screen ───────────────────────────────────────────────────────────
export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const safeRoom = roomId ?? 'урок'

  const [token, setToken] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string>(LK_URL_FALLBACK)
  const [name, setName] = useState('')
  const [joining, setJoining] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [lkConnect, setLkConnect] = useState(true)
  const needsReconnectRef = useRef(false)

  // ── Mobile lifecycle: background → disconnect LiveKit, foreground → reconnect.
  // Prevents reconnect storms + WebRTC state rot when the user locks the phone
  // or switches apps. LiveKitRoom reacts to the `connect` prop.
  useEffect(() => {
    if (!token) return

    let hiddenAt = 0
    const HIDDEN_GRACE_MS = 5000
    let graceTimer: ReturnType<typeof setTimeout> | null = null

    const handleBackground = () => {
      if (lkConnect) {
        needsReconnectRef.current = true
        setLkConnect(false)
      }
    }
    const handleForeground = () => {
      if (needsReconnectRef.current) {
        needsReconnectRef.current = false
        setLkConnect(true)
      }
    }
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
      window.removeEventListener('app:background', handleBackground)
      window.removeEventListener('app:foreground', handleForeground)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (graceTimer) clearTimeout(graceTimer)
    }
  }, [token, lkConnect])

  const join = useCallback(async () => {
    const n = name.trim()
    if (!n) { setErr('Введи своё имя'); return }
    setJoining(true); setErr(null)
    try {
      const backendResult = await apiRoomToken(safeRoom, n)
      if (backendResult) {
        setToken(backendResult.token)
        setServerUrl(backendResult.url)
      } else {
        const fallback = await makeFallbackToken(safeRoom, n)
        setToken(fallback.token)
        setServerUrl(fallback.url)
      }
    } catch (e) {
      setErr('Ошибка подключения: ' + String(e))
    } finally {
      setJoining(false)
    }
  }, [name, safeRoom])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  if (!token) {
    return (
      <div className="lk-room-join">
        <div className="lk-room-join-card">
          <div className="lk-room-join-brand">
            <NikselMini size={40} />
            <span className="lk-room-join-brand-name">Эдюсон Kids</span>
          </div>
          <h1 className="lk-room-join-title">Войти в урок</h1>
          <p className="lk-room-join-room">Комната: <strong>{safeRoom}</strong></p>

          {err && <div className="lk-room-join-err">{err}</div>}

          <input
            className="lk-room-join-input"
            type="text"
            placeholder="Твоё имя (например: Саша)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void join() }}
            autoFocus
          />

          <button className="lk-room-join-btn" onClick={() => void join()} disabled={joining}>
            {joining ? '⏳ Подключаюсь…' : '→ Войти в комнату'}
          </button>

          <div className="lk-room-join-actions">
            <button className="lk-room-join-link-btn" onClick={copyLink}>
              {linkCopied ? '✓ Ссылка скопирована' : '🔗 Скопировать ссылку'}
            </button>
            <button className="lk-room-join-back" onClick={() => navigate('/')}>
              ← Главная
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video token={token} serverUrl={serverUrl}
      connect={lkConnect}
      data-lk-theme="default"
      style={{ height: '100vh' }}
      onDisconnected={() => {
        // Only fully exit if this wasn't a mobile-lifecycle-triggered disconnect.
        if (!needsReconnectRef.current) setToken(null)
      }}
    >
      <EdusonConference roomId={safeRoom} onLeave={() => setToken(null)} />
    </LiveKitRoom>
  )
}
