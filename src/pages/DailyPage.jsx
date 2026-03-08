import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import DuaCard from '../components/DuaCard'
import { IconChevronLeft, IconChevronRight, IconSun, IconMoon, IconMosque } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import MiniTasbih from '../components/MiniTasbih'
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
    const [miniTasbihCount, setMiniTasbihCount] = useState(0)

    const scrollRef = useRef(null)
    const skippingFirstScroll = useRef(false)

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
        // Prevent reset to 0 during initial mount-scroll
        if (skippingFirstScroll.current && e.target.scrollLeft === 0 && selectedIndex > 0) return
        skippingFirstScroll.current = false

        const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth)
        if (idx !== selectedIndex) setSelectedIndex(idx)
    }

    // Reset Tasbih count when swiping to a new dua
    useEffect(() => {
        setMiniTasbihCount(0)
    }, [selectedIndex])

    // BACK NAVIGATION
    const goBack = () => {
        if (viewMode === 'swipe') {
            // If the user came from a specific category list (dualist mode),
            // go back to that list instead of jumping to landing.
            if (activeCategory && category) {
                setViewMode('dualist')
                return
            }
            setViewMode('landing')
            setActiveCategory(null)
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
        const title = viewMode === 'landing' ? 'Daily Adhkar' : toTitleCase(activeCategory)

        return (
            <div className={`sticky top-0 z-20 ${viewMode === 'landing' ? 'pb-2' : 'pb-1'}`} style={{ background: t(theme, 'surface-0') }}>
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

    const getSwipeTitle = () => {
        const currentDua = swipeDuas[selectedIndex]
        if (!currentDua) return toTitleCase(activeCategory)
        
        // Calculate the index relative to the category for clearer pagination
        const catDuas = swipeDuas.filter(d => d.category === currentDua.category)
        const catIdx = catDuas.findIndex(d => d.id === currentDua.id)
        
        return `${toTitleCase(currentDua.category)} ${catIdx + 1} / ${catDuas.length}`
    }

    // ─── LANDING: List of categories ───
    if (viewMode === 'landing') {
        const isDark = theme === 'dark'
        return (
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <Header />
                <main className="px-6 flex flex-col gap-2 mt-8 animate-fade-in">
                    {CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat.key}
                            onClick={() => {
                                setActiveCategory(cat.key)
                                // Jump directly to the first dua of this category in the swipe list
                                const firstIndex = swipeDuas.findIndex(sd => sd.category === cat.key)
                                setSelectedIndex(firstIndex !== -1 ? firstIndex : 0)
                                setViewMode('swipe')
                            }}
                            className="group flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all active:scale-[0.98] hover:shadow-md"
                            style={{
                                background: t(theme, 'surface-1'),
                                border: `1px solid ${t(theme, 'border')}`,
                                boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                                animationDelay: `${idx * 150}ms`
                            }}
                        >
                            <div
                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-500 relative overflow-hidden"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    color: t(theme, 'text-primary'),
                                }}
                            >
                                <div className="absolute inset-0 opacity-[0.08]" style={{ background: t(theme, 'text-primary') }} />
                                <cat.icon size={20} className="relative z-10" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[14px] font-semibold tracking-tight truncate" style={{ color: t(theme, 'text-primary') }}>
                                    {cat.label}
                                </h3>
                                <p className="text-[10px] font-bold tracking-[0.05em] opacity-40 mt-0.5" style={{ color: t(theme, 'text-muted') }}>
                                    {cat.subtitle}
                                </p>
                            </div>
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
                <main className="px-6 flex flex-col gap-1.5 mt-2 animate-fade-in">
                    {listDuas.length === 0 ? (
                        <div className="text-center py-20 opacity-30 text-[11px] font-black tracking-widest">No duas found</div>
                    ) : (
                        listDuas.map((dua, i) => (
                            <button
                                key={dua.id}
                                onClick={() => {
                                    const globalIndex = swipeDuas.findIndex(sd => sd.id === dua.id)
                                    setSelectedIndex(globalIndex !== -1 ? globalIndex : i)
                                    setViewMode('swipe')
                                }}
                                className="group flex gap-3.5 items-center p-3 rounded-2xl text-left transition-all active:scale-[0.98] hover:shadow-lg"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                    boxShadow: theme === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.01)'
                                }}
                            >
                                <div
                                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-semibold text-xs relative overflow-hidden"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}
                                >
                                    <div className="absolute inset-0 opacity-10" style={{ background: t(theme, 'text-primary') }} />
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[14px] font-medium text-primary truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
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
        const currentDua = swipeDuas[selectedIndex]
        return (
            <div className="fixed inset-0 z-[100] flex flex-col animate-modal-slide-up" style={{ background: t(theme, 'surface-0') }}>
                <div
                    className="flex items-center justify-between px-6"
                    style={{
                        background: t(theme, 'surface-0'),
                        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
                        paddingBottom: '1.5rem'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goBack}
                            className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90"
                            style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}
                        >
                            <IconChevronLeft size={22} />
                        </button>
                        <span className="text-[15px] font-normal tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                            {getSwipeTitle()}
                        </span>
                    </div>
                </div>

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
                                type="dua"
                                hideAudio={true}
                                hideCounter={false}
                                hideTags={true}
                            />
                        </div>
                    ))}
                </div>

                {/* Mounted mini tasbeeh whenever a Dua is to be read a certain amount of times */}
                {swipeDuas[selectedIndex]?.repeat > 1 && (
                    <MiniTasbih
                        target={swipeDuas[selectedIndex].repeat}
                        count={miniTasbihCount}
                        onCountChange={setMiniTasbihCount}
                    />
                )}


            </div>
        )
    }

    return null
}
