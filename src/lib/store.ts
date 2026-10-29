import { useSyncExternalStore } from 'react'
import { applyAnswer, type CardStat } from './srs'
import { dayKey } from './format'

export type AnswerMode = 'choice' | 'type'

export interface TestResult {
  id: string
  date: number
  total: number
  correct: number
  durationMs: number
  misses: string[] // country codes answered wrong
  mode: AnswerMode
  scope: string // e.g. "All regions"
}

export interface SessionResult {
  date: number
  total: number
  correct: number
  xp: number
  scope: string
}

export interface DayLog {
  answered: number
  correct: number
  xp: number
}

export interface Settings {
  answerMode: AnswerMode
  sound: boolean
  neighborLabels: boolean
  sessionSize: number
  regions: string[] // empty = all
  testSize: number
  theme: 'auto' | 'light' | 'dark'
}

export interface State {
  version: 1
  updatedAt: number
  cards: Record<string, CardStat>
  tests: TestResult[]
  sessions: SessionResult[]
  days: Record<string, DayLog>
  settings: Settings
}

const KEY = 'flagquest.v1'

export const defaultSettings: Settings = {
  answerMode: 'choice',
  sound: true,
  neighborLabels: true,
  sessionSize: 20,
  regions: [],
  testSize: 100,
  theme: 'auto',
}

export function emptyState(): State {
  return { version: 1, updatedAt: 0, cards: {}, tests: [], sessions: [], days: {}, settings: { ...defaultSettings } }
}

/** Coerce anything JSON-ish into a well-formed State. Throws if it isn't a backup. */
export function parseState(parsed: unknown): State {
  const p = parsed as Partial<State> | null
  if (!p || typeof p !== 'object' || typeof p.cards !== 'object') throw new Error('Not a Flag Quest progress file')
  return {
    version: 1,
    updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : 0,
    cards: p.cards ?? {},
    tests: Array.isArray(p.tests) ? p.tests : [],
    sessions: Array.isArray(p.sessions) ? p.sessions : [],
    days: p.days ?? {},
    settings: { ...defaultSettings, ...(p.settings ?? {}) },
  }
}

/**
 * Merge two copies of progress without losing anything: per flag keep the most
 * recently answered stats, union tests and sessions, and take the larger daily
 * counts. Settings follow whichever copy was saved last.
 */
export function mergeStates(a: State, b: State): State {
  const [older, newer] = a.updatedAt <= b.updatedAt ? [a, b] : [b, a]
  const cards: Record<string, CardStat> = { ...older.cards }
  for (const [code, stat] of Object.entries(newer.cards)) {
    const cur = cards[code]
    cards[code] = !cur || stat.last >= cur.last ? stat : cur
  }
  const testIds = new Set<string>()
  const tests = [...older.tests, ...newer.tests]
    .filter((t) => (testIds.has(t.id) ? false : (testIds.add(t.id), true)))
    .sort((x, y) => x.date - y.date)
  const sessionKeys = new Set<string>()
  const sessions = [...older.sessions, ...newer.sessions]
    .filter((s) => {
      const k = `${s.date}:${s.total}`
      return sessionKeys.has(k) ? false : (sessionKeys.add(k), true)
    })
    .sort((x, y) => x.date - y.date)
  const days: Record<string, DayLog> = { ...older.days }
  for (const [k, d] of Object.entries(newer.days)) {
    const cur = days[k]
    days[k] = cur ? { answered: Math.max(cur.answered, d.answered), correct: Math.max(cur.correct, d.correct), xp: Math.max(cur.xp, d.xp) } : d
  }
  return { version: 1, updatedAt: Math.max(a.updatedAt, b.updatedAt), cards, tests, sessions, days, settings: newer.settings }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return parseState(JSON.parse(raw))
  } catch {
    /* ignore */
  }
  return emptyState()
}

let state: State = load()
const listeners = new Set<() => void>()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage may be unavailable */
  }
  listeners.forEach((l) => l())
}

function set(updater: (s: State) => State) {
  state = { ...updater(state), updatedAt: Date.now() }
  emit()
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  recordAnswer(code: string, correct: boolean, xp: number) {
    set((s) => {
      const key = dayKey()
      const day = s.days[key] ?? { answered: 0, correct: 0, xp: 0 }
      return {
        ...s,
        cards: { ...s.cards, [code]: applyAnswer(s.cards[code], correct) },
        days: { ...s.days, [key]: { answered: day.answered + 1, correct: day.correct + (correct ? 1 : 0), xp: day.xp + xp } },
      }
    })
  },
  addTest(t: TestResult) {
    set((s) => ({ ...s, tests: [...s.tests, t] }))
  },
  addSession(r: SessionResult) {
    set((s) => ({ ...s, sessions: [...s.sessions, r] }))
  },
  updateSettings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  },
  resetProgress() {
    set((s) => ({ ...s, cards: {}, tests: [], sessions: [], days: {} }))
  },
  exportJSON(): string {
    return JSON.stringify(state, null, 2)
  },
  /** Merge a backup into the current progress (nothing is lost either way). */
  importJSON(json: string) {
    const incoming = parseState(JSON.parse(json))
    set((s) => mergeStates(s, incoming))
  },
  /** Replace state wholesale without bumping updatedAt (used by file sync after a merge). */
  replace(next: State) {
    state = next
    emit()
  },
}

export function useStore(): State {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

/** Consecutive days (ending today or yesterday) with at least one answer. */
export function computeStreak(days: Record<string, DayLog>): number {
  let streak = 0
  const d = new Date()
  // allow today to be empty (streak still alive from yesterday)
  if (!days[dayKey(d.getTime())]) d.setDate(d.getDate() - 1)
  while (days[dayKey(d.getTime())]?.answered) {
    streak += 1
    d.setDate(d.getDate() - 1)
  }
  return streak
}
