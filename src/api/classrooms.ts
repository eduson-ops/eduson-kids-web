import { api, BASE } from './client'
import { getAccessToken } from '../lib/authStorage'

export interface ClassroomDto {
  id: string
  name: string
  teacherId: string
  studentCount: number
  inviteCode: string | null
  isArchived: boolean
  createdAt: string
  metadata: Record<string, unknown>
}

export interface StudentDto {
  id: string
  login: string
  classroomId: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface NewStudentResult {
  login: string
  pin: string
}

export function fetchClassrooms(): Promise<ClassroomDto[]> {
  return api.get<ClassroomDto[]>('/classrooms')
}

export function fetchClassroom(id: string): Promise<ClassroomDto> {
  return api.get<ClassroomDto>(`/classrooms/${id}`)
}

export function createClassroom(name: string): Promise<ClassroomDto> {
  return api.post<ClassroomDto>('/classrooms', { name })
}

export function updateClassroom(id: string, name: string): Promise<ClassroomDto> {
  return api.patch<ClassroomDto>(`/classrooms/${id}`, { name })
}

export function deleteClassroom(id: string): Promise<void> {
  return api.delete(`/classrooms/${id}`)
}

export function addStudents(
  classroomId: string,
  count: number,
  namePrefix: string,
): Promise<NewStudentResult[]> {
  return api.post<NewStudentResult[]>(`/classrooms/${classroomId}/students`, { count, namePrefix })
}

export function fetchStudents(classroomId: string): Promise<StudentDto[]> {
  return api.get<StudentDto[]>(`/classrooms/${classroomId}/students`)
}

export function transferStudent(
  fromClassroomId: string,
  studentId: string,
  toClassroomId: string,
): Promise<void> {
  return api.post(`/classrooms/${fromClassroomId}/transfer`, { studentId, toClassroomId })
}

export interface BulkStudentInput {
  firstName: string
  lastName?: string
  birthYear?: number
}

export function bulkCreateStudents(
  classroomId: string,
  students: BulkStudentInput[],
): Promise<NewStudentResult[]> {
  return api.post<NewStudentResult[]>(`/classrooms/${classroomId}/students/bulk`, { students })
}

/** Opens a PDF in a new tab / triggers download. Rotates PINs server-side. */
export async function downloadRosterPdf(classroomId: string): Promise<void> {
  const token = getAccessToken()
  const res = await fetch(`${BASE}/classrooms/${classroomId}/students/print-pdf`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!res.ok) throw new Error(res.statusText)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kubik-roster-${classroomId.slice(0, 8)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
