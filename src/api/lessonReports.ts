import { api } from './client'

export type ReportStatus = 'conducted' | 'cancelled' | 'transferred'

export interface ReportDto {
  id: string
  slotId: string | null
  teacherId: string
  studentId: string
  conductedAt: string
  status: ReportStatus
  grade: number | null
  notes: string | null
  vkRecordUrl: string | null
  isSubstitute: boolean
  substituteTeacherId: string | null
  lessonN: number | null
  createdAt: string
}

export interface CreateReportPayload {
  slotId?: string
  studentId: string
  conductedAt: string
  status: ReportStatus
  grade?: number
  notes?: string
  vkRecordUrl?: string
  isSubstitute?: boolean
  substituteTeacherId?: string
  lessonN?: number
}

export function fetchMyReports(): Promise<ReportDto[]> {
  return api.get<ReportDto[]>('/lesson-reports/my')
}

export function fetchStudentReports(studentId: string): Promise<ReportDto[]> {
  return api.get<ReportDto[]>(`/lesson-reports/student/${studentId}`)
}

export function createReport(payload: CreateReportPayload): Promise<ReportDto> {
  return api.post<ReportDto>('/lesson-reports', payload)
}
