import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconChevronLeft,
    IconChevronRight,
    IconSearch,
    IconCompass,
    IconHeart,
    IconDua,
    IconTasbih,
    IconGrid,
    IconClock,
    IconStar,
    IconInfo
} from '../components/Icons'
import DuaCard from '../components/DuaCard'
import PageHeader from '../components/PageHeader'
import MiniTasbih from '../components/MiniTasbih'
import { toTitleCase } from '../utils/text'

export default function LibraryPage({ duas, embedded = false, initialSection = null }) {
    const { theme } = useSettings()
    const navigate = useNavigate()

    // View state
    const [viewMode, setViewMode] = useState(initialSection ? 'dualist' : 'landing')
    const [activeSection, setActiveSection] = useState(initialSection)
    const [activeSubSection, setActiveSubSection] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [search, setSearch] = useState('')
    const [miniTasbihCount, setMiniTasbihCount] = useState(0)

    const scrollRef = useRef(null)
    const skippingFirstScroll = useRef(false)

    // TOP LEVEL SECTIONS
    const SECTIONS = [
        { id: 'general', title: 'General', subtitle: 'Prophetic Prayers', icon: IconDua },
        { id: 'emotions', title: 'Emotions', subtitle: 'Spiritual States', icon: IconHeart },
        { id: 'situational', title: 'Situational', subtitle: 'Life Events', icon: IconCompass },
    ]

    // SUB SECTIONS for Situational/Emotions
    const SUB_SECTIONS = useMemo(() => {
        if (!activeSection) return []
        if (activeSection === 'situational') {
            return [
                { id: 'travel', title: 'Travel', icon: IconClock },
                { id: 'illness', title: 'Illness', icon: IconInfo },
                { id: 'istikhara', title: 'Istikhara', icon: IconStar },
            ]
        }
        if (activeSection === 'emotions') {
            return [
                { id: 'anxiety', title: 'Anxiety', icon: IconHeart },
                { id: 'sadness', title: 'Sadness', icon: IconHeart },
                { id: 'fear', title: 'Fear', icon: IconHeart },
                { id: 'anger', title: 'Anger', icon: IconHeart },
                { id: 'gratitude', title: 'Gratitude', icon: IconHeart },
                { id: 'loneliness', title: 'Loneliness', icon: IconHeart },
                { id: 'worry', title: 'Worry', icon: IconHeart },
                { id: 'trust', title: 'Trust in Allah', icon: IconHeart },
            ]
        }
        if (activeSection === 'general') {
            return [
                { id: 'prophetic', title: 'Prophetic Duas', icon: IconStar },
                { id: 'waking', title: 'Waking Up', icon: IconCompass },
                { id: 'sleeping', title: 'Sleeping', icon: IconHeart },
                { id: 'eating', title: 'Eating', icon: IconCompass },
                { id: 'toilet', title: 'Restroom', icon: IconInfo },
                { id: 'home', title: 'Leaving / Entering Home', icon: IconCompass },
                { id: 'dressing', title: 'Dressing', icon: IconHeart },
            ]
        }
        return []
    }, [activeSection])

    // Filtered duas based on active section/subsection and search
    const filteredDuas = useMemo(() => {
        let result = duas
        if (activeSubSection) {
            result = result.filter(d => d.category === activeSubSection)
        } else if (activeSection) {
            if (['situational', 'emotions', 'general'].includes(activeSection)) {
                let subIds = []
                if (activeSection === 'situational') subIds = ['travel', 'illness', 'istikhara']
                else if (activeSection === 'emotions') subIds = ['anxiety', 'sadness', 'fear', 'anger', 'gratitude', 'loneliness', 'worry', 'trust']
                else if (activeSection === 'general') subIds = ['prophetic', 'waking', 'sleeping', 'eating', 'toilet', 'home', 'dressing']
                result = result.filter(d => subIds.includes(d.category))
            } else {
                result = result.filter(d => d.category === activeSection)
            }
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(d =>
                (d.translation && d.translation.toLowerCase().includes(q)) ||
                (d.transliteration && d.transliteration.toLowerCase().includes(q)) ||
                (d.arabic && d.arabic.includes(search))
            )
        }
        return result
    }, [duas, activeSection, activeSubSection, search])

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
        if (search) {
            setSearch('')
            return
        }
        if (viewMode === 'swipe') {
            setViewMode('dualist')
            return
        }

        // If we entered deep (initialSection provided) and are at the root of that deep section,
        // navigate back to the Main Dua Application Page
        if (initialSection && activeSection === initialSection) {
            const isAtDeepRoot =
                (viewMode === 'sublist') ||
                (viewMode === 'dualist' && !['situational', 'emotions', 'general'].includes(activeSection))

            if (isAtDeepRoot) {
                navigate('/dua')
                return
            }
        }

        if (viewMode === 'dualist') {
            if (['situational', 'emotions', 'general'].includes(activeSection)) {
                setViewMode('sublist')
            } else {
                setViewMode('landing')
                setActiveSection(null)
            }
            return
        }
        if (viewMode === 'sublist') {
            setViewMode('landing')
            setActiveSection(null)
            return
        }
        if (viewMode === 'landing') {
            navigate('/dua')
            return
        }
    }


    const getPageTitle = () => {
        if (viewMode === 'landing') return 'Library'
        if (viewMode === 'swipe') {
            if (activeSection === 'rabbana') return `Robbana Dua ${selectedIndex + 1} / ${filteredDuas.length}`
            if (activeSection === 'salawat') return `Prophetic Salawat ${selectedIndex + 1} / ${filteredDuas.length}`
        }
        if (activeSection === 'rabbana') return '40 Robbana'
        if (activeSection === 'ramadan') return 'Ramadan Special'
        if (viewMode === 'sublist') return activeSection.charAt(0).toUpperCase() + activeSection.slice(1)
        if (activeSubSection) return activeSubSection.charAt(0).toUpperCase() + activeSubSection.slice(1)
        return activeSection?.charAt(0).toUpperCase() + activeSection?.slice(1) || 'Duas'
    }

    const Header = () => {
        const title = getPageTitle()
        const subtitle = 'Collections of Supplication'

        return (
            <div className="sticky top-0 z-20 pb-6" style={{ background: t(theme, 'surface-0') }}>
                <PageHeader
                    title={title}
                    subtitle={subtitle}
                    onBack={goBack}
                    padding="px-6 pt-10 pb-6"
                    sticky={false}
                    titleSerif={false}
                    titleWeight={400}
                    subtitleCase="title"
                />

                {(viewMode === 'landing' || (viewMode === 'dualist' && !activeSection)) && (
                    <div className="px-6 mt-10 relative animate-fade-in transition-all">
                        <section className="relative group">
                            <div
                                className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 pointer-events-none"
                                style={{ boxShadow: `0 0 0 2px ${t(theme, 'accent')}20` }}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <IconSearch size={18} className="opacity-50 group-focus-within:opacity-100 transition-opacity" style={{ color: t(theme, 'accent') }} />
                            </div>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    if (e.target.value && viewMode === 'landing') setViewMode('dualist')
                                }}
                                placeholder="Search translations or Arabic..."
                                className="w-full py-4 pl-12 pr-6 rounded-2xl text-[14px] font-medium outline-none transition-all border shadow-sm"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    color: t(theme, 'text-primary'),
                                    borderColor: t(theme, 'border'),
                                }}
                            />
                        </section>
                    </div>
                )}
            </div>
        )
    }


    // LANDING: Grid of sections
    if (viewMode === 'landing') {
        const isDark = theme === 'dark'
        return (
            <div className="pb-32 min-h-screen">
                {!embedded && <Header />}
                <main className="px-6 flex flex-col gap-4 mt-6 animate-fade-in">
                    {SECTIONS.map((s, idx) => {
                        const Icon = s.icon
                        return (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setActiveSection(s.id)
                                    setViewMode(['situational', 'emotions', 'general'].includes(s.id) ? 'sublist' : 'dualist')
                                }}
                                className="group flex items-center gap-5 p-5 rounded-[2.25rem] text-left transition-all active:scale-[0.98] hover:shadow-lg"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                    boxShadow: isDark ? 'none' : '0 4px 15px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-sm relative overflow-hidden"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                    <div className="absolute inset-0 opacity-5" style={{ background: t(theme, 'text-primary') }} />
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[15px] font-semibold truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                                        {s.title}
                                    </h4>
                                    <p className="text-[11px] font-medium opacity-50 tracking-tight" style={{ color: t(theme, 'text-muted') }}>
                                        {s.subtitle}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </main>
            </div>
        )
    }

    // SUBLIST: List of sub-categories
    if (viewMode === 'sublist') {
        const isDark = theme === 'dark'
        return (
            <div className="pb-32 min-h-screen">
                {!embedded && <Header />}
                <main className="px-6 flex flex-col gap-3 mt-4 animate-fade-in">
                    {SUB_SECTIONS.map((sub, idx) => {
                        const Icon = sub.icon
                        return (
                            <button
                                key={sub.id}
                                onClick={() => {
                                    setActiveSubSection(sub.id)
                                    setViewMode('dualist')
                                }}
                                className="group flex items-center gap-5 p-5 rounded-[2.25rem] text-left transition-all active:scale-[0.98] hover:shadow-md"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                    boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-sm relative overflow-hidden"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                    <div className="absolute inset-0 opacity-5" style={{ background: t(theme, 'text-primary') }} />
                                    {idx + 1}
                                </div>
                                <h4 className="flex-1 font-semibold text-[15px] tracking-tight" style={{ color: t(theme, 'text-primary') }}>{sub.title}</h4>
                            </button>
                        )
                    })}
                </main>
            </div>
        )
    }

    // DUALIST: Vertical Numbered List
    if (viewMode === 'dualist') {
        return (
            <div className="pb-32 min-h-screen">
                {!embedded && <Header />}
                <main className="px-6 flex flex-col gap-4 mt-4 animate-fade-in">
                    {activeSection === 'rabbana' && (
                        <div className="flex flex-col items-center py-12 opacity-80 animate-fade-in">
                            <p
                                className="text-[1.75rem] md:text-4xl text-center mb-4 whitespace-nowrap overflow-hidden text-ellipsis"
                                style={{ fontFamily: 'var(--script-font)', color: t(theme, 'text-primary'), direction: 'rtl' }}
                            >
                                بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                            </p>
                            <p className="text-[11px] font-medium tracking-wide opacity-40 mt-1 text-center leading-relaxed">
                                In The Name Of Allah, The Most Beneficent, The Most Merciful.
                            </p>
                        </div>
                    )}
                    {filteredDuas.length === 0 ? (
                        <div className="text-center py-20 opacity-30">No duas found</div>
                    ) : (
                        filteredDuas.map((dua, i) => {
                            // Helper to make title more "Institutional"
                            const getTitle = (d) => {
                                if (d.category === 'illness') return 'Dua for Sickness'
                                if (d.category === 'travel') return 'Dua for Travel'
                                if (d.category === 'istikhara') return 'Dua for Istikhara'
                                if (d.category === 'emotions') return `For ${activeSubSection?.charAt(0).toUpperCase()}${activeSubSection?.slice(1)}`
                                if (d.category === 'rabbana') return d.transliteration || 'Supplication'
                                if (d.category === 'salawat') return d.transliteration || 'Supplication'
                                return d.transliteration || 'Supplication'
                            }

                            return (
                                <button
                                    key={dua.id}
                                    onClick={() => {
                                        setSelectedIndex(i)
                                        skippingFirstScroll.current = true
                                        setViewMode('swipe')
                                    }}
                                    className="group flex gap-5 items-center p-5 rounded-[2.25rem] text-left transition-all active:scale-[0.98] hover:shadow-lg"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        border: `1px solid ${t(theme, 'border')}`,
                                        boxShadow: theme === 'dark' ? 'none' : '0 4px 15px rgba(0,0,0,0.02)'
                                    }}
                                >
                                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl font-black text-sm relative overflow-hidden"
                                        style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                        <div className="absolute inset-0 opacity-5" style={{ background: t(theme, 'text-primary') }} />
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[15px] font-semibold text-primary truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                                            {activeSection === 'rabbana' ? `Robbana Dua ${i + 1}` : (toTitleCase(dua.reference) || 'Supplication')}
                                        </h4>
                                        {/* Main text removed as requested, keeping it clean and institutional */}
                                    </div>
                                </button>
                            )
                        })
                    )}
                </main>
            </div>
        )
    }


    // SWIPE: Full screen gallery
    if (viewMode === 'swipe') {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col animate-modal-slide-up" style={{ background: t(theme, 'surface-0') }}>
                <div className="flex items-center justify-between py-6 px-6" style={{ background: t(theme, 'surface-0') }}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setViewMode('dualist')}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all active:scale-90"
                            style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}
                        >
                            <IconChevronLeft size={22} />
                        </button>
                        <span className="text-[15px] font-normal tracking-tight" style={{ color: t(theme, 'text-primary') }}>{getPageTitle()}</span>
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
                    {filteredDuas.map((dua, i) => (
                        <div key={dua.id} className="w-full flex-shrink-0 snap-center flex flex-col p-6 overflow-y-auto">
                            <DuaCard
                                dua={{
                                    ...dua,
                                    reference: toTitleCase(dua.reference) || 'Supplication'
                                }}
                                type="dua"
                                hideAudio={false}
                                hideCounter={['rabbana', 'salawat'].includes(activeSection)}
                            />
                        </div>
                    ))}
                </div>

                {/* Mounted mini tasbeeh whenever a Dua is to be read a certain amount of times */}
                {filteredDuas[selectedIndex]?.repeat > 1 && (
                    <MiniTasbih
                        target={filteredDuas[selectedIndex].repeat}
                        count={miniTasbihCount}
                        onCountChange={setMiniTasbihCount}
                    />
                )}
            </div>
        )
    }

    return null
}
