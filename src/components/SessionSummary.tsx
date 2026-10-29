import { useEffect, useState } from 'react'
import type { QuizOutcome } from './QuizRunner'
import { BY_CODE } from '../data'
import { flagUrl } from '../lib/flags'
import { formatDuration, pct } from '../lib/format'
import { playFanfare } from '../lib/audio'
import Confetti from './Confetti'
import CountryModal from './CountryModal'

interface Props {
  outcome: QuizOutcome
  mode: 'practice' | 'test'
  goal?: number
  sound: boolean
  onAgain: () => void
  onPracticeMisses: (codes: string[]) => void
  onHome: () => void
}

export default function SessionSummary({ outcome, mode, goal, sound, onAgain, onPracticeMisses, onHome }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  const accuracy = pct(outcome.correct, outcome.total)
  const perfect = outcome.correct === outcome.total
  const hitGoal = goal != null && outcome.correct >= goal
  const celebrate = perfect || hitGoal

  useEffect(() => {
    if (celebrate && sound) playFanfare()
  }, [celebrate, sound])

  return (
    <div className="page stack">
      {celebrate && <Confetti />}
      <div className="hero center">
        <div style={{ fontSize: '3rem' }}>{perfect ? '🏆' : hitGoal ? '🎯' : accuracy >= 80 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}</div>
        <h1>
          {mode === 'test'
            ? perfect
              ? 'Perfect score!'
              : hitGoal
                ? 'Goal reached!'
                : 'Test complete'
            : perfect
              ? 'Flawless session!'
              : 'Session complete'}
        </h1>
        <p className="muted" style={{ marginTop: 6 }}>
          {outcome.correct} of {outcome.total} correct on the first try · {formatDuration(outcome.durationMs)}
        </p>
      </div>
      <div className="tiles">
        <div className="tile">
          <div className="val" style={{ color: 'var(--green)' }}>
            {outcome.correct}
          </div>
          <div className="lbl">Correct</div>
        </div>
        <div className="tile">
          <div className="val" style={{ color: accuracy >= 80 ? 'var(--green)' : accuracy >= 50 ? 'var(--yellow-dark)' : 'var(--red)' }}>{accuracy}%</div>
          <div className="lbl">Accuracy</div>
        </div>
        <div className="tile">
          <div className="val" style={{ color: 'var(--yellow-dark)' }}>
            +{outcome.xp}
          </div>
          <div className="lbl">XP earned</div>
        </div>
        <div className="tile">
          <div className="val" style={{ color: 'var(--blue)' }}>
            {formatDuration(outcome.durationMs)}
          </div>
          <div className="lbl">Time</div>
        </div>
      </div>
      {goal != null && !hitGoal && (
        <p className="muted center">
          {goal - outcome.correct} more correct needed to hit your goal of {goal}.
        </p>
      )}
      {outcome.misses.length > 0 && (
        <div className="card stack">
          <div className="row spread">
            <h3>Flags to review ({outcome.misses.length})</h3>
            <button className="btn blue sm" onClick={() => onPracticeMisses(outcome.misses)}>
              Practice these
            </button>
          </div>
          <div className="list">
            {outcome.misses.map((code) => {
              const c = BY_CODE[code]
              return (
                <div key={code} className="list-item clickable" onClick={() => setOpen(code)}>
                  <img src={flagUrl(code)} alt="" />
                  <div className="grow">
                    <b>{c.name}</b>
                    <div className="muted small">{c.subregion}</div>
                  </div>
                  <span className="muted small">Tap for details</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="row">
        <button className="btn primary lg grow" onClick={onAgain}>
          {mode === 'test' ? 'Take another test' : 'Another session'}
        </button>
        <button className="btn lg" onClick={onHome}>
          Home
        </button>
      </div>
      {open && <CountryModal code={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
