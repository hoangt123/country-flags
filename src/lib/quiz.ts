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
 * Build a practice session: due & weak cards first, then new cards, then the rest,
 * with a little randomness so sessions don't feel identical.
 */
export function buildPracticeQueue(pool: Country[], cards: Record<string, CardStat>, size: number): Country[] {
  const now = Date.now()
  const scored = pool.map((c) => ({ c, p: priority(cards[c.code], now) + Math.random() * 8 }))
  scored.sort((a, b) => b.p - a.p)
  const chosen = scored.slice(0, size).map((s) => s.c)
  return shuffle(chosen)
}

export function buildTestQueue(pool: Country[], size: number): Country[] {
  return shuffle(pool).slice(0, Math.min(size, pool.length))
}

export function xpFor(correct: boolean, firstTry: boolean): number {
  if (!correct) return 0
  return firstTry ? 10 : 5
}
