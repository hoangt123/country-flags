import { useEffect, useRef, useState } from 'react'
import type { Country } from '../data'
import { flagUrl } from '../lib/flags'
import { searchCountries } from '../lib/quiz'

interface Props {
  disabled?: boolean
  onSubmit: (text: string) => void
  onGiveUp: () => void
}

/** Type-the-country-name input with a small type-ahead list (Enter to submit). */
export default function TypeAnswer({ disabled, onSubmit, onGiveUp }: Props) {
  const [text, setText] = useState('')
  const [hits, setHits] = useState<Country[]>([])
  const [sel, setSel] = useState(0)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) ref.current?.focus()
  }, [disabled])

  useEffect(() => {
    setHits(text.trim().length >= 2 ? searchCountries(text, 5) : [])
    setSel(0)
  }, [text])

  const submit = (value: string) => {
    if (!value.trim() || disabled) return
    onSubmit(value)
    setText('')
    setHits([])
  }

  return (
    <form
      className="type-row"
      onSubmit={(e) => {
        e.preventDefault()
        submit(hits[sel] && text.trim().length >= 2 ? hits[sel].name : text)
      }}
    >
      <input
        ref={ref}
        value={text}
        disabled={disabled}
        placeholder="Type the country name…"
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSel((s) => Math.min(hits.length - 1, s + 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSel((s) => Math.max(0, s - 1))
          } else if (e.key === 'Escape') {
            e.stopPropagation()
            if (hits.length) setHits([])
            else if (!text.trim()) onGiveUp()
            else setText('')
          }
        }}
        aria-label="Country name"
      />
      <button className="btn blue" type="submit" disabled={disabled || !text.trim()}>
        Check
      </button>
      <button
        className="btn idk-btn"
        type="button"
        disabled={disabled}
        onClick={() => {
          setText('')
          setHits([])
          onGiveUp()
        }}
        title="Reveal the answer (counts as a miss)"
      >
        🤷 I don't know
      </button>
      {hits.length > 0 && !disabled && (
        <div className="suggest" role="listbox">
          {hits.map((c, i) => (
            <button
              type="button"
              key={c.code}
              className={i === sel ? 'on' : ''}
              onMouseEnter={() => setSel(i)}
              onClick={() => submit(c.name)}
              role="option"
              aria-selected={i === sel}
            >
              <img src={flagUrl(c.code)} alt="" />
              {c.name}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
