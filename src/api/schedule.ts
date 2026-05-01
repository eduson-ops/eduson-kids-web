import { api } from './client'

export type SlotType = 'regular' | 'trial' | 'makeup'
export type SlotStatus = 'scheduled' | 'conducted' | 'cancelled' | 'transferred'

export interface SlotDto {
  id: string
  teacherId: string
  studentId: string | null
  classroomId: string | null
  datetime: string
  durationMin: number
  type: SlotType
  status: SlotStatus
  zoomLink: string | null
  notes: string | null
  rescheduledToId: string | null
}

export interface CreateSlotPayload {
  studentId?: string
  classroomId?: string
  datetime: string
  durationMin?: number
  type?: SlotType
  zoomLink?: string
  notes?: string
}

export function fetchMySlots(): Promise<SlotDto[]> {
  return api.get<SlotDto[]>('/schedule/my')
}

export function fetchClassroomSlots(classroomId: string): Promise<SlotDto[]> {
  return api.get<SlotDto[]>(`/schedule/classroom/${classroomId}`)
}

export function fetchAllSlots(from?: string, to?: string): Promise<SlotDto[]> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return api.get<SlotDto[]>(`/schedule/admin?${params.toString()}`)
}

export function createSlot(payload: CreateSlotPayload): Promise<SlotDto> {
  return api.post<SlotDto>('/schedule/slots', payload)
}

export function updateSlotStatus(
  slotId: string,
  status: SlotStatus,
  rescheduledTo?: string,
): Promise<SlotDto> {
  return api.patch<SlotDto>(`/schedule/slots/${slotId}/status`, { status, rescheduledTo })
}

export function patchSlot(slotId: string, patch: Partial<CreateSlotPayload>): Promise<SlotDto> {
  return api.patch<SlotDto>(`/schedule/slots/${slotId}`, patch)
}
