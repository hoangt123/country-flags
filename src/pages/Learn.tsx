import { useMemo, useState } from 'react'
import { COUNTRIES, REGION_EMOJI, REGIONS } from '../data'
import { SIMILAR_GROUPS } from '../data/similar'
import { flagUrl } from '../lib/flags'
import { useStore } from '../lib/store'
import { masteryOf } from '../lib/srs'
import { normalizeName } from '../lib/quiz'
import CountryModal from '../components/CountryModal'

/** Browse every flag with its details — the no-pressure study mode. */
export default function Learn() {
  const { cards } = useStore()
  const [q, setQ] = useState('')
  const [region, setRegion] = useState<string>('')
  const [group, setGroup] = useState<string>('')
  const [open, setOpen] = useState<string | null>(null)

  const list = useMemo(() => {
    const t = normalizeName(q)
    let l = COUNTRIES
    if (group) {
      const g = SIMILAR_GROUPS.find((x) => x.id === group)
      l = l.filter((c) => g?.codes.includes(c.code))
    }
    if (region) l = l.filter((c) => c.region === region)
    if (t) l = l.filter((c) => [c.name, ...c.aliases, ...c.capital].some((n) => normalizeName(n).includes(t)))
    return l
  }, [q, region, group])

  return (
    <div className="container page stack">
      <div>
        <h1>Learn</h1>
        <p className="muted">Browse all {COUNTRIES.length} flags. Tap one to see its map, facts and flag notes.</p>
      </div>
      <input
        type="search"
        placeholder="Search country or capital…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', fontSize: '1rem', padding: '12px 14px', borderRadius: 14 }}
      />
      <div className="chips">
        <button className={`chip ${region === '' ? 'on' : ''}`} onClick={() => setRegion('')}>
          🌐 All
        </button>
        {REGIONS.map((r) => (
          <button key={r} className={`chip ${region === r ? 'on' : ''}`} onClick={() => setRegion(region === r ? '' : r)}>
            {REGION_EMOJI[r]} {r}
          </button>
        ))}
      </div>
      <div className="row">
        <label className="small muted">Look-alike set:</label>
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">— none —</option>
          {SIMILAR_GROUPS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>
      {group && <p className="muted small">{SIMILAR_GROUPS.find((g) => g.id === group)?.hint}</p>}
      <div className="flag-grid">
        {list.map((c) => (
          <button key={c.code} className={`flag-tile m-${masteryOf(cards[c.code])}`} onClick={() => setOpen(c.code)} title={c.name}>
            <div className="fw">
              <img src={flagUrl(c.code)} alt={c.name} loading="lazy" />
            </div>
            <div className="nm">{c.name}</div>
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="muted center">No matches.</p>}
      {open && <CountryModal code={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
