import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from 'geojson'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import { geoArea, geoCentroid } from 'd3-geo'
import places from '../data/places.json'
import type { Place } from '../data/types'

export const PLACES = places as unknown as Record<string, Place>

export interface Atlas {
  all: Feature<Geometry>[]
  byId: Map<string, Feature<Geometry>>
  byName: Map<string, Feature<Geometry>>
  /** Largest polygon of each country (mainland) used for centring and labelling. */
  mainland: Map<Feature<Geometry>, Feature<Polygon>>
}

let atlasPromise: Promise<Atlas> | null = null

export function loadAtlas(): Promise<Atlas> {
  if (!atlasPromise) {
    atlasPromise = import('world-atlas/countries-50m.json').then((mod) => {
      const topo = (mod.default ?? mod) as unknown as Topology<{ countries: GeometryCollection }>
      const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry>
      const byId = new Map<string, Feature<Geometry>>()
      const byName = new Map<string, Feature<Geometry>>()
      const mainland = new Map<Feature<Geometry>, Feature<Polygon>>()
      for (const f of fc.features) {
        if (f.id != null) byId.set(String(f.id), f)
        const name = (f.properties as { name?: string } | null)?.name
        if (name) byName.set(name, f)
        mainland.set(f, largestPolygon(f))
      }
      return { all: fc.features, byId, byName, mainland }
    })
  }
  return atlasPromise
}

function largestPolygon(f: Feature<Geometry>): Feature<Polygon> {
  const g = f.geometry
  if (g.type === 'Polygon') return { type: 'Feature', properties: {}, geometry: g }
  const mp = g as MultiPolygon
  let best: Polygon | null = null
  let bestArea = -1
  for (const coords of mp.coordinates) {
    const p: Polygon = { type: 'Polygon', coordinates: coords }
    const a = geoArea(p)
    if (a > bestArea) {
      bestArea = a
      best = p
    }
  }
  return { type: 'Feature', properties: {}, geometry: best ?? { type: 'Polygon', coordinates: [] } }
}

export function featureFor(atlas: Atlas, geoId: string | null): Feature<Geometry> | undefined {
  if (!geoId) return undefined
  if (geoId.startsWith('name:')) return atlas.byName.get(geoId.slice(5))
  return atlas.byId.get(geoId)
}

export function mainlandCentroid(atlas: Atlas, f: Feature<Geometry>): [number, number] {
  const m = atlas.mainland.get(f)
  return geoCentroid(m ?? f)
}
