import { useMemo, useState } from 'react'
import { COUNTRIES, REGION_EMOJI, REGIONS } from '../data'
import { flagUrl } from '../lib/flags'
import { computeStreak, useStore } from '../lib/store'
import { masteryOf, MASTERY_LABEL, type Mastery } from '../lib/srs'
import { dayKey, formatDuration, pct, shortDate } from '../lib/format'
import DataCard from '../components/DataCard'
import ScoreChart from '../components/ScoreChart'
import CountryModal from '../components/CountryModal'
import { TEST_GOAL } from './Test'

const ORDER: Mastery[] = ['mastered', 'strong', 'learning', 'weak', 'new']
const COLORS: Record<Mastery, string> = {
  mastered: 'var(--green)',
  strong: 'var(--blue)',
  learning: 'var(--yellow)',
  weak: 'var(--red)',
  new: 'var(--border-strong)',
}

export default function Progress() {
  const state = useStore()
  const { cards, tests, days } = state
  const [open, setOpen] = useState<string | null>(null)
  const [gridFilter, setGridFilter] = useState<Mastery | 'all'>('all')

  const mastery = useMemo(() => {
    const counts: Record<Mastery, number> = { new: 0, weak: 0, learning: 0, strong: 0, mastered: 0 }
    for (const c of COUNTRIES) counts[masteryOf(cards[c.code])]++
    return counts
  }, [cards])

  const totals = useMemo(() => {
    let answered = 0
    let correct = 0
    for (const s of Object.values(cards)) {
      answered += s.seen
      correct += s.correct
    }
    return { answered, correct }
  }, [cards])

  const streak = computeStreak(days)
  const best = tests.reduce((m, t) => Math.max(m, t.correct), 0)
  const due = COUNTRIES.filter((c) => cards[c.code]?.seen && cards[c.code].due <= Date.now()).length

  const byRegion = useMemo(
    () =>
      REGIONS.map((r) => {
        const list = COUNTRIES.filter((c) => c.region === r)
        const mastered = list.filter((c) => ['mastered', 'strong'].includes(masteryOf(cards[c.code]))).length
        const seen = list.filter((c) => cards[c.code]?.seen).length
        return { r, total: list.length, mastered, seen }
      }),
    [cards],
  )

  const trouble = useMemo(
    () =>
      COUNTRIES.filter((c) => cards[c.code]?.wrong)
        .map((c) => ({ c, s: cards[c.code] }))
        .sort((a, b) => b.s.wrong - a.s.wrong || a.s.correct / a.s.seen - b.s.correct / b.s.seen)
        .slice(0, 12),
    [cards],
  )

  // 12-week activity heatmap (oldest → newest)
  const heat = useMemo(() => {
    const cells: { key: string; n: number }[] = []
    const d = new Date()
    d.setDate(d.getDate() - 83)
    for (let i = 0; i < 84; i++) {
      const k = dayKey(d.getTime())
      cells.push({ key: k, n: days[k]?.answered ?? 0 })
      d.setDate(d.getDate() + 1)
    }
    return cells
  }, [days])

  const gridList = COUNTRIES.filter((c) => gridFilter === 'all' || masteryOf(cards[c.code]) === gridFilter)

  return (
    <div className="container page stack">
      <div>
        <h1>Progress</h1>
        <p className="muted">
          {mastery.mastered + mastery.strong} of {COUNTRIES.length} flags are solid. {due > 0 ? `${due} due for review.` : 'Nothing due right now.'}
        </p>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="val" style={{ color: 'var(--green)' }}>
            {mastery.mastered}
          </div>
          <div className="lbl">Mastered</div>
        </div>
        <div className="tile">
          <div className="val" style={{ color: 'var(--orange)' }}>
            🔥 {streak}
          </div>
          <div className="lbl">Day streak</div>
        </div>
        <div className="tile">
          <div className="val" style={{ color: 'var(--yellow-dark)' }}>
            {best}
          </div>
          <div className="lbl">Best test</div>
        </div>
        <div className="tile">
          <div className="val" style={{ color: 'var(--blue)' }}>
            {pct(totals.correct, totals.answered)}%
          </div>
          <div className="lbl">Accuracy ({totals.answered})</div>
        </div>
      </div>

      <div className="card stack">
        <h3>Mastery</h3>
        <div className="bar">
          {ORDER.map((m) => (
            <span key={m} style={{ width: `${(100 * mastery[m]) / COUNTRIES.length}%`, background: COLORS[m] }} title={`${MASTERY_LABEL[m]}: ${mastery[m]}`} />
          ))}
        </div>
        <div className="legend">
          {ORDER.map((m) => (
            <span key={m}>
              <i style={{ background: COLORS[m] }} />
              {MASTERY_LABEL[m]} {mastery[m]}
            </span>
          ))}
        </div>
        <p className="muted small">
          Mastered = answered correctly 5 times in a row across spaced intervals (10 min → 1 day → 3 days → 1 week → 3 weeks).
        </p>
      </div>

      <div className="card stack">
        <div className="row spread">
          <h3>Test history</h3>
          <span className="muted small">{tests.length} tests</span>
        </div>
        {tests.length === 0 ? (
          <p className="muted">No tests yet. Take one to start tracking your score toward {TEST_GOAL}.</p>
        ) : (
          <>
            <ScoreChart tests={tests} goal={TEST_GOAL} />
            <div className="list">
              {tests
                .slice(-8)
                .reverse()
                .map((t) => (
                  <div key={t.id} className="list-item">
                    <div className="grow">
                      <b>
                        {t.correct}/{t.total}
                      </b>{' '}
                      <span className="muted small">
                        ({pct(t.correct, t.total)}%) · {t.scope} · {t.mode === 'type' ? 'typed' : 'multiple choice'}
                      </span>
                      <div className="muted small">
                        {shortDate(t.date)} · {formatDuration(t.durationMs)}
                        {t.correct >= TEST_GOAL ? ' · 🎯 goal hit' : ''}
                      </div>
                    </div>
                    {t.misses.length > 0 && <span className="muted small">{t.misses.length} missed</span>}
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <div className="card stack">
        <h3>By region</h3>
        {byRegion.map((x) => (
          <div key={x.r} className="bar-row">
            <span>
              {REGION_EMOJI[x.r]} {x.r}
            </span>
            <div className="bar">
              <span style={{ width: `${(100 * x.mastered) / x.total}%`, background: 'var(--green)' }} />
              <span style={{ width: `${(100 * (x.seen - x.mastered)) / x.total}%`, background: 'var(--yellow)' }} />
            </div>
            <span className="muted small" style={{ textAlign: 'right' }}>
              {x.mastered}/{x.total}
            </span>
          </div>
        ))}
      </div>

      <div className="card stack">
        <h3>Activity (last 12 weeks)</h3>
        <div className="heat" aria-label="Daily activity">
          {heat.map((c) => (
            <i key={c.key} className={c.n === 0 ? '' : c.n < 10 ? 'l1' : c.n < 25 ? 'l2' : c.n < 60 ? 'l3' : 'l4'} title={`${c.key}: ${c.n} answers`} />
          ))}
        </div>
      </div>

      {trouble.length > 0 && (
        <div className="card stack">
          <h3>Trouble flags</h3>
          <div className="list">
            {trouble.map(({ c, s }) => (
              <div key={c.code} className="list-item clickable" onClick={() => setOpen(c.code)}>
                <img src={flagUrl(c.code)} alt="" />
                <div className="grow">
                  <b>{c.name}</b>
                  <div className="muted small">{c.subregion}</div>
                </div>
                <span className={`pill ${masteryOf(s)}`}>{MASTERY_LABEL[masteryOf(s)]}</span>
                <span className="muted small">
                  {s.wrong} miss{s.wrong === 1 ? '' : 'es'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card stack">
        <div className="row spread">
          <h3>All flags</h3>
          <div className="chips">
            <button className={`chip ${gridFilter === 'all' ? 'on' : ''}`} onClick={() => setGridFilter('all')}>
              All
            </button>
            {ORDER.map((m) => (
              <button key={m} className={`chip ${gridFilter === m ? 'on' : ''}`} onClick={() => setGridFilter(m)}>
                <i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: COLORS[m] }} /> {MASTERY_LABEL[m]}
              </button>
            ))}
          </div>
        </div>
        <div className="flag-grid">
          {gridList.map((c) => (
            <button key={c.code} className={`flag-tile m-${masteryOf(cards[c.code])}`} onClick={() => setOpen(c.code)} title={c.name}>
              <div className="fw">
                <img src={flagUrl(c.code)} alt={c.name} loading="lazy" />
              </div>
              <div className="nm">{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      <DataCard />

      {open && <CountryModal code={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
