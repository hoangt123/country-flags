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

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>
      return {
        version: 1,
        cards: parsed.cards ?? {},
        tests: parsed.tests ?? [],
        sessions: parsed.sessions ?? [],
        days: parsed.days ?? {},
        settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      }
    }
  } catch {
    /* ignore */
  }
  return { version: 1, cards: {}, tests: [], sessions: [], days: {}, settings: { ...defaultSettings } }
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
  state = updater(state)
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
  importJSON(json: string) {
    const parsed = JSON.parse(json) as Partial<State>
    if (!parsed || typeof parsed !== 'object' || !parsed.cards) throw new Error('Not a Flag Quest backup file')
    set(() => ({
      version: 1,
      cards: parsed.cards ?? {},
      tests: parsed.tests ?? [],
      sessions: parsed.sessions ?? [],
      days: parsed.days ?? {},
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    }))
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
