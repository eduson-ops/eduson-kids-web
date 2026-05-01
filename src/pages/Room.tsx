/**
 * Room — branded LiveKit video conference room.
 * Route: /room/:roomId   Full-screen, no PlatformShell.
 * Token is generated client-side for testing — move to backend for production.
 */

import '@livekit/components-styles'
import { useState, useCallback, useEffect, useRef } from 'react'

const LINK_COPIED_RESET_MS = 2500
import { useParams, useNavigate } from 'react-router-dom'
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  FocusLayout,
  CarouselLayout,
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
    iss: LK_KEY_FALLBACK,
    sub: identity,
    iat: now,
    exp: now + 7200,
    nbf: now,
    video: {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      // Explicit screen share grants — some LK Cloud tenants require this
      canPublishSources: ['camera', 'microphone', 'screen_share', 'screen_share_audio'],
    },
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
  const [showCameras, setShowCameras] = useState(false)
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  // Auto-focus screen share: if anyone shares — fullscreen mode (Zoom-style)
  const screenShareTracks = tracks.filter(
    (t) => t.publication?.source === Track.Source.ScreenShare,
  )
  const cameraTracks = tracks.filter(
    (t) => t.publication?.source !== Track.Source.ScreenShare,
  )
  const hasScreenShare = screenShareTracks.length > 0

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), LINK_COPIED_RESET_MS)
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
          ) : hasScreenShare ? (
            <div className={`ek-room-focus ${showCameras ? 'ek-room-focus--with-cams' : 'ek-room-focus--solo'}`}>
              {screenShareTracks[0] && <FocusLayout trackRef={screenShareTracks[0]} />}
              {showCameras && cameraTracks.length > 0 && (
                <CarouselLayout tracks={cameraTracks}>
                  <ParticipantTile />
                </CarouselLayout>
              )}
              <button
                className="ek-room-toggle-cams"
                onClick={() => setShowCameras((v) => !v)}
                aria-label={showCameras ? 'Скрыть камеры участников' : `Показать камеры участников (${cameraTracks.length})`}
                aria-pressed={showCameras}
              >
                {showCameras ? '⤢ Только экран' : `👥 Камеры (${cameraTracks.length})`}
              </button>
            </div>
          ) : (
            <GridLayout tracks={cameraTracks} className="ek-room-grid">
              <ParticipantTile />
            </GridLayout>
          )}
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <aside className="ek-room-chat-panel">
            <div className="ek-room-chat-head">
              <span>💬 Чат</span>
              <button className="ek-room-chat-close" onClick={() => setChatOpen(false)} aria-label="Закрыть чат">✕</button>
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
            aria-label={chatOpen ? 'Закрыть чат' : 'Открыть чат'}
            aria-expanded={chatOpen}
          >
            <span aria-hidden>💬</span> <span className="ek-ctrl-label">Чат</span>
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

  // ── Native mobile lifecycle ONLY (Capacitor app:background/foreground events).
  // We deliberately do NOT listen to document.visibilitychange in the browser:
  // the screen-share picker triggers a hidden visibility state, which previously
  // caused a disconnect → reconnect loop and PublishTrackError during a demo.
  // LiveKitRoom handles browser visibility internally via WebRTC perfect-negotiation.
  useEffect(() => {
    if (!token) return

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

    // These events are dispatched ONLY by the Capacitor native shell
    // (see src/lib/native-boot.ts). They never fire in pure web.
    window.addEventListener('app:background', handleBackground)
    window.addEventListener('app:foreground', handleForeground)

    return () => {
      window.removeEventListener('app:background', handleBackground)
      window.removeEventListener('app:foreground', handleForeground)
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
    setTimeout(() => setLinkCopied(false), LINK_COPIED_RESET_MS)
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
            aria-label="Твоё имя"
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
      // Lower screen-share bitrate so free-tier LK Cloud doesn't kick on bandwidth.
      // 1280×720 @ 15fps @ 1.5 Mbps is plenty for code/UI demos and stays under tier limits.
      options={{
        // The screen-share system picker briefly hides the tab (visibilitychange → hidden),
        // which makes livekit-client think the page is gone and triggers a disconnect.
        // Disabling this prevents the kick while the user picks a screen.
        disconnectOnPageLeave: false,
        publishDefaults: {
          screenShareEncoding: {
            maxBitrate: 1_500_000,
            maxFramerate: 15,
          },
          // Force VP8 — some Chromium versions disconnect mid-call on VP9/H.264 over LK Cloud
          videoCodec: 'vp8',
          dtx: true,
        },
        reconnectPolicy: {
          nextRetryDelayInMs: () => 2000,
        },
      }}
      onDisconnected={(reason) => {
        // eslint-disable-next-line no-console
        console.warn('[LiveKit] disconnected:', reason)
        // Give 3s grace for auto-reconnect (e.g. brief network blip during screen-share).
        // If lkConnect is still true after grace period, the SDK couldn't recover — exit room.
        if (!needsReconnectRef.current) {
          setTimeout(() => {
            setToken((prev) => (prev ? null : prev))
          }, 3000)
        }
      }}
      onError={(err) => {
        // eslint-disable-next-line no-console
        console.error('[LiveKit] room error:', err)
      }}
    >
      <EdusonConference roomId={safeRoom} onLeave={() => setToken(null)} />
    </LiveKitRoom>
  )
}
