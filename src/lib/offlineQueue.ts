/**
 * IndexedDB-backed offline-save queue for the Studio.
 *
 * Layered alongside the Service Worker BackgroundSyncPlugin (see
 * vite.config.ts → workbox.runtimeCaching). The plugin auto-replays
 * failed PUT requests when the network returns. THIS module exists for
 * three additional cases the plugin cannot handle:
 *
 *   1. **Pre-flight queueing** — if the app already knows it is offline
 *      (via navigator.onLine === false) we never even attempt the fetch,
 *      we directly persist to IDB and signal the UI.
 *
 *   2. **Multi-device replay** — when the user moves to a different device
 *      while offline, the IDB store on the original device is kept until
 *      a manual sync. UI shows pending count.
 *
 *   3. **Visibility for the user** — UI components subscribe to queue
 *      changes via the simple in-process EventTarget below.
 *
 * Schema (single store: `pending-saves`):
 *   key: string  — `${projectId}:${timestamp}`
 *   value: { projectId, payload, queuedAt }
 *
 * Quota: ~100 entries per project max. Older entries dropped FIFO.
 */

const DB_NAME = 'kubik-offline'
const DB_VERSION = 1
const STORE = 'pending-saves'
const MAX_PER_PROJECT = 100

export interface PendingSave {
  key: string
  projectId: string
  payload: unknown
  queuedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'key' })
        store.createIndex('projectId', 'projectId', { unique: false })
        store.createIndex('queuedAt', 'queuedAt', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

const events = new EventTarget()

function emit(): void {
  events.dispatchEvent(new Event('change'))
}

export function onQueueChange(handler: () => void): () => void {
  events.addEventListener('change', handler)
  return () => events.removeEventListener('change', handler)
}

export async function enqueue(projectId: string, payload: unknown): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)

    // Drop oldest entries for this project if over MAX
    const idx = store.index('projectId')
    const req = idx.getAllKeys(projectId)
    req.onsuccess = () => {
      const existing = req.result as IDBValidKey[]
      if (existing.length >= MAX_PER_PROJECT) {
        const overflow = existing.length - MAX_PER_PROJECT + 1
        for (let i = 0; i < overflow; i++) {
          store.delete(existing[i]!)
        }
      }

      const entry: PendingSave = {
        key: `${projectId}:${Date.now()}:${Math.random().toString(36).slice(2, 6)}`,
        projectId,
        payload,
        queuedAt: Date.now(),
      }
      store.put(entry)
    }

    tx.oncomplete = () => {
      emit()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

export async function listPending(projectId?: string): Promise<PendingSave[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req = projectId
      ? store.index('projectId').getAll(projectId)
      : store.getAll()
    req.onsuccess = () => resolve(req.result as PendingSave[])
    req.onerror = () => reject(req.error)
  })
}

export async function pendingCount(projectId?: string): Promise<number> {
  const items = await listPending(projectId)
  return items.length
}

export async function dequeue(key: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => {
      emit()
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Replay all pending saves through the provided sender. Used on:
 *   - app focus / window online event
 *   - manual "sync now" UI action
 *   - on app start
 *
 * Sender returns Promise<boolean> — true if successful (we then dequeue),
 * false to keep in queue (will retry next replay).
 */
export async function replay(
  sender: (item: PendingSave) => Promise<boolean>,
): Promise<{ sent: number; remaining: number }> {
  const items = await listPending()
  // Replay in chronological order
  items.sort((a, b) => a.queuedAt - b.queuedAt)
  let sent = 0
  for (const item of items) {
    let ok = false
    try {
      ok = await sender(item)
    } catch {
      ok = false
    }
    if (ok) {
      await dequeue(item.key)
      sent++
    } else {
      // Stop on first failure — assume network gone
      break
    }
  }
  const remaining = (await listPending()).length
  return { sent, remaining }
}
