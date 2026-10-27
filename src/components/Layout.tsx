import type { ReactNode } from 'react'
import { href } from '../hooks/useHashRoute'

const tabs = [
  { path: '/', label: 'Guida', icon: '📖' },
  { path: '/scanner', label: 'Scanner', icon: '📷' },
  { path: '/diario', label: 'Diario', icon: '📝' },
  { path: '/timer', label: 'Timer', icon: '⏱️' },
  { path: '/impostazioni', label: 'Altro', icon: '⚙️' },
]

export function Layout({ currentPath, children }: { currentPath: string; children: ReactNode }) {
  const root = '/' + (currentPath.split('/')[1] ?? '')
  const active = (p: string) =>
    p === '/' ? root === '/' || root === '/categoria' || root === '/mossa' || root === '/preferiti' : root === p
  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="brand">
          🧗 Boulder Notes
        </a>
      </header>
      <main className="content">{children}</main>
      <nav className="tabbar" aria-label="Navigazione principale">
        {tabs.map((t) => (
          <a key={t.path} href={t.path === '/' ? '#/' : href(t.path.slice(1))} className={active(t.path) ? 'tab active' : 'tab'}>
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
