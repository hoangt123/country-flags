import { useEffect, useRef, useState } from 'react'

interface Props {
  disabled?: boolean
  onSubmit: (text: string) => void
  onGiveUp: () => void
}

/** Free-text answer box. No suggestions: recall, don't recognise. Small typos are forgiven by the checker. */
export default function TypeAnswer({ disabled, onSubmit, onGiveUp }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled) ref.current?.focus()
  }, [disabled])

  return (
    <form
      className="type-row"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim() || disabled) return
        onSubmit(text)
        setText('')
      }}
    >
      <input
        ref={ref}
        value={text}
        disabled={disabled}
        placeholder="Type the country name…"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            if (!text.trim()) onGiveUp()
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
          onGiveUp()
        }}
        title="Reveal the answer (counts as a miss)"
      >
        🤷 I don't know
      </button>
    </form>
  )
}
