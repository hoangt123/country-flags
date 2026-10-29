export type Region = 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania'

export interface Country {
  code: string // ISO 3166-1 alpha-2
  code3: string
  name: string
  official: string
  aliases: string[]
  capital: string[]
  region: Region
  subregion: string
  population: number | null
  populationYear: string | null
  area: number | null // km²
  languages: string[]
  currencies: string[]
  neighbors: string[] // alpha-2 codes (land borders)
  latlng: [number, number]
  landlocked: boolean
  demonym: string
  emoji: string
  geoId: string | null // numeric ISO id in world-atlas, or "name:<Name>", or null when no shape
  /** Short description of the flag's design and a memory hook. */
  flagNotes: string
  /** A fun fact about the country. */
  funFact: string
}

export interface Place {
  name: string
  geoId: string | null
  latlng: [number, number]
}
