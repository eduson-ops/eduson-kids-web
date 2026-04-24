import { useEffect, useRef, useState, useCallback } from 'react'
import { projectsApi, ApiError } from '../lib/projectsApi'
import { enqueue, onQueueChange, pendingCount, replay } from '../lib/offlineQueue'

/**
 * useCloudSave — debounced cloud save with offline fallback.
 *
 * Behavior:
 *   - Caller passes content getter; hook calls it on demand
 *   - Auto-saves with `intervalMs` debounce after last change
 *   - On network failure → IndexedDB queue, replays when online
 *   - Tracks save status: idle / saving / saved / queued / error
 *   - Listens for `online` event + window focus to flush queue
 *
 * Keep-alive contract: the hook NEVER throws. Errors are reflected in
 * `status` and `lastError`. Studio code can show banners but should not
 * block UI on save failures.
 */

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'queued' | 'error'

export interface UseCloudSaveOptions {
  intervalMs?: number
  enabled?: boolean
}

export interface UseCloudSaveResult {
  status: SaveStatus
  lastSavedAt: number | null
  lastError: string | null
  pendingInQueue: number
  manualSave: () => Promise<void>
  flushQueue: () => Promise<void>
  scheduleAutosave: () => void
}

export function useCloudSave(
  projectId: string | null,
  getContent: () => Record<string, unknown>,
  opts: UseCloudSaveOptions = {},
): UseCloudSaveResult {
  const intervalMs = opts.intervalMs ?? 30_000
  const enabled = opts.enabled ?? true

  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [pendingInQueue, setPendingInQueue] = useState<number>(0)

  const lastSerialized = useRef<string>('')
  const timer = useRef<number | null>(null)

  const performSave = useCallback(
    async (source: 'autosave' | 'manual'): Promise<void> => {
      if (!projectId || !enabled) return
      const content = getContent()
      const serialized = JSON.stringify(content)
      if (serialized === lastSerialized.current) {
        // No change since last save — skip
        return
      }
      setStatus('saving')
      try {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          await enqueue(projectId, { contentJson: content, source })
          lastSerialized.current = serialized
          setStatus('queued')
          setLastError('Сохранено локально, отправим когда появится сеть')
          return
        }
        await projectsApi.save(projectId, {
          contentJson: content,
          source,
        })
        lastSerialized.current = serialized
        setLastSavedAt(Date.now())
        setLastError(null)
        setStatus('saved')
      } catch (err) {
        if (err instanceof ApiError && (err.isOffline() || err.status === 503)) {
          await enqueue(projectId, { contentJson: content, source })
          lastSerialized.current = serialized
          setStatus('queued')
          setLastError('Нет сети — сохранили локально')
        } else {
          setStatus('error')
          setLastError((err as Error).message)
        }
      }
    },
    [projectId, enabled, getContent],
  )

  const scheduleAutosave = useCallback(() => {
    if (!projectId || !enabled) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      void performSave('autosave')
    }, intervalMs)
  }, [projectId, enabled, intervalMs, performSave])

  // Auto-save trigger: scheduleAutosave is exposed via render — caller can
  // call manualSave + invoke scheduleAutosave on every meaningful change.
  // For simplicity here we expose `manualSave` and rely on caller wiring.

  const manualSave = useCallback(() => performSave('manual'), [performSave])

  const flushQueue = useCallback(async () => {
    const result = await replay(async (item) => {
      const payload = item.payload as { contentJson: Record<string, unknown>; source?: string }
      try {
        await projectsApi.save(item.projectId, {
          contentJson: payload.contentJson,
          source: (payload.source as 'autosave') ?? 'autosave',
        })
        return true
      } catch {
        return false
      }
    })
    setPendingInQueue(result.remaining)
    if (result.sent > 0 && result.remaining === 0) {
      setStatus('saved')
      setLastSavedAt(Date.now())
      setLastError(null)
    }
  }, [])

  // Track queue state
  useEffect(() => {
    let alive = true
    const update = async () => {
      if (!alive) return
      const n = await pendingCount(projectId ?? undefined)
      setPendingInQueue(n)
    }
    update()
    const off = onQueueChange(update)
    return () => {
      alive = false
      off()
    }
  }, [projectId])

  // Listen for online/focus to flush
  useEffect(() => {
    const onOnline = () => void flushQueue()
    const onFocus = () => void flushQueue()
    window.addEventListener('online', onOnline)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('focus', onFocus)
    }
  }, [flushQueue])

  // Periodic safety net — try flushing once a minute regardless
  useEffect(() => {
    const id = window.setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        void flushQueue()
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [flushQueue])

  // Cleanup pending autosave timer on unmount
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  // scheduleAutosave is returned from the hook so callers can wire it onto
  // every meaningful change. Each call resets the debounce timer; when the
  // timer fires, we perform a save via `performSave('autosave')`.

  return {
    status,
    lastSavedAt,
    lastError,
    pendingInQueue,
    manualSave,
    flushQueue,
    scheduleAutosave,
  }
}
