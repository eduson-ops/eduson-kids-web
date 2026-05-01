import { api } from './client'

export type GuestTokenType = 'trial' | 'masterclass'

export interface GuestTokenDto {
  id: string
  token: string
  type: GuestTokenType
  used: boolean
  expiresAt: string
  createdAt: string
  metadata: Record<string, unknown>
}

export interface CreateGuestTokenPayload {
  type: GuestTokenType
  ttlHours?: number
  metadata?: Record<string, unknown>
}

export function createGuestToken(payload: CreateGuestTokenPayload): Promise<GuestTokenDto> {
  return api.post<GuestTokenDto>('/guest/tokens', payload)
}

export function listGuestTokens(): Promise<GuestTokenDto[]> {
  return api.get<GuestTokenDto[]>('/guest/tokens')
}
