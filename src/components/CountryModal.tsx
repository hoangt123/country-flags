import { useState } from 'react'
import { BY_CODE } from '../data'
import CountryDetail from './CountryDetail'
import Modal from './Modal'
import { useStore } from '../lib/store'
import { masteryOf, MASTERY_LABEL } from '../lib/srs'

export default function CountryModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [current, setCurrent] = useState(code)
  const { cards, settings } = useStore()
  const c = BY_CODE[current]
  if (!c) return null
  const stat = cards[c.code]
  const m = masteryOf(stat)
  return (
    <Modal onClose={onClose}>
      <CountryDetail country={c} neighborLabels={settings.neighborLabels} onPick={setCurrent}>
        <div className="row" style={{ marginTop: 10 }}>
          <span className={`pill ${m}`}>{MASTERY_LABEL[m]}</span>
          {stat && stat.seen > 0 && (
            <span className="muted small">
              {stat.correct}/{stat.seen} correct
            </span>
          )}
        </div>
      </CountryDetail>
    </Modal>
  )
}
