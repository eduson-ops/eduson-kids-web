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
