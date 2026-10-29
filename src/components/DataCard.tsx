import { useRef, useState } from 'react'
import { store } from '../lib/store'
import { linkExistingFile, linkNewFile, reconnect, unlink, useFileSync } from '../lib/fileSync'
import { dayKey } from '../lib/format'

/** Where progress is stored, with controls to back it up or auto-save to a file. */
export default function DataCard() {
  const fs = useFileSync()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const run = async (fn: () => Promise<void>, okMsg: string) => {
    setMsg(null)
    try {
      await fn()
      setMsg(okMsg)
    } catch (e) {
      const err = e as Error
      if (err.name !== 'AbortError') setMsg(err.message)
    }
  }

  const exportData = () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `flag-quest-progress-${dayKey()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = (file: File) =>
    run(async () => {
      store.importJSON(await file.text())
    }, 'Backup merged into your progress.')

  return (
    <div className="card stack">
      <h3>Your progress is saved</h3>
      <p className="muted small">
        Every answer is saved instantly in this browser (it survives closing the tab and restarting). It is tied to this browser and
        site address, so also keep a copy as a file:
      </p>

      {fs.supported ? (
        <div className="stack" style={{ gap: 8 }}>
          {fs.linked && fs.permission === 'granted' && (
            <div className="result-line ok">
              ✅ Auto-saving to <b>{fs.name}</b>
              {fs.lastSaved && <span className="muted small"> · last saved {new Date(fs.lastSaved).toLocaleTimeString()}</span>}
            </div>
          )}
          {fs.linked && fs.permission === 'prompt' && (
            <div className="result-line bad">
              ⚠️ Click to reconnect <b>{fs.name}</b>
              <button className="btn sm yellow" onClick={() => run(reconnect, 'Reconnected and synced.')}>
                Reconnect
              </button>
            </div>
          )}
          {!fs.linked && <p className="small">Pick a file once and the app keeps it up to date after every answer, on top of the browser copy.</p>}
          <div className="row">
            {!fs.linked ? (
              <>
                <button className="btn sm blue" disabled={fs.busy} onClick={() => run(linkNewFile, 'Auto-save is on.')}>
                  Auto-save to a file…
                </button>
                <button className="btn sm" disabled={fs.busy} onClick={() => run(linkExistingFile, 'File loaded; auto-save is on.')}>
                  Open an existing progress file…
                </button>
              </>
            ) : (
              <button className="btn sm" onClick={() => run(unlink, 'Auto-save to file turned off.')}>
                Stop auto-saving to file
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="small">This browser can't write files directly (Chrome or Edge can). Use export/import below to move or back up your progress.</p>
      )}

      <hr />
      <div className="row">
        <button className="btn sm" onClick={exportData}>
          Download backup
        </button>
        <button className="btn sm" onClick={() => fileRef.current?.click()}>
          Import backup
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        <button
          className="btn sm red"
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) store.resetProgress()
          }}
        >
          Reset
        </button>
      </div>
      <p className="muted small">Importing merges: nothing already in the app is lost, and the newer record wins for each flag.</p>
      {(msg || fs.error) && <p className="small" style={{ color: fs.error ? 'var(--red-dark)' : 'var(--green-dark)' }}>{fs.error ?? msg}</p>}
    </div>
  )
}
