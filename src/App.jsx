import { BrowserRouter, Routes, Route, useParams, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AudioProvider } from './context/AudioContext'
import { useData } from './hooks/useData'
import { useEffect, useState } from 'react'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import DuaPage from './pages/DuaPage'
import PraisePage from './pages/PraisePage'
import LibraryPage from './pages/LibraryPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage from './pages/SettingsPage'
import TasbihPage from './pages/TasbihPage'
import DailyPage from './pages/DailyPage'
import QuranPage from './pages/QuranPage'
import SurahReaderPage from './pages/SurahReaderPage'
import UpdatePrompt from './components/UpdatePrompt'
import IntroSplash from './components/IntroSplash'

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    return null
}

function LibraryPageWrapper({ duas }) {
    const { section } = useParams()
    return <LibraryPage duas={duas} initialSection={section} />
}

function AppContent() {
    const { duas, asma, loading } = useData()
    const { pathname, search } = useLocation()
    const { setLastDuaPath } = useSettings()

    const [showIntro, setShowIntro] = useState(() => {
        try {
            const isLanding = window.location.pathname === '/'
            const forceIntro = window.location.search.includes('intro')
            return isLanding && (forceIntro || !sessionStorage.getItem('deen_intro_seen'))
        } catch {
            return false
        }
    })

    useEffect(() => {
        const duaSubpaths = ['/dua', '/library', '/praise', '/daily']
        if (duaSubpaths.some(p => pathname.startsWith(p))) {
            setLastDuaPath(pathname)
        }
    }, [pathname, setLastDuaPath])

    if (loading && !showIntro) {
        return <LoadingScreen />
    }

    return (
        <>
            {showIntro && (
                <IntroSplash
                    onComplete={() => {
                        setShowIntro(false)
                        try {
                            sessionStorage.setItem('deen_intro_seen', 'true')
                            if (window.location.search.includes('intro')) {
                                window.history.replaceState({}, '', '/')
                            }
                        } catch {
                            // ignore storage errors
                        }
                    }}
                />
            )}
            <Navigation />
            <UpdatePrompt />
            <div className="max-w-5xl lg:max-w-7xl mx-auto min-h-screen">
                <Routes>
                    <Route path="/" element={<HomePage duas={duas} asma={asma} />} />
                    <Route path="/dua" element={<DuaPage duas={duas} asma={asma} />} />
                    <Route path="/quran" element={<QuranPage />} />
                    <Route path="/quran/:surahId" element={<SurahReaderPage />} />
                    <Route path="/daily" element={<DailyPage duas={duas} />} />
                    <Route path="/daily/:category" element={<DailyPage duas={duas} />} />
                    <Route path="/tasbih" element={<TasbihPage />} />
                    <Route path="/praise" element={<PraisePage duas={duas} asma={asma} />} />
                    <Route path="/library" element={<LibraryPage duas={duas} />} />
                    <Route path="/library/:section" element={<LibraryPageWrapper duas={duas} />} />
                    <Route path="/qibla" element={<div className="flex items-center justify-center h-screen opacity-50 font-bold uppercase tracking-widest text-[0.625rem]">Qibla Coming Soon</div>} />
                    <Route path="/favorites" element={<FavoritesPage duas={duas} asma={asma} />} />
                    <Route path="/bookmarks" element={<FavoritesPage duas={duas} asma={asma} />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </div>
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
                        <ScrollToTop />
                        <AppContent />
                        <Analytics />
                    </BrowserRouter>
                </AudioProvider>
            </FavoritesProvider>
        </SettingsProvider>
    )
}
