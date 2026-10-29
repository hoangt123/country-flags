import { useEffect, useMemo, useState } from 'react'
import { geoAzimuthalEqualArea, geoGraticule, geoOrthographic, geoPath } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import { featureFor, loadAtlas, mainlandCentroid, PLACES, type Atlas } from '../lib/geo'
import type { Country } from '../data/types'

interface Props {
  country: Country
  showNeighborLabels?: boolean
  width?: number
  height?: number
  className?: string
}

const MAX_SCALE = 2600 // zoom cap so microstates still show their neighbourhood

export default function LocatorMap({ country, showNeighborLabels = true, width = 360, height = 260, className }: Props) {
  const [atlas, setAtlas] = useState<Atlas | null>(null)
  useEffect(() => {
    let alive = true
    loadAtlas().then((a) => alive && setAtlas(a))
    return () => {
      alive = false
    }
  }, [])

  const scene = useMemo(() => (atlas ? buildScene(atlas, country, width, height) : null), [atlas, country, width, height])

  if (!scene) {
    return (
      <div className={`map map-loading ${className ?? ''}`} style={{ aspectRatio: `${width}/${height}` }}>
        <span>Loading map…</span>
      </div>
    )
  }

  return (
    <svg
      className={`map ${className ?? ''}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Map showing the location of the country, outlined in red`}
    >
      <defs>
        <clipPath id={`clip-${country.code}`}>
          <rect width={width} height={height} rx={16} />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${country.code})`}>
        <rect width={width} height={height} className="map-ocean" />
        <path d={scene.graticule} className="map-graticule" />
        <path d={scene.land} className="map-land" />
        <path d={scene.neighbors} className="map-neighbor" />
        {scene.target && <path d={scene.target} className="map-target" />}
        {scene.marker && (
          <g className="map-marker" transform={`translate(${scene.marker[0]},${scene.marker[1]})`}>
            <circle r={13} className="map-marker-ring" />
            <circle r={4} className="map-marker-dot" />
          </g>
        )}
        {showNeighborLabels &&
          scene.labels.map((l) => (
            <text key={l.code} x={l.x} y={l.y} className="map-label" textAnchor="middle">
              {l.name}
            </text>
          ))}
        {/* globe inset */}
        <g transform={`translate(${width - 44},${height - 44})`}>
          <circle r={36} className="map-globe-ocean" />
          <path d={scene.globeLand} className="map-globe-land" />
          {scene.globeTarget && <path d={scene.globeTarget} className="map-globe-target" />}
          <circle cx={scene.globeDot[0]} cy={scene.globeDot[1]} r={3.5} className="map-globe-dot" />
          <circle r={36} className="map-globe-rim" />
        </g>
      </g>
    </svg>
  )
}

interface Scene {
  graticule: string
  land: string
  neighbors: string
  target: string | null
  marker: [number, number] | null
  labels: { code: string; name: string; x: number; y: number }[]
  globeLand: string
  globeTarget: string | null
  globeDot: [number, number]
}

function buildScene(atlas: Atlas, country: Country, width: number, height: number): Scene {
  const target = featureFor(atlas, country.geoId)
  const center: [number, number] = target ? mainlandCentroid(atlas, target) : [country.latlng[1], country.latlng[0]]

  const projection = geoAzimuthalEqualArea().rotate([-center[0], -center[1]]).clipAngle(100)
  const pad = 36
  if (target) {
    const main = atlas.mainland.get(target) ?? target
    projection.fitExtent(
      [
        [pad, pad],
        [width - pad, height - pad],
      ],
      main,
    )
    // Zoom out for tiny countries so neighbours are visible.
    if (projection.scale() > MAX_SCALE) projection.scale(MAX_SCALE)
    // Re-centre on the mainland's bounding box.
    const path0 = geoPath(projection)
    const b = path0.bounds(main)
    const cx = (b[0][0] + b[1][0]) / 2
    const cy = (b[0][1] + b[1][1]) / 2
    const t = projection.translate()
    projection.translate([t[0] + width / 2 - cx, t[1] + height / 2 - cy])
  } else {
    projection.scale(MAX_SCALE).translate([width / 2, height / 2])
  }
  projection.clipExtent([
    [0, 0],
    [width, height],
  ])
  const path = geoPath(projection)

  const neighborFeatures: Feature<Geometry>[] = []
  const labels: Scene['labels'] = []
  for (const code of country.neighbors) {
    const place = PLACES[code]
    const f = place ? featureFor(atlas, place.geoId) : undefined
    if (!f) continue
    neighborFeatures.push(f)
    const c = projection(mainlandCentroid(atlas, f))
    if (c && c[0] > 24 && c[0] < width - 24 && c[1] > 14 && c[1] < height - 10) {
      labels.push({ code, name: place.name, x: c[0], y: c[1] })
    }
  }

  const landFeatures = atlas.all.filter((f) => f !== target && !neighborFeatures.includes(f))
  const land = path({ type: 'FeatureCollection', features: landFeatures }) ?? ''
  const neighbors = path({ type: 'FeatureCollection', features: neighborFeatures }) ?? ''
  const targetPath = target ? (path(target) ?? '') : null

  let marker: [number, number] | null = null
  if (!target) {
    marker = projection([country.latlng[1], country.latlng[0]])
  } else {
    // Measure the main island/landmass, not the whole archipelago, so scattered
    // island nations (Kiribati, Maldives…) still get a marker on their main island.
    const main = atlas.mainland.get(target) ?? target
    const b = path.bounds(main)
    const w = b[1][0] - b[0][0]
    const h = b[1][1] - b[0][1]
    if (w < 26 && h < 26) marker = [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2]
  }

  // Globe inset (orthographic, centred on the country).
  const globe = geoOrthographic().rotate([-center[0], -center[1]]).scale(36).translate([0, 0]).clipAngle(90)
  const globePath = geoPath(globe)
  const globeLand = globePath({ type: 'FeatureCollection', features: atlas.all }) ?? ''
  const globeTarget = target ? (globePath(target) ?? '') : null
  const globeDot = globe(center) ?? [0, 0]

  return {
    graticule: path(geoGraticule().step([10, 10])()) ?? '',
    land,
    neighbors,
    target: targetPath,
    marker,
    labels,
    globeLand,
    globeTarget,
    globeDot: [globeDot[0], globeDot[1]],
  }
}
