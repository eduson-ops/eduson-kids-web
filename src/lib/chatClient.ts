/**
 * chatClient.ts — Socket.IO client for chat + WebRTC signaling.
 * Connects to ${API_URL}/chat namespace.
 * Auth via handshake.auth token.
 */

import { io, type Socket } from 'socket.io-client'
import { getApiToken } from './api'

const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001'

export interface ChatMessage {
  id: string
  room: string
  senderLogin: string
  senderName: string
  senderRole: string
  text: string
  createdAt: string
}

// ─── Singleton socket ────────────────────────────────────────────────

let _socket: Socket | null = null

export function getChatSocket(): Socket {
  if (_socket && _socket.connected) return _socket
  if (_socket) {
    _socket.removeAllListeners()
    _socket.disconnect()
    _socket = null
  }
  const token = getApiToken() ?? ''
  _socket = io(`${API_URL}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
  })
  _socket.on('disconnect', () => {
    _socket = null
  })
  return _socket
}

// ─── Room ────────────────────────────────────────────────────────────

export function joinRoom(room: string): void {
  getChatSocket().emit('join', { room })
}

export function sendMessage(room: string, text: string): void {
  getChatSocket().emit('send', { room, text })
}

// ─── Listeners ───────────────────────────────────────────────────────

export function onMessage(cb: (msg: ChatMessage) => void): () => void {
  const socket = getChatSocket()
  socket.on('message', cb)
  return () => socket.off('message', cb)
}

export function onHistory(cb: (msgs: ChatMessage[]) => void): () => void {
  const socket = getChatSocket()
  socket.on('history', cb)
  return () => socket.off('history', cb)
}

// ─── WebRTC signaling ────────────────────────────────────────────────

export function joinRtcRoom(roomId: string): void {
  getChatSocket().emit('rtc:join-room', { roomId })
}

export function sendOffer(roomId: string, sdp: RTCSessionDescriptionInit): void {
  getChatSocket().emit('rtc:offer', { roomId, sdp })
}

export function sendAnswer(roomId: string, sdp: RTCSessionDescriptionInit): void {
  getChatSocket().emit('rtc:answer', { roomId, sdp })
}

export function sendIce(roomId: string, candidate: RTCIceCandidate): void {
  getChatSocket().emit('rtc:ice', { roomId, candidate: candidate.toJSON() })
}

export function onRtcOffer(
  cb: (payload: { roomId: string; sdp: RTCSessionDescriptionInit }) => void
): () => void {
  const socket = getChatSocket()
  socket.on('rtc:offer', cb)
  return () => socket.off('rtc:offer', cb)
}

export function onRtcAnswer(
  cb: (payload: { roomId: string; sdp: RTCSessionDescriptionInit }) => void
): () => void {
  const socket = getChatSocket()
  socket.on('rtc:answer', cb)
  return () => socket.off('rtc:answer', cb)
}

export function onRtcIce(
  cb: (payload: { roomId: string; candidate: RTCIceCandidateInit }) => void
): () => void {
  const socket = getChatSocket()
  socket.on('rtc:ice', cb)
  return () => socket.off('rtc:ice', cb)
}
