import { api } from './client'

export interface LessonAccessRow {
  lessonN: number
  unlocked: boolean
  completed: boolean
  score: number | null
  unlockedAt: string
  completedAt: string | null
}

export interface ClassroomProgressStudent {
  studentId: string
  studentLogin: string
  lessons: Record<number, { unlocked: boolean; completed: boolean; score: number | null }>
}

export interface UnlockResult {
  unlocked: number
  skipped: number
}

/** Student: get all unlocked lessons for the current user */
export function fetchMyAccess(): Promise<LessonAccessRow[]> {
  return api.get<LessonAccessRow[]>('/lesson-access/me')
}

/** Teacher: unlock a single lesson for a single student */
export function unlockLesson(payload: {
  studentId: string
  lessonN: number
  classroomId: string
}): Promise<LessonAccessRow> {
  return api.post<LessonAccessRow>('/lesson-access/unlock', payload)
}

/** Teacher: bulk-unlock a lesson for all (or selected) students in a classroom */
export function unlockBatch(payload: {
  classroomId: string
  lessonN: number
  studentIds?: string[]
}): Promise<UnlockResult> {
  return api.post<UnlockResult>('/lesson-access/unlock-batch', payload)
}

/** Student: mark a lesson as completed (with optional score 0-100) */
export function completeLesson(payload: {
  lessonN: number
  score?: number
}): Promise<LessonAccessRow> {
  return api.post<LessonAccessRow>('/lesson-access/complete', payload)
}

/** Teacher: get classroom-wide progress matrix */
export function fetchClassroomProgress(classroomId: string): Promise<ClassroomProgressStudent[]> {
  return api.get<ClassroomProgressStudent[]>(`/lesson-access/classroom/${classroomId}`)
}
