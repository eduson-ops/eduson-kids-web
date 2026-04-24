/**
 * Room — full-screen WebRTC video room.
 * Route: /room/:roomId
 * Does NOT use PlatformShell (full screen experience).
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiGetRoom } from '../lib/api'
import {
  joinRtcRoom,
  sendOffer,
  sendAnswer,
  sendIce,
  onRtcOffer,
  onRtcAnswer,
  onRtcIce,
  getChatSocket,
} from '../lib/chatClient'

type RoomMode = 'waiting' | 'connected' | 'error'

interface RoomInfo {
  id: string
  status: string
  meetLink: string
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [connected, setConnected] = useState(false)
  const [mode, setMode] = useState<RoomMode>('waiting')
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const safeRoomId = roomId ?? ''

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.ontrack = (evt) => {
      if (remoteVideoRef.current && evt.streams[0]) {
        remoteVideoRef.current.srcObject = evt.streams[0]
        setMode('connected')
      }
    }

    pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        sendIce(safeRoomId, evt.candidate)
      }
    }

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        if (pc.localDescription) {
          sendOffer(safeRoomId, pc.localDescription)
        }
      } catch (err) {
        console.warn('Negotiation error', err)
      }
    }

    return pc
  }, [safeRoomId])

  useEffect(() => {
    if (!safeRoomId) {
      setMode('error')
      setErrorMsg('Неверный ID комнаты')
      return
    }

    let cancelled = false

    const setup = async () => {
      // 1. Fetch room info
      const info = await apiGetRoom(safeRoomId)
      if (!cancelled) setRoomInfo(info ? { id: info.id, status: info.status, meetLink: info.meetLink } : null)

      // 2. Get local media
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      } catch (err) {
        if (!cancelled) {
          setMode('error')
          setErrorMsg('Нет доступа к камере или микрофону. Разреши доступ в браузере.')
        }
        return
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // 3. Create peer connection
      const pc = createPeerConnection()
      pcRef.current = pc

      // 4. Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      // 5. Join signaling room
      const socket = getChatSocket()
      socket.on('connect', () => setConnected(true))
      socket.on('disconnect', () => setConnected(false))
      if (socket.connected) setConnected(true)

      joinRtcRoom(safeRoomId)

      // 6. Handle signaling events
      const cleanOffer = onRtcOffer(async ({ sdp }) => {
        if (!pcRef.current) return
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp))
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        if (pcRef.current.localDescription) {
          sendAnswer(safeRoomId, pcRef.current.localDescription)
        }
      })

      const cleanAnswer = onRtcAnswer(async ({ sdp }) => {
        if (!pcRef.current) return
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp))
      })

      const cleanIce = onRtcIce(async ({ candidate }) => {
        if (!pcRef.current) return
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        } catch {
          /* ignore stale candidates */
        }
      })

      return () => {
        cleanOffer()
        cleanAnswer()
        cleanIce()
      }
    }

    const cleanupPromise = setup()

    return () => {
      cancelled = true
      cleanupPromise.then((cleanup) => cleanup?.())
      // Stop all tracks
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      // Close peer connection
      pcRef.current?.close()
      pcRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRoomId])

  const toggleMute = () => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getAudioTracks().forEach((t) => { t.enabled = muted })
    setMuted((v) => !v)
  }

  const toggleVideo = () => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getVideoTracks().forEach((t) => { t.enabled = videoOff })
    setVideoOff((v) => !v)
  }

  const toggleScreenShare = async () => {
    if (screenSharing) {
      // Revert to camera
      const stream = localStreamRef.current
      if (stream && pcRef.current) {
        const videoTrack = stream.getVideoTracks()[0]
        if (videoTrack) {
          const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video')
          if (sender) await sender.replaceTrack(videoTrack)
        }
      }
      setScreenSharing(false)
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = displayStream.getVideoTracks()[0]
        if (screenTrack && pcRef.current) {
          const sender = pcRef.current.getSenders().find((s) => s.track?.kind === 'video')
          if (sender) await sender.replaceTrack(screenTrack)
          // Also update local preview
          if (localVideoRef.current) {
            const stream = new MediaStream([screenTrack])
            localVideoRef.current.srcObject = stream
          }
          screenTrack.onended = () => {
            setScreenSharing(false)
            // Revert to camera track
            const camTrack = localStreamRef.current?.getVideoTracks()[0]
            if (camTrack && pcRef.current) {
              const s = pcRef.current.getSenders().find((ss) => ss.track?.kind === 'video')
              if (s) s.replaceTrack(camTrack)
            }
          }
        }
        setScreenSharing(true)
      } catch {
        /* User cancelled or permission denied */
      }
    }
  }

  const copyLink = () => {
    const link = roomInfo?.meetLink ?? window.location.href
    navigator.clipboard.writeText(link).catch(() => { /* ignore */ })
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const leave = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    navigate('/')
  }

  if (mode === 'error') {
    return (
      <div style={{ background: '#0f0f0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h2 style={{ margin: 0 }}>Ошибка комнаты</h2>
        <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: 360 }}>{errorMsg || 'Не удалось подключиться к комнате'}</p>
        <button
          onClick={() => navigate('/')}
          style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
        >
          Вернуться на главную
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
          Комната: {safeRoomId}
        </span>
        {roomInfo && (
          <span style={{
            background: roomInfo.status === 'active' ? '#065f46' : '#374151',
            color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 8px',
            textTransform: 'uppercase',
          }}>
            {roomInfo.status}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={copyLink}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
        >
          {linkCopied ? '✓ Скопировано' : '🔗 Скопировать ссылку'}
        </button>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
          color: connected ? '#34d399' : '#f87171',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#10b981' : '#ef4444', display: 'inline-block' }} />
          {connected ? 'Сигнал' : 'Нет сигнала'}
        </span>
      </div>

      {/* Remote video */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 56, paddingBottom: 80 }}>
        {mode === 'waiting' ? (
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#e5e7eb' }}>Ожидание участников…</p>
            <p style={{ fontSize: 14 }}>Поделись ссылкой чтобы другие могли присоединиться</p>
          </div>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', maxWidth: 900, height: 'auto', borderRadius: 12, background: '#1f1f1f' }}
            aria-label="Видео собеседника"
          />
        )}
      </div>

      {/* Local video (picture-in-picture) */}
      <div style={{
        position: 'absolute', bottom: 90, right: 20, zIndex: 20,
        width: 200, borderRadius: 10, overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        background: '#1f1f1f',
      }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', display: 'block' }}
          aria-label="Моё видео"
        />
        <div style={{ position: 'absolute', bottom: 4, left: 6, fontSize: 10, color: '#fff', background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '1px 5px' }}>
          Я
        </div>
      </div>

      {/* Bottom controls bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <ControlBtn
          label={muted ? '🔇' : '🎤'}
          title={muted ? 'Включить микрофон' : 'Выключить микрофон'}
          active={!muted}
          onClick={toggleMute}
        />
        <ControlBtn
          label={videoOff ? '📵' : '📹'}
          title={videoOff ? 'Включить камеру' : 'Выключить камеру'}
          active={!videoOff}
          onClick={toggleVideo}
        />
        <ControlBtn
          label="🖥️"
          title={screenSharing ? 'Остановить демонстрацию' : 'Демонстрация экрана'}
          active={screenSharing}
          onClick={toggleScreenShare}
        />
        <button
          onClick={leave}
          title="Покинуть комнату"
          style={{
            background: '#dc2626', border: 'none', color: '#fff',
            borderRadius: 12, padding: '10px 20px', cursor: 'pointer',
            fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ✕ Покинуть
        </button>
      </div>
    </div>
  )
}

function ControlBtn({ label, title, active, onClick }: { label: string; title: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'rgba(255,255,255,0.15)' : 'rgba(220,38,38,0.3)',
        border: 'none', color: '#fff', borderRadius: 12,
        width: 52, height: 52, fontSize: 22, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}
