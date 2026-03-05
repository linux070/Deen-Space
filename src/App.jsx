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
        <div className="flex flex-col items-center justify-center min-vh-screen gap-4">
            <div className="relative">
                <div
                    className="w-16 h-16 rounded-full"
                    style={{
                        background: 'var(--color-accent-glow)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-3xl">☪</span>
            </div>
            <p className="text-[0.625rem] font-bold tracking-widest uppercase opacity-40">Loading…</p>
            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
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
