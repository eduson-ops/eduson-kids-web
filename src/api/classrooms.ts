import { api } from './client'

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
