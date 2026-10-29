/**
 * Leitner-style spaced repetition.
 * Box 0 = new/forgotten, box 5 = mastered. Each correct answer promotes a card one
 * box and schedules it further out; a miss drops it back to box 0 (due immediately).
 */
export interface CardStat {
  box: number
  due: number // timestamp ms
  seen: number
  correct: number
  wrong: number
  streak: number
  last: number // last answered ts
}

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/** Interval until the card is due again, indexed by the box it just moved INTO. */
export const INTERVALS = [0, 10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY]
export const MAX_BOX = INTERVALS.length - 1

export const emptyStat = (): CardStat => ({ box: 0, due: 0, seen: 0, correct: 0, wrong: 0, streak: 0, last: 0 })

export function applyAnswer(stat: CardStat | undefined, correct: boolean, now = Date.now()): CardStat {
  const s = { ...(stat ?? emptyStat()) }
  s.seen += 1
  s.last = now
  if (correct) {
    s.correct += 1
    s.streak += 1
    s.box = Math.min(MAX_BOX, s.box + 1)
    s.due = now + INTERVALS[s.box]
  } else {
    s.wrong += 1
    s.streak = 0
    s.box = 0
    s.due = now
  }
  return s
}

export type Mastery = 'new' | 'weak' | 'learning' | 'strong' | 'mastered'

export function masteryOf(stat: CardStat | undefined): Mastery {
  if (!stat || stat.seen === 0) return 'new'
  if (stat.box === 0) return 'weak'
  if (stat.box <= 2) return 'learning'
  if (stat.box <= 4) return 'strong'
  return 'mastered'
}

export const MASTERY_LABEL: Record<Mastery, string> = {
  new: 'Not seen',
  weak: 'Needs work',
  learning: 'Learning',
  strong: 'Strong',
  mastered: 'Mastered',
}

/** Higher = more urgent to study. */
export function priority(stat: CardStat | undefined, now = Date.now()): number {
  if (!stat || stat.seen === 0) return 50 // new cards: medium priority
  const overdue = stat.due <= now ? 1 + Math.min(5, (now - stat.due) / DAY) : 0
  const weakness = (MAX_BOX - stat.box) * 10
  const accuracy = stat.seen ? stat.correct / stat.seen : 0
  return overdue * 40 + weakness + (1 - accuracy) * 30
}
