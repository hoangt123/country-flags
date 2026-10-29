import type { TestResult } from '../lib/store'
import { shortDate } from '../lib/format'

interface Props {
  tests: TestResult[]
  goal: number
}

/** Line chart of test scores (correct answers) with a goal line. */
export default function ScoreChart({ tests, goal }: Props) {
  const W = 640
  const H = 220
  const padL = 36
  const padR = 16
  const padT = 16
  const padB = 28
  const data = tests.slice(-30)
  const maxY = Math.max(goal, ...data.map((t) => t.total), 10)
  const x = (i: number) => padL + (data.length <= 1 ? (W - padL - padR) / 2 : (i / (data.length - 1)) * (W - padL - padR))
  const y = (v: number) => padT + (1 - v / maxY) * (H - padT - padB)
  const ticks = [0, Math.round(maxY / 2), maxY]
  const line = data.map((t, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(t.correct)}`).join(' ')
  const area = data.length > 1 ? `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z` : ''

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Test score history">
      {ticks.map((t) => (
        <g key={t}>
          <line className="axis" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} />
          <text x={padL - 6} y={y(t) + 4} textAnchor="end">
            {t}
          </text>
        </g>
      ))}
      <line className="goal" x1={padL} x2={W - padR} y1={y(goal)} y2={y(goal)} />
      <text x={W - padR} y={y(goal) - 6} textAnchor="end" style={{ fill: 'var(--yellow-dark)' }}>
        Goal: {goal}
      </text>
      {area && <path className="area" d={area} />}
      {data.length > 1 && <path className="line" d={line} />}
      {data.map((t, i) => (
        <g key={t.id}>
          <circle className={`dot ${t.correct >= goal ? 'goal-hit' : ''}`} cx={x(i)} cy={y(t.correct)} r={5}>
            <title>
              {shortDate(t.date)}: {t.correct}/{t.total}
            </title>
          </circle>
          {(data.length <= 8 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1) && (
            <text x={x(i)} y={H - 8} textAnchor="middle">
              {shortDate(t.date)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
