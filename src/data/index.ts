import raw from './countries.json'
import { FACTS } from './facts'
import type { Country, Region } from './types'

export const COUNTRIES: Country[] = (raw as unknown as Omit<Country, 'flagNotes' | 'funFact'>[]).map((c) => ({
  ...c,
  flagNotes: FACTS[c.code]?.[0] ?? '',
  funFact: FACTS[c.code]?.[1] ?? '',
}))

export const BY_CODE: Record<string, Country> = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]))

export const REGIONS: Region[] = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']

export const REGION_EMOJI: Record<Region, string> = {
  Africa: '🌍',
  Americas: '🌎',
  Asia: '🌏',
  Europe: '🏰',
  Oceania: '🏝️',
}

export type { Country, Region }
