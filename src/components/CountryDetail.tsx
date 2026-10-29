import type { Country } from '../data'
import { BY_CODE } from '../data'
import { flagUrl } from '../lib/flags'
import { formatArea, formatPopulation } from '../lib/format'
import { PLACES } from '../lib/geo'
import LocatorMap from './LocatorMap'

interface Props {
  country: Country
  showMap?: boolean
  neighborLabels?: boolean
  onPick?: (code: string) => void
  children?: React.ReactNode
}

/** The "back of the card": everything worth knowing about a country. */
export default function CountryDetail({ country: c, showMap = true, neighborLabels = true, onPick, children }: Props) {
  return (
    <div>
      <div className="back-head">
        <div className="flag-wrap sm">
          <img src={flagUrl(c.code)} alt={`Flag of ${c.name}`} />
        </div>
        <div className="grow">
          <h2>
            {c.name} <span aria-hidden>{c.emoji}</span>
          </h2>
          <p className="muted small">{c.official}</p>
          <p className="muted small">
            {c.subregion} · {c.region}
            {c.landlocked ? ' · landlocked' : ''}
          </p>
        </div>
      </div>
      {children}
      <div className="facts">
        <div className="fact">
          <label>Capital</label>
          <div>{c.capital.join(', ') || '—'}</div>
        </div>
        <div className="fact">
          <label>Population</label>
          <div>
            {formatPopulation(c.population)}
            {c.populationYear && <span className="muted small"> ({c.populationYear})</span>}
          </div>
        </div>
        <div className="fact">
          <label>Languages</label>
          <div>{c.languages.slice(0, 4).join(', ') || '—'}{c.languages.length > 4 ? ` +${c.languages.length - 4}` : ''}</div>
        </div>
        <div className="fact">
          <label>Area</label>
          <div>{formatArea(c.area)}</div>
        </div>
        <div className="fact">
          <label>Currency</label>
          <div>{c.currencies.join(', ') || '—'}</div>
        </div>
        <div className="fact">
          <label>People</label>
          <div>{c.demonym || '—'}</div>
        </div>
      </div>
      {c.neighbors.length > 0 && (
        <div className="fact" style={{ marginTop: 12 }}>
          <label>Borders</label>
          <div className="chips" style={{ marginTop: 6 }}>
            {c.neighbors.map((n) => {
              const inDeck = BY_CODE[n]
              const name = PLACES[n]?.name ?? n
              return (
                <button
                  key={n}
                  type="button"
                  className={`chip ${inDeck && onPick ? '' : 'static'}`}
                  onClick={() => inDeck && onPick?.(n)}
                  disabled={!inDeck || !onPick}
                >
                  <img src={flagUrl(n)} alt="" width={20} height={15} style={{ borderRadius: 2 }} />
                  {name}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {c.neighbors.length === 0 && (
        <p className="muted small" style={{ marginTop: 12 }}>
          No land borders — an island nation.
        </p>
      )}
      {c.flagNotes && (
        <div className="note flag">
          <span className="ico" aria-hidden>
            🚩
          </span>
          <div>
            <b>The flag:</b> {c.flagNotes}
          </div>
        </div>
      )}
      {c.funFact && (
        <div className="note fun">
          <span className="ico" aria-hidden>
            💡
          </span>
          <div>{c.funFact}</div>
        </div>
      )}
      {showMap && (
        <div className="back-map">
          <LocatorMap country={c} showNeighborLabels={neighborLabels} />
        </div>
      )}
    </div>
  )
}
