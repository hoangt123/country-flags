/**
 * Optional auto-save of progress to a local file (File System Access API, Chrome/Edge).
 * The file handle is remembered in IndexedDB so the app can reconnect on the next visit.
 * Browsers without the API fall back to manual export/import.
 */
import { useSyncExternalStore } from 'react'
import { mergeStates, parseState, store } from './store'

export interface FileSyncStatus {
  supported: boolean
  linked: boolean
  name: string | null
  permission: 'granted' | 'prompt' | 'none'
  lastSaved: number | null
  error: string | null
  busy: boolean
}

export const fsSupported = typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function'

let status: FileSyncStatus = { supported: fsSupported, linked: false, name: null, permission: 'none', lastSaved: null, error: null, busy: false }
let handle: FileSystemFileHandle | null = null
const listeners = new Set<() => void>()
let saveTimer: number | null = null
let unsubscribe: (() => void) | null = null

function update(patch: Partial<FileSyncStatus>) {
  status = { ...status, ...patch }
  listeners.forEach((l) => l())
}

export function useFileSync(): FileSyncStatus {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => status,
    () => status,
  )
}

// --- tiny IndexedDB key/value store for the file handle ---
const DB = 'flagquest-files'
function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore('kv')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idb()
  return new Promise((resolve, reject) => {
    const req = db.transaction('kv').objectStore('kv').get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}
async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await idb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite')
    tx.objectStore('kv').put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
async function idbDel(key: string): Promise<void> {
  const db = await idb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite')
    tx.objectStore('kv').delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const PICKER: FilePickerOptions = {
  suggestedName: 'flag-quest-progress.json',
  id: 'flagquest-progress',
  types: [{ description: 'Flag Quest progress', accept: { 'application/json': ['.json'] } }],
}

async function writeNow(): Promise<void> {
  if (!handle) return
  const w = await handle.createWritable()
  await w.write(store.exportJSON())
  await w.close()
  update({ lastSaved: Date.now(), error: null })
}

function scheduleWrite() {
  if (saveTimer) window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    saveTimer = null
    writeNow().catch((e: Error) => update({ error: `Could not save to file: ${e.message}` }))
  }, 700)
}

/** Read the file, merge with what's in the browser, and write the merged result back. */
async function reconcile(): Promise<void> {
  if (!handle) return
  const file = await handle.getFile()
  const text = await file.text()
  if (text.trim()) {
    try {
      const fromFile = parseState(JSON.parse(text))
      const merged = mergeStates(store.get(), fromFile)
      store.replace(merged)
    } catch {
      // Unreadable file content: keep browser state and overwrite the file below.
    }
  }
  await writeNow()
}

function watchStore() {
  if (unsubscribe) return
  unsubscribe = store.subscribe(scheduleWrite)
}

async function activate(h: FileSystemFileHandle) {
  handle = h
  await idbSet('handle', h)
  update({ linked: true, name: h.name, permission: 'granted', busy: true, error: null })
  try {
    await reconcile()
    watchStore()
  } finally {
    update({ busy: false })
  }
}

/** Create a new progress file (or pick an existing one to overwrite/merge) and auto-save to it. */
export async function linkNewFile(): Promise<void> {
  if (!window.showSaveFilePicker) throw new Error('Not supported in this browser')
  const h = await window.showSaveFilePicker(PICKER)
  await activate(h)
}

/** Open an existing progress file: its contents are merged in, then it is kept in sync. */
export async function linkExistingFile(): Promise<void> {
  if (!window.showOpenFilePicker) throw new Error('Not supported in this browser')
  const [h] = await window.showOpenFilePicker({ ...PICKER, multiple: false })
  await activate(h)
}

/** After a reload the browser needs a click to re-grant access to the remembered file. */
export async function reconnect(): Promise<void> {
  if (!handle || !handle.requestPermission) return
  const p = await handle.requestPermission({ mode: 'readwrite' })
  if (p === 'granted') await activate(handle)
  else update({ permission: 'prompt', error: 'Permission to the progress file was not granted.' })
}

export async function unlink(): Promise<void> {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  handle = null
  await idbDel('handle')
  update({ linked: false, name: null, permission: 'none', lastSaved: null, error: null })
}

/** Called once at startup: restore the remembered handle and sync if we still have permission. */
export async function initFileSync(): Promise<void> {
  // Ask the browser not to evict our localStorage/IndexedDB under storage pressure.
  try {
    await navigator.storage?.persist?.()
  } catch {
    /* ignore */
  }
  if (!fsSupported) return
  try {
    const h = await idbGet<FileSystemFileHandle>('handle')
    if (!h) return
    handle = h
    const perm = h.queryPermission ? await h.queryPermission({ mode: 'readwrite' }) : 'prompt'
    if (perm === 'granted') await activate(h)
    else update({ linked: true, name: h.name, permission: 'prompt' })
  } catch (e) {
    update({ error: `Could not reconnect progress file: ${(e as Error).message}` })
  }
}
