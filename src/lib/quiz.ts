import { BY_CODE, COUNTRIES, type Country } from '../data'
import { lookalikes } from '../data/similar'
import { priority, type CardStat } from './srs'
import { shuffle } from './format'

/** Lowercase, strip accents/punctuation and a leading "the" so typed answers are forgiving. */
export function normalizeName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^the /, '')
    .replace(/^(st|saint) /, 'saint ')
    .replace(/ and /g, ' & ')
}

export function isCorrectName(c: Country, typed: string): boolean {
  const t = normalizeName(typed)
  if (!t) return false
  if (normalizeName(c.name) === t) return true
  return c.aliases.some((a) => normalizeName(a) === t)
}

/** Search countries by prefix / substring for the type-ahead input. */
export function searchCountries(q: string, limit = 6): Country[] {
  const t = normalizeName(q)
  if (!t) return []
  const starts: Country[] = []
  const contains: Country[] = []
  for (const c of COUNTRIES) {
    const names = [c.name, ...c.aliases].map(normalizeName)
    if (names.some((n) => n.startsWith(t))) starts.push(c)
    else if (names.some((n) => n.includes(t))) contains.push(c)
  }
  return [...starts, ...contains].slice(0, limit)
}

/** Pick 3 distractors: look-alike flags first, then same subregion, region, then anything. */
export function makeChoices(answer: Country, pool: Country[] = COUNTRIES, n = 4): Country[] {
  const picked = new Set<string>([answer.code])
  const out: Country[] = []
  const take = (cands: Country[], max: number) => {
    for (const c of shuffle(cands)) {
      if (out.length >= max) break
      if (!picked.has(c.code)) {
        picked.add(c.code)
        out.push(c)
      }
    }
  }
  const similar = lookalikes(answer.code).map((code) => BY_CODE[code]).filter(Boolean)
  // Usually 1–2 look-alikes so the choices aren't always the same cluster.
  take(similar, Math.min(2, 1 + Math.floor(Math.random() * 2)))
  take(pool.filter((c) => c.subregion === answer.subregion), n - 1)
  take(pool.filter((c) => c.region === answer.region), n - 1)
  take(COUNTRIES, n - 1)
  return shuffle([answer, ...out])
}

export function filterByRegions(regions: string[]): Country[] {
  if (!regions.length) return COUNTRIES
  return COUNTRIES.filter((c) => regions.includes(c.region))
}

/**
 * How often a flag should come up relative to others. Flags you keep missing are
 * weighted ~10× a mastered flag; new flags sit in the middle; anything that is
 * due for its spaced-repetition review is tripled.
 */
export const BOX_WEIGHT = [10, 8, 6, 3, 2, 1]

export function studyWeight(stat: CardStat | undefined, now = Date.now()): number {
  if (!stat || stat.seen === 0) return 4
  const base = BOX_WEIGHT[Math.min(stat.box, BOX_WEIGHT.length - 1)]
  return stat.due <= now ? base * 3 : base
}

/** Weighted random sample without replacement. */
export function weightedSample<T>(items: T[], weight: (t: T) => number, n: number): T[] {
  const pool = items.map((item) => ({ item, w: Math.max(0, weight(item)) })).filter((x) => x.w > 0)
  const out: T[] = []
  while (out.length < n && pool.length) {
    let total = 0
    for (const x of pool) total += x.w
    let r = Math.random() * total
    let i = 0
    for (; i < pool.length - 1; i++) {
      r -= pool[i].w
      if (r <= 0) break
    }
    out.push(pool[i].item)
    pool.splice(i, 1)
  }
  return out
}

/**
 * Build a practice session the way Duolingo/Anki would:
 *  1. everything that is due for review goes in first (weakest first),
 *  2. the remaining slots are filled by weighted lottery, so weak and new flags
 *     show up far more often than ones you already know.
 */
export function buildPracticeQueue(pool: Country[], cards: Record<string, CardStat>, size: number): Country[] {
  const now = Date.now()
  const due = pool
    .filter((c) => cards[c.code]?.seen && cards[c.code].due <= now)
    .sort((a, b) => priority(cards[b.code], now) - priority(cards[a.code], now))
    .slice(0, size)
  const taken = new Set(due.map((c) => c.code))
  const rest = pool.filter((c) => !taken.has(c.code))
  const filler = weightedSample(rest, (c) => studyWeight(cards[c.code], now), size - due.length)
  return shuffle([...due, ...filler])
}

export function buildTestQueue(pool: Country[], size: number): Country[] {
  return shuffle(pool).slice(0, Math.min(size, pool.length))
}

export function xpFor(correct: boolean, firstTry: boolean): number {
  if (!correct) return 0
  return firstTry ? 10 : 5
}
