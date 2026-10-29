import { useMemo, useState } from 'react'
import { BY_CODE, COUNTRIES, REGION_EMOJI, REGIONS } from '../data'
import { SIMILAR_GROUPS } from '../data/similar'
import QuizRunner, { type QuizOutcome } from '../components/QuizRunner'
import SessionSummary from '../components/SessionSummary'
import { buildPracticeQueue, filterByRegions } from '../lib/quiz'
import { store, useStore } from '../lib/store'
import { masteryOf, priority } from '../lib/srs'
import { shuffle } from '../lib/format'

type Focus = 'smart' | 'new' | 'weak' | 'lookalikes' | 'all'

interface Props {
  seed: string[] | null // specific codes to drill (e.g. misses from a test)
  onClearSeed: () => void
  onHome: () => void
}

export default function Practice({ seed, onClearSeed, onHome }: Props) {
  const { settings, cards } = useStore()
  const [focus, setFocus] = useState<Focus>('smart')
  const [group, setGroup] = useState(SIMILAR_GROUPS[0].id)
  const [queue, setQueue] = useState<string[] | null>(seed)
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null)
  const [runKey, setRunKey] = useState(0)

  const regionPool = useMemo(() => filterByRegions(settings.regions), [settings.regions])
  const now = Date.now()
  const counts = useMemo(() => {
    const due = regionPool.filter((c) => cards[c.code] && cards[c.code].seen > 0 && cards[c.code].due <= now).length
    const fresh = regionPool.filter((c) => !cards[c.code] || cards[c.code].seen === 0).length
    const weak = regionPool.filter((c) => masteryOf(cards[c.code]) === 'weak' || masteryOf(cards[c.code]) === 'learning').length
    return { due, fresh, weak }
  }, [regionPool, cards, now])

  const toggleRegion = (r: string) => {
    const cur = settings.regions
    store.updateSettings({ regions: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r] })
  }

  const start = () => {
    const size = settings.sessionSize
    let picked: string[]
    if (focus === 'lookalikes') {
      const g = SIMILAR_GROUPS.find((g) => g.id === group)!
      picked = shuffle(g.codes.filter((c) => BY_CODE[c]))
    } else if (focus === 'new') {
      picked = shuffle(regionPool.filter((c) => !cards[c.code] || cards[c.code].seen === 0)).slice(0, size).map((c) => c.code)
    } else if (focus === 'weak') {
      picked = regionPool
        .filter((c) => cards[c.code]?.seen)
        .sort((a, b) => priority(cards[b.code]) - priority(cards[a.code]))
        .slice(0, size)
        .map((c) => c.code)
    } else if (focus === 'all') {
      picked = shuffle(regionPool).slice(0, size).map((c) => c.code)
    } else {
      picked = buildPracticeQueue(regionPool, cards, size).map((c) => c.code)
    }
    if (picked.length === 0) picked = shuffle(regionPool).slice(0, size).map((c) => c.code)
    setOutcome(null)
    setQueue(picked)
    setRunKey((k) => k + 1)
  }

  const finish = (o: QuizOutcome) => {
    store.addSession({ date: Date.now(), total: o.total, correct: o.correct, xp: o.xp, scope: scopeLabel() })
    setOutcome(o)
    setQueue(null)
    onClearSeed()
  }

  const scopeLabel = () => {
    if (seed) return 'Review'
    if (focus === 'lookalikes') return SIMILAR_GROUPS.find((g) => g.id === group)?.title ?? 'Look-alikes'
    return settings.regions.length ? settings.regions.join(', ') : 'All regions'
  }

  if (queue) {
    const q = queue.map((c) => BY_CODE[c]).filter(Boolean)
    return (
      <div className="container">
        <QuizRunner
          key={runKey}
          queue={q}
          pool={focus === 'lookalikes' && !seed ? COUNTRIES : regionPool}
          mode="practice"
          answerMode={settings.answerMode}
          neighborLabels={settings.neighborLabels}
          sound={settings.sound}
          title={seed ? 'Reviewing the flags you missed' : scopeLabel()}
          onExit={() => {
            setQueue(null)
            onClearSeed()
          }}
          onFinish={finish}
        />
      </div>
    )
  }

  if (outcome) {
    return (
      <div className="container">
        <SessionSummary
          outcome={outcome}
          mode="practice"
          sound={settings.sound}
          onAgain={() => setOutcome(null)}
          onPracticeMisses={(codes) => {
            setOutcome(null)
            setQueue(codes)
            setRunKey((k) => k + 1)
          }}
          onHome={onHome}
        />
      </div>
    )
  }

  const focusOptions: { id: Focus; label: string; desc: string }[] = [
    { id: 'smart', label: '🧠 Smart review', desc: `${counts.due} due · ${counts.fresh} new — spaced repetition picks what you need most` },
    { id: 'new', label: '✨ New flags', desc: `${counts.fresh} flags you haven't seen yet` },
    { id: 'weak', label: '🎯 Trouble flags', desc: `${counts.weak} flags you keep missing` },
    { id: 'lookalikes', label: '👯 Look-alikes', desc: 'Drill a set of easily confused flags' },
    { id: 'all', label: '🎲 Random mix', desc: 'Anything goes' },
  ]

  return (
    <div className="container page stack">
      <div>
        <h1>Practice</h1>
        <p className="muted">Flip cards, spaced repetition, and missed flags come back until you get them.</p>
      </div>

      <div className="card stack">
        <h3>What to study</h3>
        <div className="list">
          {focusOptions.map((o) => (
            <button
              key={o.id}
              className={`list-item clickable ${focus === o.id ? '' : ''}`}
              style={{ borderColor: focus === o.id ? 'var(--blue)' : undefined, background: focus === o.id ? 'var(--blue-soft)' : undefined, textAlign: 'left' }}
              onClick={() => setFocus(o.id)}
            >
              <div className="grow">
                <b>{o.label}</b>
                <div className="muted small">{o.desc}</div>
              </div>
            </button>
          ))}
        </div>
        {focus === 'lookalikes' && (
          <div>
            <label className="small muted">Group</label>
            <select value={group} onChange={(e) => setGroup(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
              {SIMILAR_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.codes.length})
                </option>
              ))}
            </select>
            <p className="muted small" style={{ marginTop: 6 }}>
              {SIMILAR_GROUPS.find((g) => g.id === group)?.hint}
            </p>
          </div>
        )}
      </div>

      {focus !== 'lookalikes' && (
        <div className="card stack">
          <h3>Regions</h3>
          <div className="chips">
            <button className={`chip ${settings.regions.length === 0 ? 'on' : ''}`} onClick={() => store.updateSettings({ regions: [] })}>
              🌐 All
            </button>
            {REGIONS.map((r) => (
              <button key={r} className={`chip ${settings.regions.includes(r) ? 'on' : ''}`} onClick={() => toggleRegion(r)}>
                {REGION_EMOJI[r]} {r} ({COUNTRIES.filter((c) => c.region === r).length})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card stack">
        <h3>Session</h3>
        <div className="row spread">
          <span>Cards per session</span>
          <div className="seg">
            {[10, 20, 40].map((n) => (
              <button key={n} className={settings.sessionSize === n ? 'on' : ''} onClick={() => store.updateSettings({ sessionSize: n })}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="row spread">
          <span>Answer style</span>
          <div className="seg">
            <button className={settings.answerMode === 'choice' ? 'on' : ''} onClick={() => store.updateSettings({ answerMode: 'choice' })}>
              Multiple choice
            </button>
            <button className={settings.answerMode === 'type' ? 'on' : ''} onClick={() => store.updateSettings({ answerMode: 'type' })}>
              Type it
            </button>
          </div>
        </div>
        <div className="row spread">
          <span>Neighbour names on map</span>
          <div className="seg">
            <button className={settings.neighborLabels ? 'on' : ''} onClick={() => store.updateSettings({ neighborLabels: true })}>
              Show
            </button>
            <button className={!settings.neighborLabels ? 'on' : ''} onClick={() => store.updateSettings({ neighborLabels: false })}>
              Hide
            </button>
          </div>
        </div>
      </div>

      <button className="btn primary lg block" onClick={start}>
        Start practice
      </button>
    </div>
  )
}
