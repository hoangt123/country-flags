import { COUNTRIES } from '../data'
import { computeStreak, store, useStore } from '../lib/store'
import { masteryOf } from '../lib/srs'
import { dayKey } from '../lib/format'
import { TEST_GOAL } from './Test'
import { reconnect, useFileSync } from '../lib/fileSync'

interface Props {
  go: (route: string) => void
}

export default function Home({ go }: Props) {
  const { cards, tests, days, settings } = useStore()
  const fs = useFileSync()
  const now = Date.now()
  const solid = COUNTRIES.filter((c) => ['mastered', 'strong'].includes(masteryOf(cards[c.code]))).length
  const due = COUNTRIES.filter((c) => cards[c.code]?.seen && cards[c.code].due <= now).length
  const unseen = COUNTRIES.filter((c) => !cards[c.code]?.seen).length
  const streak = computeStreak(days)
  const today = days[dayKey()] ?? { answered: 0, correct: 0, xp: 0 }
  const best = tests.reduce((m, t) => Math.max(m, t.correct), 0)
  const pctSolid = Math.round((100 * solid) / COUNTRIES.length)
  const r = 52
  const circ = 2 * Math.PI * r

  return (
    <div className="container page stack">
      <div className="hero">
        <div className="row spread" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1>Flag Quest 🌍</h1>
            <p className="muted" style={{ marginTop: 6 }}>
              {solid === 0
                ? `Learn all ${COUNTRIES.length} flags of the world.`
                : solid >= COUNTRIES.length
                  ? 'You know every flag in the world. Legend.'
                  : `${COUNTRIES.length - solid} flags to go.`}
            </p>
            <div className="row" style={{ marginTop: 14 }}>
              <span className="chip static" style={{ background: 'rgba(255,255,255,0.18)', borderColor: 'transparent', color: '#fff' }}>
                🔥 {streak}-day streak
              </span>
              <span className="chip static" style={{ background: 'rgba(255,255,255,0.18)', borderColor: 'transparent', color: '#fff' }}>
                ⚡ {today.xp} XP today
              </span>
              {best > 0 && (
                <span className="chip static" style={{ background: 'rgba(255,255,255,0.18)', borderColor: 'transparent', color: '#fff' }}>
                  🎯 best test {best}
                </span>
              )}
            </div>
          </div>
          <div className="ring" aria-label={`${pctSolid}% of flags solid`}>
            <svg viewBox="0 0 120 120">
              <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={10} />
              <circle
                cx={60}
                cy={60}
                r={r}
                fill="none"
                stroke="#fff"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - solid / COUNTRIES.length)}
                style={{ transition: 'stroke-dashoffset 0.6s' }}
              />
            </svg>
            <div className="lbl">
              <b>{solid}</b>
              <span>of {COUNTRIES.length}</span>
            </div>
          </div>
        </div>
      </div>

      {fs.linked && fs.permission === 'prompt' && (
        <div className="card row" style={{ borderColor: 'var(--yellow)' }}>
          <span style={{ fontSize: '1.5rem' }}>💾</span>
          <div className="grow">
            <b>Reconnect your progress file</b>
            <p className="muted small">Browsers need a click after each restart before the app can keep saving to {fs.name}.</p>
          </div>
          <button className="btn yellow sm" onClick={() => reconnect().catch(() => undefined)}>
            Reconnect
          </button>
        </div>
      )}

      <div className="stack">
        <button className="card row clickable" style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => go('practice')}>
          <span style={{ fontSize: '2rem' }}>🧠</span>
          <div className="grow">
            <h3>Practice</h3>
            <p className="muted small">
              {due > 0 ? `${due} flags due for review` : unseen > 0 ? `${unseen} new flags to learn` : 'All caught up — keep it sharp'} · flip cards with maps & facts
            </p>
          </div>
          <span className="btn primary sm">Start</span>
        </button>
        <button className="card row" style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => go('test')}>
          <span style={{ fontSize: '2rem' }}>🎯</span>
          <div className="grow">
            <h3>Test</h3>
            <p className="muted small">Go for {TEST_GOAL} correct · {best > 0 ? `your best is ${best}` : 'no attempts yet'}</p>
          </div>
          <span className="btn blue sm">Go</span>
        </button>
        <button className="card row" style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => go('learn')}>
          <span style={{ fontSize: '2rem' }}>📖</span>
          <div className="grow">
            <h3>Learn</h3>
            <p className="muted small">Browse every flag, its neighbours and a memory hook</p>
          </div>
          <span className="btn sm">Browse</span>
        </button>
        <button className="card row" style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => go('progress')}>
          <span style={{ fontSize: '2rem' }}>📈</span>
          <div className="grow">
            <h3>Progress</h3>
            <p className="muted small">Mastery by region, test history, trouble flags</p>
          </div>
          <span className="btn sm">View</span>
        </button>
      </div>

      <div className="card stack">
        <h3>How it works</h3>
        <ul className="muted small" style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
          <li>Each card shows a flag and a map with the country outlined in red and its neighbours named.</li>
          <li>Answer, then the card flips to the capital, population, languages, flag notes and a fun fact.</li>
          <li>Flags you miss come back later in the session, and spaced repetition schedules reviews over days and weeks.</li>
          <li>Multiple-choice options include look-alike flags on purpose, so you learn the differences.</li>
        </ul>
        <div className="row spread">
          <span className="small">Sound effects</span>
          <div className="seg">
            <button className={settings.sound ? 'on' : ''} onClick={() => store.updateSettings({ sound: true })}>
              On
            </button>
            <button className={!settings.sound ? 'on' : ''} onClick={() => store.updateSettings({ sound: false })}>
              Off
            </button>
          </div>
        </div>
        <div className="row spread">
          <span className="small">Theme</span>
          <div className="seg">
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button key={t} className={settings.theme === t ? 'on' : ''} onClick={() => store.updateSettings({ theme: t })}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
