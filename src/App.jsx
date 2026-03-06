import { BrowserRouter, Routes, Route, useParams, useLocation } from 'react-router-dom'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AudioProvider } from './context/AudioContext'
import { useData } from './hooks/useData'
import { useEffect } from 'react'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import DuaPage from './pages/DuaPage'
import PraisePage from './pages/PraisePage'
import LibraryPage from './pages/LibraryPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import TasbihPage from './pages/TasbihPage'
import DailyPage from './pages/DailyPage'

function LibraryPageWrapper({ duas }) {
    const { section } = useParams()
    return <LibraryPage duas={duas} initialSection={section} />
}

function AppContent() {
    const { duas, asma, loading } = useData()
    const { pathname } = useLocation()
    const { setLastDuaPath } = useSettings()

    useEffect(() => {
        const duaSubpaths = ['/dua', '/library', '/praise', '/daily']
        if (duaSubpaths.some(p => pathname.startsWith(p))) {
            setLastDuaPath(pathname)
        }
    }, [pathname, setLastDuaPath])

    if (loading) {
        return <LoadingScreen />
    }

    return (
        <>
            <div className="max-w-5xl mx-auto min-h-screen">
                <Routes>
                    <Route path="/" element={<HomePage duas={duas} asma={asma} />} />
                    <Route path="/dua" element={<DuaPage duas={duas} asma={asma} />} />
                    <Route path="/daily" element={<DailyPage duas={duas} />} />
                    <Route path="/daily/:category" element={<DailyPage duas={duas} />} />
                    <Route path="/tasbih" element={<TasbihPage />} />
                    <Route path="/praise" element={<PraisePage duas={duas} asma={asma} />} />
                    <Route path="/library" element={<LibraryPage duas={duas} />} />
                    <Route path="/library/:section" element={<LibraryPageWrapper duas={duas} />} />
                    <Route path="/qibla" element={<div className="flex items-center justify-center h-screen opacity-50 font-bold uppercase tracking-widest text-[0.625rem]">Qibla Coming Soon</div>} />
                    <Route path="/favorites" element={<FavoritesPage duas={duas} asma={asma} />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </div>
            <BottomNav />
        </>
    )
}

function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: 'var(--color-surface-0)' }}>
            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin opacity-20" />
        </div>
    )
}

export default function App() {
    return (
        <SettingsProvider>
            <FavoritesProvider>
                <AudioProvider>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </AudioProvider>
            </FavoritesProvider>
        </SettingsProvider>
    )
}
