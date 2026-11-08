import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { IconHeartFill, IconHeart, IconSearch, IconChevronLeft, IconChevronRight, IconX } from '../components/Icons'
import { t } from '../utils/theme'
import PageHeader from '../components/PageHeader'

export default function PraisePage({ asma = [] }) {
    const { theme } = useSettings()
    const navigate = useNavigate()
    const { toggle, isFavorite } = useFavorites()
    const isDark = theme === 'dark'

    // View state: 'list' (names) -> 'swipe' (detail view for names)
    const [viewMode, setViewMode] = useState('list')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [search, setSearch] = useState('')

    const scrollRef = useRef(null)
    const skippingFirstScroll = useRef(false)

    const filteredNames = useMemo(() => {
        if (!search.trim()) return asma
        const q = search.toLowerCase()
        return asma.filter(n =>
            n.transliteration?.toLowerCase().includes(q) ||
            n.meaning?.toLowerCase().includes(q) ||
            n.arabic_name?.includes(search)
        )
    }, [asma, search])

    const handleSwipeScroll = (e) => {
        if (skippingFirstScroll.current && e.target.scrollLeft === 0 && selectedIndex > 0) return
        skippingFirstScroll.current = false
        const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth)
        if (idx !== selectedIndex) setSelectedIndex(idx)
    }

    const goBack = () => {
        if (search) {
            setSearch('')
            return
        }
        if (viewMode === 'swipe') {
            setViewMode('list')
            return
        }
        if (viewMode === 'list') {
            navigate(-1)
            return
        }
    }

    // ─── 1. LIST VIEW: Asma-ul-Husna (Continuous Ledger Card) ───
    if (viewMode === 'list') {
        return (
            <div className="pb-36 min-h-screen animate-fade-in" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}>
                {/* Sticky Header with Title & Back */}
                <div className="sticky top-0 z-20 pb-3" style={{ background: t(theme, 'surface-0') }}>
                    <PageHeader
                        title="Asma-ul-Husna"
                        subtitle="The 99 Beautiful Names of Allah"
                        onBack={goBack}
                        padding="px-4 sm:px-6 pt-6 sm:pt-8 pb-3"
                        titleSize="text-xl sm:text-2xl"
                        titleWeight={400}
                        sticky={false}
                        titleSerif={false}
                    />

                    {/* Integrated Search Bar */}
                    <div className="px-4 sm:px-6 max-w-3xl mx-auto w-full mt-1">
                        <div
                            className="relative flex items-center rounded-2xl px-4 py-3 transition-all border shadow-xs focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/15"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                            }}
                        >
                            <IconSearch size={17} className="opacity-60 mr-3 flex-shrink-0" style={{ color: t(theme, 'accent') }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, meaning, or Arabic..."
                                className="w-full bg-transparent outline-none text-xs sm:text-sm placeholder:opacity-40 font-medium"
                                style={{ color: t(theme, 'text-primary') }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 hover:opacity-100 opacity-60 flex-shrink-0 ml-2 shadow-xs cursor-pointer"
                                    style={{
                                        background: t(theme, 'surface-2'),
                                        color: t(theme, 'text-muted'),
                                    }}
                                >
                                    <IconX size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <main className="px-4 sm:px-6 flex flex-col max-w-3xl mx-auto w-full mt-2">
                    {/* Bismillah Sacred Inscription */}
                    <div className="flex flex-col items-center py-4 opacity-80 animate-fade-in text-center select-none">
                        <p
                            className="text-xl sm:text-2xl md:text-3xl text-center mb-1 leading-relaxed"
                            style={{ fontFamily: 'var(--font-serif-arabic)', color: t(theme, 'text-primary'), direction: 'rtl' }}
                        >
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </p>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 mt-1">
                            In the Name of Allah, the Most Beneficent, the Most Merciful
                        </p>
                    </div>

                    {/* Ledger List */}
                    {filteredNames.length === 0 ? (
                        <div
                            className="rounded-2xl p-12 text-center border my-4"
                            style={{ background: t(theme, 'surface-1'), borderColor: t(theme, 'border') }}
                        >
                            <p className="text-xs opacity-50 font-medium tracking-wide" style={{ color: t(theme, 'text-muted') }}>
                                No divine names matching "{search}"
                            </p>
                        </div>
                    ) : (
                        <div
                            className="rounded-2xl overflow-hidden mb-8 transition-all duration-200"
                            style={{
                                background: t(theme, 'surface-1'),
                                border: `1px solid ${t(theme, 'border')}`,
                                boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                            }}
                        >
                            {filteredNames.map((name, i) => {
                                const isLast = i === filteredNames.length - 1
                                return (
                                    <button
                                        key={name.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedIndex(i)
                                            skippingFirstScroll.current = true
                                            setViewMode('swipe')
                                        }}
                                        className="group w-full flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] active:bg-black/[0.04] cursor-pointer"
                                        style={{
                                            borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                        }}
                                    >
                                        {/* Left: Number Squircle Badge */}
                                        <div
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-mono font-semibold transition-transform group-hover:scale-105 shadow-xs"
                                            style={{
                                                background: t(theme, 'surface-2'),
                                                color: t(theme, 'accent'),
                                                border: `1px solid ${t(theme, 'border')}`,
                                            }}
                                        >
                                            {name.id}
                                        </div>

                                        {/* Middle: Transliteration & English Meaning */}
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h4
                                                className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                style={{ color: t(theme, 'text-primary') }}
                                            >
                                                {name.transliteration}
                                            </h4>
                                            <p
                                                className="text-[11px] sm:text-xs opacity-55 truncate mt-0.5 leading-normal"
                                                style={{ color: t(theme, 'text-muted') }}
                                            >
                                                {name.meaning}
                                            </p>
                                        </div>

                                        {/* Right: Sacred Arabic Name Calligraphy */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span
                                                className="text-lg sm:text-xl font-normal select-text pt-0.5"
                                                style={{
                                                    fontFamily: 'var(--font-serif-arabic)',
                                                    color: t(theme, 'text-primary'),
                                                    direction: 'rtl',
                                                }}
                                            >
                                                {name.arabic_name}
                                            </span>
                                            <IconChevronRight
                                                size={14}
                                                className="opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all hidden sm:block"
                                                style={{ color: t(theme, 'text-primary') }}
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </main>
            </div>
        )
    }

    // ─── 2. SWIPE VIEW: Detailed Full-Screen Cards ───
    if (viewMode === 'swipe') {
        const currentName = filteredNames[selectedIndex]
        const favKey = `asma-${currentName?.id}`
        const isFav = isFavorite(favKey)

        return (
            <div className="fixed inset-0 z-[100] flex flex-col animate-modal-slide-up" style={{ background: t(theme, 'surface-0') }}>
                {/* Header Navigation */}
                <div
                    className="flex items-center justify-between px-6"
                    style={{
                        background: t(theme, 'surface-0'),
                        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
                        paddingBottom: '1.5rem',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90"
                            style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}
                        >
                            <IconChevronLeft size={22} />
                        </button>
                        <span className="text-[15px] font-normal tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                            {currentName?.transliteration} · {selectedIndex + 1} of {filteredNames.length}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggle({ id: favKey, type: 'asma' })}
                        className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90"
                        style={{ background: t(theme, 'surface-2'), color: t(theme, 'accent') }}
                    >
                        {isFav ? <IconHeartFill size={18} className="text-red-500" /> : <IconHeart size={18} />}
                    </button>
                </div>

                {/* Horizontal Swipe Carousel */}
                <div
                    ref={(el) => {
                        scrollRef.current = el
                        if (el && viewMode === 'swipe' && el.scrollLeft === 0 && selectedIndex > 0) {
                            el.scrollLeft = selectedIndex * el.offsetWidth
                        }
                    }}
                    onScroll={handleSwipeScroll}
                    className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                >
                    {filteredNames.map((name) => {
                        return (
                            <div key={name.id} className="w-full flex-shrink-0 snap-center flex flex-col p-6 sm:p-8 overflow-y-auto">
                                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
                                    {/* Number Pill */}
                                    <span
                                        className="text-xs font-mono font-bold px-2.5 py-1 rounded-full mb-6 border"
                                        style={{
                                            background: t(theme, 'surface-1'),
                                            borderColor: t(theme, 'border'),
                                            color: t(theme, 'accent'),
                                        }}
                                    >
                                        Name {name.id} of 99
                                    </span>

                                    {/* Sacred Arabic Calligraphy Display Box */}
                                    <div className="relative group mb-8">
                                        <div
                                            className="w-48 h-48 sm:w-56 sm:h-56 rounded-[3rem] flex items-center justify-center text-5xl sm:text-6xl shadow-md transition-transform"
                                            style={{
                                                background: t(theme, 'surface-1'),
                                                border: `1px solid ${t(theme, 'border')}`,
                                                color: t(theme, 'accent'),
                                                fontFamily: 'var(--font-serif-arabic)',
                                                direction: 'rtl',
                                            }}
                                        >
                                            {name.arabic_name}
                                        </div>
                                    </div>

                                    {/* Transliteration & Meaning */}
                                    <h2 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                                        {name.transliteration}
                                    </h2>
                                    <p
                                        className="text-base sm:text-lg opacity-65 italic mb-8"
                                        style={{ color: t(theme, 'text-secondary'), fontFamily: 'var(--font-serif-body)' }}
                                    >
                                        {name.meaning}
                                    </p>

                                    {/* Spiritual Benefit / Context */}
                                    {name.benefit && (
                                        <div
                                            className="p-6 sm:p-7 rounded-[2rem] border text-left w-full"
                                            style={{
                                                background: t(theme, 'surface-1'),
                                                borderColor: t(theme, 'border'),
                                            }}
                                        >
                                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 opacity-40" style={{ color: t(theme, 'text-muted') }}>
                                                Contemplation & Benefit
                                            </p>
                                            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: t(theme, 'text-primary') }}>
                                                {name.benefit}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return null
}
