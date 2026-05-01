import { api } from './client'

export type NotificationType =
  | 'lesson_reminder_24h'
  | 'lesson_reminder_1h'
  | 'lesson_cancelled'
  | 'substitution'
  | 'renewal_alert'
  | 'general'

export interface NotificationDto {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  slotId: string | null
  createdAt: string
}

export function fetchMyNotifications(): Promise<NotificationDto[]> {
  return api.get<NotificationDto[]>('/notifications/my')
}

export function fetchUnreadCount(): Promise<{ count: number }> {
  return api.get<{ count: number }>('/notifications/my/unread-count')
}

export function markNotificationRead(id: string): Promise<{ ok: boolean }> {
  return api.patch<{ ok: boolean }>(`/notifications/${id}/read`, {})
}

export function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  return api.patch<{ ok: boolean }>('/notifications/read-all', {})
}
