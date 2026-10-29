import { useCallback, useEffect, useState } from 'react'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Test from './pages/Test'
import Progress from './pages/Progress'
import Learn from './pages/Learn'
import { useStore } from './lib/store'

type Route = 'home' | 'practice' | 'test' | 'progress' | 'learn'

const TABS: { id: Route; label: string; ico: string }[] = [
  { id: 'home', label: 'Home', ico: '🏠' },
  { id: 'practice', label: 'Practice', ico: '🧠' },
  { id: 'test', label: 'Test', ico: '🎯' },
  { id: 'learn', label: 'Learn', ico: '📖' },
  { id: 'progress', label: 'Progress', ico: '📈' },
]

function routeFromHash(): Route {
  const h = location.hash.replace(/^#\/?/, '')
  return (TABS.some((t) => t.id === h) ? h : 'home') as Route
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [practiceSeed, setPracticeSeed] = useState<string[] | null>(null)
  const { settings } = useStore()

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'auto') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  const go = useCallback((r: string) => {
    location.hash = `#/${r}`
    window.scrollTo({ top: 0 })
  }, [])

  const practiceMisses = useCallback(
    (codes: string[]) => {
      setPracticeSeed(codes)
      go('practice')
    },
    [go],
  )

  return (
    <div className="app">
      <nav className="nav" aria-label="Main">
        <div className="nav-inner">
          <span className="brand">🌍 Flag Quest</span>
          {TABS.map((t) => (
            <button key={t.id} className={route === t.id ? 'active' : ''} onClick={() => go(t.id)} aria-current={route === t.id ? 'page' : undefined}>
              <span className="ico" aria-hidden>
                {t.ico}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="grow">
        {route === 'home' && <Home go={go} />}
        {route === 'practice' && <Practice key={practiceSeed ? practiceSeed.join(',') : 'default'} seed={practiceSeed} onClearSeed={() => setPracticeSeed(null)} onHome={() => go('home')} />}
        {route === 'test' && <Test onPracticeMisses={practiceMisses} onHome={() => go('home')} />}
        {route === 'learn' && <Learn />}
        {route === 'progress' && <Progress />}
      </main>
    </div>
  )
}
