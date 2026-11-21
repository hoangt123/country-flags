import { useEffect, useMemo, useState } from 'react'
import { BY_CODE, COUNTRIES, REGION_EMOJI, REGIONS } from '../data'
import { FAST100 } from '../data/fast100'
import QuizRunner, { type QuizOutcome } from '../components/QuizRunner'
import SessionSummary from '../components/SessionSummary'
import { buildTestQueue, filterByRegions } from '../lib/quiz'
import { store, useStore } from '../lib/store'
import { uid } from '../lib/format'
import type { Country } from '../data'

interface Props {
  preset: 'fast100' | null
  onClearPreset: () => void
  onPracticeMisses: (codes: string[]) => void
  onHome: () => void
}

export const TEST_GOAL = 100

export default function Test({ preset, onClearPreset, onPracticeMisses, onHome }: Props) {
  const { settings, tests } = useStore()
  const [regions, setRegions] = useState<string[]>([])
  const [fast, setFast] = useState(preset === 'fast100')
  const [queue, setQueue] = useState<Country[] | null>(null)
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null)
  const [runKey, setRunKey] = useState(0)

  const pool = useMemo(() => (fast ? FAST100.map((c) => BY_CODE[c]).filter(Boolean) : filterByRegions(regions)), [regions, fast])
  const sizes = [...new Set([25, 50, 100, pool.length])].filter((n) => n <= pool.length)
  const size = Math.min(settings.testSize, pool.length)
  const best = tests.reduce((m, t) => Math.max(m, t.correct), 0)

  const start = () => {
    setOutcome(null)
    setQueue(buildTestQueue(pool, size))
    setRunKey((k) => k + 1)
  }

  // Arriving from "Test me on all 100": start the full Fast 100 test straight away.
  useEffect(() => {
    if (preset !== 'fast100') return
    onClearPreset()
    setOutcome(null)
    setQueue(buildTestQueue(FAST100.map((c) => BY_CODE[c]).filter(Boolean), FAST100.length))
    setRunKey((k) => k + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  const finish = (o: QuizOutcome) => {
    store.addTest({
      id: uid(),
      date: Date.now(),
      total: o.total,
      correct: o.correct,
      durationMs: o.durationMs,
      misses: o.misses,
      mode: settings.answerMode,
      scope: fast ? 'Fast 100' : regions.length ? regions.join(', ') : 'All regions',
    })
    setOutcome(o)
    setQueue(null)
  }

  if (queue) {
    return (
      <div className="container">
        <QuizRunner
          key={runKey}
          queue={queue}
          pool={pool}
          mode="test"
          answerMode={settings.answerMode}
          neighborLabels={settings.neighborLabels}
          sound={settings.sound}
          onExit={() => setQueue(null)}
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
          mode="test"
          goal={outcome.total >= TEST_GOAL ? TEST_GOAL : undefined}
          sound={settings.sound}
          onAgain={() => setOutcome(null)}
          onPracticeMisses={onPracticeMisses}
          onHome={onHome}
        />
      </div>
    )
  }

  return (
    <div className="container page stack">
      <div>
        <h1>Test</h1>
        <p className="muted">
          No hints, no retries. Your goal: <b>{TEST_GOAL} correct</b> in one sitting.
          {best > 0 && (
            <>
              {' '}
              Personal best: <b>{best}</b>.
            </>
          )}
        </p>
      </div>

      <div className="card stack">
        <h3>Length</h3>
        <div className="seg">
          {sizes.map((n, i) => (
            <button key={n} className={size === n ? 'on' : ''} onClick={() => store.updateSettings({ testSize: n })}>
              {i === sizes.length - 1 && n === pool.length ? `All ${n}` : n}
            </button>
          ))}
        </div>
        {size < TEST_GOAL && (
          <p className="muted small">Pick 100 or more questions to go for the goal of {TEST_GOAL} correct.</p>
        )}
      </div>

      <div className="card stack">
        <h3>Which flags</h3>
        <div className="chips">
          <button
            className={`chip ${fast ? 'on' : ''}`}
            onClick={() => {
              setFast(true)
              store.updateSettings({ testSize: 100 })
            }}
          >
            🚀 Fast 100
          </button>
          <button className={`chip ${!fast && regions.length === 0 ? 'on' : ''}`} onClick={() => { setFast(false); setRegions([]) }}>
            🌐 All ({COUNTRIES.length})
          </button>
          {REGIONS.map((r) => (
            <button
              key={r}
              className={`chip ${!fast && regions.includes(r) ? 'on' : ''}`}
              onClick={() => {
                setFast(false)
                setRegions((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]))
              }}
            >
              {REGION_EMOJI[r]} {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card stack">
        <h3>Map hint</h3>
        <div className="seg">
          <button className={settings.showMap ? 'on' : ''} onClick={() => store.updateSettings({ showMap: true })}>
            Show map
          </button>
          <button className={!settings.showMap ? 'on' : ''} onClick={() => store.updateSettings({ showMap: false })}>
            Hide map (flag only)
          </button>
        </div>
      </div>

      <div className="card stack">
        <h3>Answer style</h3>
        <div className="seg">
          <button className={settings.answerMode === 'choice' ? 'on' : ''} onClick={() => store.updateSettings({ answerMode: 'choice' })}>
            Multiple choice
          </button>
          <button className={settings.answerMode === 'type' ? 'on' : ''} onClick={() => store.updateSettings({ answerMode: 'type' })}>
            Type it (harder)
          </button>
        </div>
      </div>

      <button className="btn primary lg block" onClick={start}>
        Start {size}-flag test
      </button>
    </div>
  )
}
