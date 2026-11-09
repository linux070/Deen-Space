import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuranList, useLastRead } from '../hooks/useQuran'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconSearch,
    IconQuran,
    IconX,
    RubElHizbBadge,
} from '../components/Icons'

const QUICK_SURAHS = [
    { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', desc: 'The Opening · 7 Verses' },
    { number: 18, name: 'Al-Kahf', arabic: 'الكهف', desc: 'The Cave · 110 Verses' },
    { number: 36, name: 'Ya-Sin', arabic: 'يس', desc: 'Heart of Qur\'an · 83 Verses' },
    { number: 55, name: 'Ar-Rahman', arabic: 'الرحمن', desc: 'The Beneficent · 78 Verses' },
    { number: 56, name: 'Al-Waqi\'ah', arabic: 'الواقعة', desc: 'The Inevitable · 96 Verses' },
    { number: 67, name: 'Al-Mulk', arabic: 'الملك', desc: 'The Dominion · 30 Verses' },
]

export default function QuranPage() {
    const navigate = useNavigate()
    const { theme } = useSettings()
    const isDark = theme === 'dark'
    const { surahs, loading, error } = useQuranList()
    const { lastRead } = useLastRead()

    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all') // 'all' | 'Meccan' | 'Medinan'
    const [viewMode, setViewMode] = useState('ledger') // 'ledger' | 'grid'

    // Filtered surahs
    const filteredSurahs = useMemo(() => {
        if (!surahs) return []
        const query = searchQuery.trim().toLowerCase()

        return surahs.filter(s => {
            if (filterType !== 'all' && s.revelationType !== filterType) return false
            if (!query) return true
            const numMatch = s.number.toString() === query
            const nameMatch = s.englishName.toLowerCase().includes(query)
            const transMatch = s.englishNameTranslation.toLowerCase().includes(query)
            const arabicMatch = s.name.includes(query)
            return numMatch || nameMatch || transMatch || arabicMatch
        })
    }, [surahs, searchQuery, filterType])

    const counts = useMemo(() => {
        if (!surahs) return { all: 114, meccan: 86, medinan: 28 }
        return {
            all: surahs.length,
            meccan: surahs.filter(s => s.revelationType === 'Meccan').length,
            medinan: surahs.filter(s => s.revelationType === 'Medinan').length,
        }
    }, [surahs])

    // High contrast active button text across themes
    const activeTextCol = isDark ? '#0c0f14' : '#ffffff'

    const currentSurah = useMemo(() => {
        if (!lastRead?.surahNumber || !surahs?.length) return null
        return surahs.find(s => s.number === Number(lastRead.surahNumber))
    }, [lastRead, surahs])

    const totalVerses = lastRead?.totalVerses || currentSurah?.numberOfAyahs || 1
    const surahEnglishName = lastRead?.surahEnglishName || currentSurah?.englishName || `Surah ${lastRead?.surahNumber}`
    const currentAyah = lastRead?.ayahNumber || 1
    const lastReadProgress = Math.max(3, Math.min(100, Math.round((currentAyah / totalVerses) * 100)))

    return (
        <div
            className="pb-36 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto flex flex-col gap-5"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
        >
            {/* ── 1. Modern Native Masthead ── */}
            <header className="animate-fade-in pt-2 pb-1">
                <h1
                    className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight"
                    style={{
                        color: t(theme, 'text-primary'),
                    }}
                >
                    The Holy Qur'an
                </h1>
            </header>

            {/* ── 2. "Continue Reciting" Banner (Homepage Unified Design) ── */}
            {lastRead && (
                <section className="animate-fade-in" style={{ animationDelay: '40ms' }}>
                    <div
                        onClick={() => navigate(`/quran/${lastRead.surahNumber}?ayah=${currentAyah}`)}
                        className="group relative cursor-pointer rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-sm hover:border-amber-500/60"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        {/* Top: Rub el Hizb Medallion, Surah Info, Circular Play Button */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <RubElHizbBadge
                                    number={lastRead.surahNumber}
                                    size={48}
                                    theme={theme}
                                />
                                <div className="min-w-0 flex flex-col">
                                    <span
                                        className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] mb-0.5"
                                        style={{
                                            color: t(theme, 'accent'),
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Continue Reading
                                    </span>
                                    <h3
                                        className="text-lg sm:text-xl font-normal truncate tracking-tight transition-colors group-hover:text-amber-500"
                                        style={{
                                            color: t(theme, 'text-primary'),
                                            fontFamily: 'var(--font-serif-body)',
                                        }}
                                    >
                                        {surahEnglishName}
                                    </h3>
                                    <p
                                        className="text-xs truncate mt-0.5 font-normal"
                                        style={{
                                            color: t(theme, 'text-secondary'),
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Surah {lastRead.surahNumber} · Verse {currentAyah} of {totalVerses}
                                    </p>
                                </div>
                            </div>

                            {/* Circular Play Button */}
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 active:scale-95 shadow-sm"
                                style={{
                                    background: t(theme, 'accent'),
                                    color: isDark ? '#0c0f14' : '#ffffff',
                                    boxShadow: `0 4px 14px ${t(theme, 'accent-glow')}`,
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="6 3 20 12 6 21 6 3" />
                                </svg>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div
                            className="w-full h-1.5 rounded-full overflow-hidden mt-4"
                            style={{ background: t(theme, 'surface-2') }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${lastReadProgress}%`,
                                    background: t(theme, 'accent'),
                                }}
                            />
                        </div>

                        {/* Bottom Info Row */}
                        <div
                            className="flex items-center justify-between text-xs mt-3 font-normal"
                            style={{
                                color: t(theme, 'text-secondary'),
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            <span>Resume from verse {currentAyah}</span>
                            <span style={{ fontFamily: 'var(--font-serif-body)' }}>{currentAyah} / {totalVerses}</span>
                        </div>
                    </div>
                </section>
            )}

            {/* ── 3. Frequently Recited Compact Quick-Rail ── */}
            <section className="animate-fade-in" style={{ animationDelay: '80ms' }}>
                <span
                    className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] block mb-2 px-0.5 opacity-60"
                    style={{
                        color: t(theme, 'text-muted'),
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    Quick Access
                </span>

                <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 no-scrollbar scrollbar-none touch-pan-x">
                    {QUICK_SURAHS.map((q) => (
                        <button
                            key={q.number}
                            onClick={() => navigate(`/quran/${q.number}`)}
                            className="group flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all duration-200 active:scale-95 hover:border-amber-500/60 shadow-xs cursor-pointer"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                            }}
                        >
                            <RubElHizbBadge
                                number={q.number}
                                size={30}
                                theme={theme}
                            />
                            <div className="flex flex-col text-left min-w-0">
                                <div className="flex items-center gap-1.5 leading-tight">
                                    <span
                                        className="text-xs sm:text-[13px] font-medium tracking-tight truncate group-hover:text-amber-500 transition-colors"
                                        style={{
                                            color: t(theme, 'text-primary'),
                                            fontFamily: 'var(--font-serif-body)',
                                        }}
                                    >
                                        {q.name}
                                    </span>
                                    <span
                                        className="font-arabic opacity-85 group-hover:text-amber-500 transition-colors"
                                        style={{
                                            fontFamily: 'var(--script-font)',
                                            fontSize: 'calc(var(--arabic-size) * 0.72)',
                                            color: t(theme, 'text-primary'),
                                            direction: 'rtl',
                                        }}
                                    >
                                        {q.arabic}
                                    </span>
                                </div>
                                <span
                                    className="text-[10px] opacity-55 font-normal truncate mt-0.5 leading-tight"
                                    style={{
                                        color: t(theme, 'text-muted'),
                                        fontFamily: 'var(--font-sans)',
                                    }}
                                >
                                    {q.desc}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── 4. Unified Search + Filters + Layout Toolbar ── */}
            <section className="flex flex-col gap-2.5 animate-fade-in" style={{ animationDelay: '120ms' }}>
                {/* Search Input */}
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, number, or meaning..."
                        className="w-full bg-transparent outline-none text-xs sm:text-sm placeholder:opacity-40 font-medium"
                        style={{ color: t(theme, 'text-primary') }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
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

                {/* Filter Tabs + Layout Switcher on single row */}
                <div className="flex items-center gap-2 justify-between">
                    {/* Revelation Filters */}
                    <div
                        className="flex items-center gap-1 p-1 rounded-xl border flex-1 sm:flex-initial"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        {[
                            { id: 'all', label: 'All', count: counts.all },
                            { id: 'Meccan', label: 'Meccan', count: counts.meccan },
                            { id: 'Medinan', label: 'Medinan', count: counts.medinan },
                        ].map(tab => {
                            const isActive = filterType === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterType(tab.id)}
                                    className="flex-1 sm:flex-initial px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap text-center"
                                    style={{
                                        background: isActive ? t(theme, 'accent') : 'transparent',
                                        color: isActive ? activeTextCol : t(theme, 'text-muted'),
                                        boxShadow: isActive ? `0 2px 8px ${t(theme, 'accent-glow')}` : 'none',
                                    }}
                                >
                                    {tab.label}
                                    <span className="ml-1 opacity-70">({tab.count})</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Layout Toggle (visible on all screens) */}
                    <div
                        className="flex items-center p-1 rounded-xl border flex-shrink-0"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        <button
                            onClick={() => setViewMode('ledger')}
                            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all"
                            style={{
                                background: viewMode === 'ledger' ? t(theme, 'surface-2') : 'transparent',
                                color: viewMode === 'ledger' ? t(theme, 'accent') : t(theme, 'text-muted'),
                            }}
                            title="List layout"
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className="px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all"
                            style={{
                                background: viewMode === 'grid' ? t(theme, 'surface-2') : 'transparent',
                                color: viewMode === 'grid' ? t(theme, 'accent') : t(theme, 'text-muted'),
                            }}
                            title="Card layout"
                        >
                            Grid
                        </button>
                    </div>
                </div>
            </section>

            {/* ── 5. Surah Directory ── */}
            <main className="animate-fade-in" style={{ animationDelay: '160ms' }}>
                {loading ? (
                    /* Skeleton loader */
                    <div
                        className="rounded-2xl border overflow-hidden"
                        style={{ background: t(theme, 'surface-1'), borderColor: t(theme, 'border') }}
                    >
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3.5 px-4 py-3.5 animate-pulse"
                                style={{ borderBottom: i < 7 ? `1px solid ${t(theme, 'border')}` : 'none' }}
                            >
                                <div className="w-9 h-9 rounded-xl" style={{ background: t(theme, 'surface-2') }} />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 w-28 rounded-full" style={{ background: t(theme, 'surface-2') }} />
                                    <div className="h-2.5 w-20 rounded-full" style={{ background: t(theme, 'surface-2'), opacity: 0.5 }} />
                                </div>
                                <div className="h-5 w-16 rounded" style={{ background: t(theme, 'surface-2'), opacity: 0.4 }} />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div
                        className="p-8 rounded-2xl text-center border"
                        style={{ background: t(theme, 'surface-1'), borderColor: t(theme, 'border') }}
                    >
                        <p className="text-sm font-semibold mb-2" style={{ color: t(theme, 'text-primary') }}>
                            Failed to load Qur'an directory.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-xl text-xs font-bold"
                            style={{ background: t(theme, 'accent'), color: activeTextCol }}
                        >
                            Reload
                        </button>
                    </div>
                ) : filteredSurahs.length === 0 ? (
                    <div
                        className="py-16 px-6 text-center rounded-2xl border"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        <p className="text-base font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                            No Surah found matching "{searchQuery}"
                        </p>
                        <p className="text-xs opacity-60 mb-4" style={{ color: t(theme, 'text-muted') }}>
                            Try searching with a number like "18" or a name like "Kahf".
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                            style={{ background: t(theme, 'surface-2'), color: t(theme, 'accent'), border: `1px solid ${t(theme, 'border')}` }}
                        >
                            Clear search
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* ── Card Grid View ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredSurahs.map(surah => (
                            <SurahGridCard
                                key={surah.number}
                                surah={surah}
                                theme={theme}
                                isDark={isDark}
                                onClick={() => navigate(`/quran/${surah.number}`)}
                            />
                        ))}
                    </div>
                ) : (
                    /* ── Continuous Divided Ledger (Default) ── */
                    <div
                        className="rounded-2xl border overflow-hidden"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                            boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                        }}
                    >
                        {filteredSurahs.map((surah, idx) => (
                            <SurahLedgerRow
                                key={surah.number}
                                surah={surah}
                                theme={theme}
                                isDark={isDark}
                                isLast={idx === filteredSurahs.length - 1}
                                onClick={() => navigate(`/quran/${surah.number}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

/**
 * Editorial Grid Card — kept for "Cards" layout
 */
function SurahGridCard({ surah, theme, isDark, onClick }) {
    return (
        <button
            onClick={onClick}
            className="group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-200 text-left active:scale-[0.985] border hover:border-amber-500/60 hover:shadow-md hover:-translate-y-0.5"
            style={{
                background: t(theme, 'surface-1'),
                borderColor: t(theme, 'border'),
            }}
        >
            {/* Left: Number Crest and Titles */}
            <div className="flex items-center gap-3.5 min-w-0 pr-2 flex-1">
                {/* Chapter Crest Rub el Hizb Medallion */}
                <RubElHizbBadge
                    number={surah.number}
                    size={38}
                    theme={theme}
                />

                <div className="min-w-0 flex-1">
                    <h3
                        className="text-sm sm:text-[15px] font-medium tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--font-serif-body)',
                        }}
                    >
                        {surah.englishName}
                    </h3>
                    <p
                        className="text-xs sm:text-[13px] opacity-70 truncate mt-0.5 leading-tight"
                        style={{
                            color: t(theme, 'text-secondary'),
                            fontFamily: 'var(--font-serif-body)',
                        }}
                    >
                        {surah.englishNameTranslation}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-normal leading-tight" style={{ color: t(theme, 'text-secondary'), fontFamily: 'var(--font-sans)' }}>
                        <span>{surah.revelationType === 'Meccan' ? 'Meccan' : 'Medinan'}</span>
                    </div>
                </div>
            </div>

            {/* Right: Arabic Calligraphy + Verses Count underneath (room to breathe) */}
            <div className="flex flex-col items-end flex-shrink-0 pl-2 text-right">
                <span
                    className="font-arabic leading-tight transition-transform duration-300 group-hover:scale-105"
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--script-font)',
                        fontSize: 'calc(var(--arabic-size) * 0.92)',
                        direction: 'rtl',
                    }}
                >
                    {surah.name}
                </span>
                <span
                    className="text-[12px] opacity-70 font-medium tracking-wide leading-normal mt-2 whitespace-nowrap"
                    style={{
                        color: t(theme, 'text-muted'),
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    {surah.numberOfAyahs} Ayahs
                </span>
            </div>
        </button>
    )
}

/**
 * Continuous Ledger Row — clean, divided, optically aligned (Quran.com layout)
 */
function SurahLedgerRow({ surah, theme, isDark, isLast, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] text-left group active:scale-[0.995]"
            style={{
                borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
            }}
        >
            {/* Left: Crest + Names */}
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-3 flex-1">
                {/* Chapter Numeral Rub el Hizb Medallion */}
                <RubElHizbBadge
                    number={surah.number}
                    size={34}
                    theme={theme}
                />
                <div className="min-w-0 flex-1">
                    <h3
                        className="text-xs sm:text-sm font-medium truncate leading-tight group-hover:text-amber-500 transition-colors"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--font-serif-body)',
                        }}
                    >
                        {surah.englishName}
                    </h3>
                    <div
                        className="flex items-center gap-1.5 mt-0.5 text-[11px] opacity-55 font-normal leading-tight"
                        style={{
                            color: t(theme, 'text-muted'),
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        <span className="truncate">{surah.englishNameTranslation}</span>
                    </div>
                </div>
            </div>

            {/* Right: Arabic Calligraphy + Verses Count underneath (room to breathe) */}
            <div className="flex flex-col items-end flex-shrink-0 pl-3 text-right">
                <span
                    className="text-base sm:text-lg font-arabic leading-tight transition-transform duration-200 group-hover:scale-105"
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--script-font)',
                        direction: 'rtl',
                    }}
                >
                    {surah.name}
                </span>
                <div
                    className="flex items-center gap-1.5 mt-2 text-[12px] opacity-70 font-medium tracking-wide leading-normal"
                    style={{ color: t(theme, 'text-muted'), fontFamily: 'var(--font-sans)' }}
                >
                    <span className="text-[10px] uppercase tracking-wider opacity-60 hidden sm:inline">
                        {surah.revelationType} ·
                    </span>
                    <span className="whitespace-nowrap">{surah.numberOfAyahs} Ayahs</span>
                </div>
            </div>
        </button>
    )
}
