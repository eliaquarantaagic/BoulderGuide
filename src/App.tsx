import { Layout } from './components/Layout'
import { useHashRoute } from './hooks/useHashRoute'
import { StoreProvider } from './hooks/StoreProvider'
import { CategoryPage } from './pages/CategoryPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { JournalPage } from './pages/JournalPage'
import { MovePage } from './pages/MovePage'
import { NotFound } from './pages/NotFound'
import { ScannerPage } from './pages/ScannerPage'
import { SettingsPage } from './pages/SettingsPage'
import { TimerPage } from './pages/TimerPage'

function Router() {
  const { segments, path } = useHashRoute()
  const [section, param] = segments
  let page
  switch (section) {
    case undefined:
      page = <HomePage />
      break
    case 'categoria':
      page = <CategoryPage id={param ?? ''} />
      break
    case 'mossa':
      page = <MovePage id={param ?? ''} />
      break
    case 'preferiti':
      page = <FavoritesPage />
      break
    case 'diario':
      page = <JournalPage entryId={param} />
      break
    case 'scanner':
      page = <ScannerPage />
      break
    case 'timer':
      page = <TimerPage />
      break
    case 'impostazioni':
      page = <SettingsPage />
      break
    default:
      page = <NotFound />
  }
  return <Layout currentPath={path}>{page}</Layout>
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
