import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Country } from '../data'
import { flagUrl } from '../lib/flags'
import { isCorrectName, makeChoices, xpFor } from '../lib/quiz'
import { playCorrect, playWrong } from '../lib/audio'
import { store, useStore, type AnswerMode } from '../lib/store'
import { masteryOf, MASTERY_LABEL } from '../lib/srs'
import CountryDetail from './CountryDetail'
import LocatorMap from './LocatorMap'
import TypeAnswer from './TypeAnswer'

export interface QuizAnswer {
  code: string
  correct: boolean
  firstTry: boolean
}

export interface QuizOutcome {
  answers: QuizAnswer[]
  total: number
  correct: number
  xp: number
  durationMs: number
  misses: string[]
}

interface Props {
  queue: Country[]
  pool: Country[]
  mode: 'practice' | 'test'
  answerMode: AnswerMode
  neighborLabels: boolean
  sound: boolean
  title?: string
  onExit: () => void
  onFinish: (o: QuizOutcome) => void
}

interface Item {
  country: Country
  retry: boolean
}

export default function QuizRunner({ queue, pool, mode, answerMode, neighborLabels, sound, title, onExit, onFinish }: Props) {
  const [items, setItems] = useState<Item[]>(() => queue.map((country) => ({ country, retry: false })))
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'ask' | 'answered'>('ask')
  const [flipped, setFlipped] = useState(false)
  const [chosen, setChosen] = useState<string | null>(null) // code chosen (choice mode) or typed text
  const [lastCorrect, setLastCorrect] = useState(false)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const startRef = useRef(Date.now())
  const doneRef = useRef(false)

  const { cards } = useStore()
  const item = items[idx]
  const country = item?.country
  const mastery = country ? masteryOf(cards[country.code]) : 'new'
  const uniqueTotal = queue.length
  const solved = useMemo(() => new Set(answers.filter((a) => a.correct).map((a) => a.code)).size, [answers])
  const progress = mode === 'practice' ? solved / uniqueTotal : idx / uniqueTotal

  const choices = useMemo(() => (country && answerMode === 'choice' ? makeChoices(country, pool) : []), [country, pool, answerMode])

  const correctCount = answers.filter((a) => a.correct && a.firstTry).length

  const answer = useCallback(
    (correct: boolean, chosenValue: string) => {
      if (!country || phase !== 'ask') return
      const firstTry = !item.retry
      const gained = xpFor(correct, firstTry)
      setChosen(chosenValue)
      setLastCorrect(correct)
      setPhase('answered')
      setXp((v) => v + gained)
      setStreak((s) => (correct ? s + 1 : 0))
      setAnswers((a) => [...a, { code: country.code, correct, firstTry }])
      if (firstTry) store.recordAnswer(country.code, correct, gained)
      if (sound) (correct ? playCorrect : playWrong)()
      if (mode === 'practice') setFlipped(true)
      if (mode === 'practice' && !correct) {
        // Duolingo-style: missed cards come back later in the same session.
        setItems((list) => [...list, { country, retry: true }])
      }
    },
    [country, item, phase, mode, sound],
  )

  const next = useCallback(() => {
    if (phase !== 'answered') return
    const last = idx + 1 >= items.length
    if (last) {
      if (doneRef.current) return
      doneRef.current = true
      const firstTries = answers.filter((a) => a.firstTry)
      onFinish({
        answers,
        total: uniqueTotal,
        correct: firstTries.filter((a) => a.correct).length,
        xp,
        durationMs: Date.now() - startRef.current,
        misses: [...new Set(firstTries.filter((a) => !a.correct).map((a) => a.code))],
      })
      return
    }
    setFlipped(false)
    setChosen(null)
    setPhase('ask')
    // let the flip-back animation start before swapping content
    setTimeout(() => setIdx((i) => i + 1), flipped ? 160 : 0)
  }, [phase, idx, items.length, answers, uniqueTotal, xp, onFinish, flipped])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (phase === 'ask' && answerMode === 'choice' && /^[1-4]$/.test(e.key)) {
        const c = choices[Number(e.key) - 1]
        if (c) answer(c.code === country?.code, c.code)
      } else if (phase === 'answered' && (e.key === 'Enter' || e.key === ' ')) {
        if (tag === 'BUTTON' && e.key === ' ') return
        e.preventDefault()
        next()
      } else if (e.key === 'Escape' && tag !== 'INPUT') {
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, answerMode, choices, country, answer, next, onExit])

  if (!country) return null

  const resultLine = (
    <div className={`result-line ${lastCorrect ? 'ok' : 'bad'}`} style={{ marginTop: 10 }}>
      {lastCorrect ? (
        <>
          ✅ Correct! +{xpFor(true, !item.retry)} XP{streak >= 3 ? ` · 🔥 ${streak} in a row` : ''}
        </>
      ) : (
        <>❌ {answerMode === 'choice' ? 'Not quite' : `You wrote “${chosen}”`}</>
      )}
    </div>
  )

  return (
    <div className="page">
      <div className="quiz-top">
        <button className="close" onClick={onExit} aria-label="Quit">
          ✕
        </button>
        <div className="progress" aria-label="Progress">
          <div style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <span className="score-badge">
          {mode === 'test' ? `${correctCount} ✓ · ${idx + 1}/${uniqueTotal}` : `${solved}/${uniqueTotal} · ${xp} XP`}
        </span>
      </div>
      {title && <p className="muted small" style={{ marginBottom: 8 }}>{title}</p>}

      <div className={`flip ${flipped ? 'flipped' : ''}`}>
        <div className="flip-inner">
          {/* FRONT */}
          <div className="face front card" key={`front-${idx}`}>
            <div className="flag-stage">
              <div className={`flag-wrap ${phase === 'answered' && !lastCorrect ? 'shake' : ''}`}>
                <img src={flagUrl(country.code)} alt="Flag to identify" draggable={false} />
              </div>
              <LocatorMap country={country} showNeighborLabels={neighborLabels} />
            </div>
            <p className="prompt row" style={{ gap: 10 }}>
              <span>{item.retry ? 'One more time — which country is this?' : 'Which country is this flag?'}</span>
              {mode === 'practice' && !item.retry && <span className={`pill ${mastery}`}>{mastery === 'new' ? 'New flag' : MASTERY_LABEL[mastery]}</span>}
            </p>
            {answerMode === 'choice' ? (
              <div className="choices">
                {choices.map((c, i) => {
                  const isAnswer = c.code === country.code
                  const picked = chosen === c.code
                  const cls =
                    phase === 'answered'
                      ? isAnswer
                        ? 'correct'
                        : picked
                          ? 'wrong'
                          : 'dim'
                      : ''
                  return (
                    <button
                      key={c.code}
                      className={`choice ${cls}`}
                      disabled={phase === 'answered'}
                      onClick={() => answer(isAnswer, c.code)}
                    >
                      <span className="key">{i + 1}</span>
                      <span>{c.name}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <TypeAnswer disabled={phase === 'answered'} onSubmit={(text) => answer(isCorrectName(country, text), text)} />
            )}

            {mode === 'test' && phase === 'answered' && (
              <div className={`feedback ${lastCorrect ? 'ok' : 'bad'} pop`}>
                <div className="body">
                  <div className="title">{lastCorrect ? 'Correct!' : 'Incorrect'}</div>
                  {!lastCorrect && (
                    <div>
                      Correct answer: <b>{country.name}</b>
                    </div>
                  )}
                </div>
                <button className="btn ghost sm" onClick={() => setFlipped(true)}>
                  Details
                </button>
                <button className={`btn ${lastCorrect ? 'primary' : 'red'}`} onClick={next} autoFocus>
                  Continue
                </button>
              </div>
            )}
            {phase === 'ask' && (
              <p className="kbd" style={{ marginTop: 12 }}>
                {answerMode === 'choice' ? (
                  <>
                    Press <kbd>1</kbd>–<kbd>4</kbd> to answer
                  </>
                ) : (
                  <>
                    <kbd>Enter</kbd> to check · <kbd>↑</kbd><kbd>↓</kbd> to pick a suggestion
                  </>
                )}
              </p>
            )}
          </div>

          {/* BACK */}
          <div className="face back card" key={`back-${idx}`}>
            {flipped && (
              <CountryDetail country={country} neighborLabels={neighborLabels} showMap={true}>
                {resultLine}
              </CountryDetail>
            )}
            <div className="row spread" style={{ marginTop: 16 }}>
              <span className="kbd">
                <kbd>Enter</kbd> to continue
              </span>
              <button className={`btn ${lastCorrect ? 'primary' : 'blue'}`} onClick={next}>
                {idx + 1 >= items.length ? 'Finish' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
