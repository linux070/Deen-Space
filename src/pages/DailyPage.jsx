import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import DuaCard from '../components/DuaCard'
import { IconChevronLeft, IconChevronRight, IconSun, IconMoon, IconMosque, IconBook } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import { toTitleCase } from '../utils/text'

const CATEGORIES = [
    { key: 'morning', label: 'Morning', subtitle: 'Adhkar As-Sabah', icon: IconSun },
    { key: 'evening', label: 'Evening', subtitle: 'Adhkar Al-Masa', icon: IconMoon },
    { key: 'after-salah', label: 'After Salah', subtitle: 'Post-Prayer Dhikr', icon: IconMosque },
]

export default function DailyPage({ duas }) {
    const { theme } = useSettings()
    const navigate = useNavigate()
    const { category } = useParams()

    // View state: 'landing' (grid) -> 'swipe' (detail)
    const [viewMode, setViewMode] = useState(category ? 'dualist' : 'landing')
    const [activeCategory, setActiveCategory] = useState(category)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const scrollRef = useRef(null)

    // Sync activeCategory from URL
    useEffect(() => {
        if (category) {
            setActiveCategory(category)
            setViewMode('dualist')
        }
    }, [category])

    // List of duas for the current active category (for the vertical list)
    const listDuas = useMemo(() => {
        if (!activeCategory) return []
        return duas.filter(d => d.category === activeCategory)
    }, [duas, activeCategory])

    // Sequence of all daily duas (Morning -> Evening -> After Salah) for the swiper
    const swipeDuas = useMemo(() => {
        const order = ['morning', 'evening', 'after-salah']
        return duas
            .filter(d => order.includes(d.category))
            .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
    }, [duas])

    const activeCatData = useMemo(
        () => CATEGORIES.find(c => c.key === activeCategory),
        [activeCategory]
    )

    // Scroll handling for swipe view
    const handleSwipeScroll = (e) => {
        const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth)
        if (idx !== selectedIndex) setSelectedIndex(idx)
    }

    // BACK NAVIGATION
    const goBack = () => {
        if (viewMode === 'swipe') {
            setViewMode('dualist')
            return
        }
        if (viewMode === 'dualist') {
            if (category) {
                navigate('/dua')
                return
            }
            setViewMode('landing')
            setActiveCategory(null)
            return
        }
        if (viewMode === 'landing') {
            navigate('/dua')
            return
        }
    }

    // HEADER — matching LibraryPage's header pattern
    const Header = () => {
        const title = viewMode === 'swipe'
            ? `${toTitleCase(activeCategory)} ${selectedIndex + 1} / ${swipeDuas.length}`
            : (viewMode === 'landing' ? 'Daily Adhkar' : toTitleCase(activeCategory))

        const subtitle = (viewMode === 'landing') ? 'Collections of Supplication' : null

        return (
            <div className="sticky top-0 z-20 pb-1" style={{ background: t(theme, 'surface-0') }}>
                <PageHeader
                    title={title}
                    onBack={goBack}
                    padding="px-6 pt-8 pb-3"
                    titleSize="text-xl"
                    titleWeight={300}
                    sticky={false}
                    titleSerif={false}
                />
            </div>
        )
    }

    // ─── LANDING: List of categories ───
    if (viewMode === 'landing') {
        const isDark = theme === 'dark'
        return (
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <Header />
                <main className="px-6 flex flex-col gap-3 mt-4 animate-fade-in">
                    {CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat.key}
                            onClick={() => {
                                setActiveCategory(cat.key)
                                setViewMode('dualist')
                            }}
                            className="group flex items-center gap-5 p-5 rounded-[2.25rem] text-left transition-all active:scale-[0.98] hover:shadow-md"
                            style={{
                                background: t(theme, 'surface-1'),
                                border: `1px solid ${t(theme, 'border')}`,
                                boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.02)',
                                animationDelay: `${idx * 150}ms`
                            }}
                        >
                            <div
                                className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-500"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    color: t(theme, 'text-primary'),
                                }}
                            >
                                <cat.icon size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[15px] font-bold tracking-tight mb-0.5" style={{ color: t(theme, 'text-primary') }}>
                                    {cat.label} Adhkar
                                </h3>
                                <p className="text-[11px] font-medium tracking-tight opacity-40 uppercase tracking-widest font-black" style={{ color: t(theme, 'text-muted') }}>
                                    {cat.subtitle}
                                </p>
                            </div>
                            <IconChevronRight size={18} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}

                    {/* Constant Reminder Quote */}
                    <div
                        className="mt-12 mb-8 p-10 rounded-[3rem] text-center relative overflow-hidden animate-fade-in"
                        style={{
                            background: t(theme, 'surface-1'),
                            border: `1px solid ${t(theme, 'border')}`,
                            animationDelay: '600ms'
                        }}
                    >
                        <p className="text-xl md:text-2xl opacity-90 leading-relaxed italic max-w-sm mx-auto"
                            style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>
                            "Verily, in the remembrance of Allah do hearts find rest."
                        </p>
                        <p className="text-[10px] mt-6 opacity-40 font-bold tracking-[0.1em] transition-all">
                            Surah Ar-Ra'd 13:28
                        </p>
                    </div>
                </main>
            </div>
        )
    }


    // ─── DUALIST: Vertical Numbered List (matching LibraryPage dualist) ───
    if (viewMode === 'dualist') {
        return (
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <Header />
                <main className="px-6 flex flex-col gap-4 mt-4 animate-fade-in">
                    {listDuas.length === 0 ? (
                        <div className="text-center py-20 opacity-30">No duas found</div>
                    ) : (
                        listDuas.map((dua, i) => (
                            <button
                                key={dua.id}
                                onClick={() => {
                                    const globalIndex = swipeDuas.findIndex(sd => sd.id === dua.id)
                                    setSelectedIndex(globalIndex !== -1 ? globalIndex : i)
                                    setViewMode('swipe')
                                }}
                                className="group flex gap-5 items-center p-5 rounded-[2.25rem] text-left transition-all active:scale-[0.98] hover:shadow-lg"
                                style={{ background: t(theme, 'surface-1'), border: `1px solid ${t(theme, 'border')}` }}
                            >
                                <div
                                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-sm relative overflow-hidden"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'accent') }}
                                >
                                    <div className="absolute inset-0 opacity-10" style={{ background: t(theme, 'accent') }} />
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[15px] font-medium text-primary truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                                        {activeCategory ? `${toTitleCase(activeCategory)} ${i + 1}` : (toTitleCase(dua.reference) || 'Supplication')}
                                    </h4>
                                </div>
                            </button>
                        ))
                    )}
                </main>
            </div>
        )
    }

    // ─── SWIPE: Full screen gallery (matching LibraryPage swipe) ───
    if (viewMode === 'swipe') {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col animate-modal-slide-up" style={{ background: t(theme, 'surface-0') }}>
                <Header />

                {/* Swiper Content */}
                <div
                    ref={(el) => {
                        scrollRef.current = el;
                        if (el && viewMode === 'swipe' && el.scrollLeft === 0 && selectedIndex > 0) {
                            el.scrollLeft = selectedIndex * el.offsetWidth;
                        }
                    }}
                    onScroll={handleSwipeScroll}
                    className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                >
                    {swipeDuas.map((dua, i) => (
                        <div key={dua.id} className="w-full flex-shrink-0 snap-center flex flex-col p-6 overflow-y-auto h-full">
                            <DuaCard
                                dua={dua}
                                label={toTitleCase(dua.category) + ' Adhkar'}
                                type="dua"
                                isCountingMode={false}
                                hideAudio={true}
                                hideCounter={false}
                            />
                        </div>
                    ))}
                </div>

                <div className="pb-8 pt-4 text-center opacity-30 text-[10px] font-black tracking-widest uppercase">
                    Swipe left or right
                </div>
            </div>
        )
    }

    return null
}
