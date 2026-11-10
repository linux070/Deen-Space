import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import DuaCard from '../components/DuaCard'
import { IconChevronLeft, IconChevronRight, IconPrayerMat, IconSunrise, IconSunset, IconBeads } from '../components/Icons'
import PageHeader from '../components/PageHeader'
import MiniTasbih from '../components/MiniTasbih'
import { toTitleCase } from '../utils/text'

// ─── Landing categories (top-level) ───
const CATEGORIES = [
    { key: 'solah', label: 'Solah', subtitle: 'Complete Prayer Guide', icon: IconPrayerMat, badge: 'Guide' },
    { key: 'morning', label: 'Morning', subtitle: 'Adhkar As-Sabah', icon: IconSunrise, badge: '6 Adhkar' },
    { key: 'evening', label: 'Evening', subtitle: 'Adhkar Al-Masa', icon: IconSunset, badge: '4 Adhkar' },
    { key: 'remembrance', label: 'Remembrance of Allah', subtitle: 'General Dhikr', icon: IconBeads, badge: '25 Dhikr' },
]

// ─── Unique dua titles ───
const DUA_TITLES = {
    // Salah (In Prayer)
    'salah-adhan-1': 'Responding to the Call',
    'salah-adhan-2': 'Dua After Adhan',
    'salah-opening': 'The Opening Glorification',
    'salah-motion-1': 'Glorification in Ruku',
    'salah-motion-2': 'Praise in Rising',
    'salah-motion-3': 'Praise in Standing',
    'salah-motion-4': 'Glorification in Sujud',
    'salah-motion-5': 'Plea for Forgiveness',
    'salah-motion-6': 'The Final Testimony',
    'salah-motion-7': 'The Final Refuge',
    // After Salah
    'salah-1': 'Seeking Forgiveness',
    'salah-2': 'The Invocation of Peace',
    'salah-3': 'The Glorification',
    'salah-4': 'The Praise',
    'salah-5': 'The Greatness',
    'salah-6': 'The Throne Verse',
    'salah-7': 'Help in Worship',
    // Morning
    'morning-1': 'The Dominion of Morning',
    'morning-2': 'Supplication of the Morning',
    'morning-3': 'The Decisive Glorification',
    'morning-4': 'The Shield of Protection',
    'morning-5': 'The Shelter of Protection',
    'morning-6': 'Wellness and Pardon',
    // Evening
    'evening-1': 'The Dominion of Evening',
    'evening-2': 'Supplication of the Evening',
    'evening-3': 'The Knower of Unseen',
    'evening-4': 'The Shelter of Mercy',
    // Remembrance
    'remembrance-1': 'Glorifying Allah',
    'remembrance-2': 'Strength in Allah',
    'remembrance-3': 'Declaration of Faith',
    'remembrance-4': 'Praising Allah',
    'remembrance-5': 'Seeking Forgiveness',
    'remembrance-6': 'Glory and Praise',
    'remembrance-7': 'Master of Forgiveness',
    'remembrance-8': 'Relief in Mercy',
    'remembrance-9': 'Help in Remembrance',
    'remembrance-10': 'Glorifying the Great',
    'remembrance-11': 'Pleasure in Faith',
    'remembrance-12': 'Sufficiency in Allah',
    'remembrance-13': 'Repentance to Allah',
    'remembrance-14': 'Prophetic Blessings',
    'remembrance-15': 'Persistence in Prayer',
    'remembrance-16': 'Knowledge & Provision',
    'remembrance-17': 'Guidance & Piety',
    'remembrance-18': 'Direction of Hearts',
    'remembrance-19': 'Protection from Loss',
    'remembrance-20': 'Freedom from Laziness',
    'remembrance-21': 'Complete Forgiveness',
    'remembrance-22': 'Forgiveness & Return',
    'remembrance-23': 'Trust in Allah',
    'remembrance-24': 'Firmness of Heart',
    'remembrance-25': 'Wellness & Pardon',
}

// ─── Solah sub-sections (Before / In / After) ───
const SOLAH_SECTIONS = [
    { key: 'before-solah', label: 'Before Solah', ids: ['salah-adhan-1', 'salah-adhan-2'] },
    { key: 'in-solah', label: 'In Solah', ids: ['salah-opening', 'salah-motion-1', 'salah-motion-2', 'salah-motion-3', 'salah-motion-4', 'salah-motion-5', 'salah-motion-6', 'salah-motion-7'] },
    { key: 'after-solah', label: 'After Solah', ids: ['salah-1', 'salah-2', 'salah-3', 'salah-4', 'salah-5', 'salah-6', 'salah-7'] },
]

export default function DailyPage({ duas }) {
    const { theme, setLastDuaPath } = useSettings()
    const navigate = useNavigate()
    const { category } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()

    // View: landing → sublist → swipe
    const [viewMode, setViewMode] = useState(() => {
        const v = searchParams.get('view')
        if (v && ['landing', 'sublist', 'swipe'].includes(v)) return v
        return category ? 'sublist' : 'landing'
    })
    const [activeCategory, setActiveCategory] = useState(() => {
        const cat = category || searchParams.get('cat')
        const validCategories = ['solah', 'morning', 'evening', 'remembrance']
        const mapped = (cat === 'salah' || cat === 'after-salah') ? 'solah' : cat
        return validCategories.includes(mapped) ? mapped : null
    })
    const [selectedIndex, setSelectedIndex] = useState(() => {
        const idx = parseInt(searchParams.get('idx'))
        return isNaN(idx) ? 0 : idx
    })
    const [miniTasbihCount, setMiniTasbihCount] = useState(0)

    // Robust state sync
    useEffect(() => {
        if (viewMode !== 'landing' && !activeCategory) {
            setViewMode('landing')
        }
    }, [viewMode, activeCategory])

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [viewMode, activeCategory])

    // Sync search params
    useEffect(() => {
        const params = new URLSearchParams()
        if (viewMode !== 'landing') {
            params.set('view', viewMode)
            if (activeCategory) params.set('cat', activeCategory)
            if (viewMode === 'swipe') params.set('idx', selectedIndex)
        }
        setSearchParams(params, { replace: true })
    }, [viewMode, activeCategory, selectedIndex, setSearchParams])

    const scrollRef = useRef(null)
    const skippingFirstScroll = useRef(false)

    // Sync from URL
    useEffect(() => {
        if (category) {
            const mapped = (category === 'salah' || category === 'after-salah') ? 'solah' : category
            setActiveCategory(mapped)
            setViewMode('sublist')
            localStorage.setItem('last-daily-category', category)
            setLastDuaPath(`/daily/${category}${window.location.search}`)
        } else {
            setLastDuaPath('/daily')
        }
    }, [category, setLastDuaPath])

    // ─── Compute duas for the active category (used in sub-list and swiper) ───
    const categoryDuas = useMemo(() => {
        if (!activeCategory) return []

        if (activeCategory === 'solah') {
            const salahOrder = ['salah-adhan-1', 'salah-adhan-2', 'salah-opening', 'salah-motion-1', 'salah-motion-2', 'salah-motion-3', 'salah-motion-4', 'salah-motion-5', 'salah-motion-6', 'salah-motion-7']
            const afterIds = ['salah-1', 'salah-2', 'salah-3', 'salah-4', 'salah-5', 'salah-6', 'salah-7']
            const allIds = [...salahOrder, ...afterIds]
            return allIds.map(id => duas.find(d => d.id === id)).filter(Boolean)
        }

        return [...duas]
            .filter(d => d.category === activeCategory)
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    }, [duas, activeCategory])

    // Scroll handling
    const handleSwipeScroll = (e) => {
        if (skippingFirstScroll.current && e.target.scrollLeft === 0 && selectedIndex > 0) return
        skippingFirstScroll.current = false
        const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth)
        if (idx !== selectedIndex) setSelectedIndex(idx)
    }

    useEffect(() => { setMiniTasbihCount(0) }, [selectedIndex])

    const getDuaTitle = (dua) => {
        if (!dua) return ''
        return DUA_TITLES[dua.id] || (dua.transliteration
            ? dua.transliteration.split(' ').slice(0, 5).join(' ').replace(/[,.;]$/, '') + '...'
            : 'Supplication')
    }

    const goBack = () => {
        if (viewMode === 'swipe') {
            setViewMode('sublist')
            return
        }
        if (viewMode === 'sublist') {
            setViewMode('landing')
            setActiveCategory(null)
            navigate('/daily', { replace: true })
            return
        }
        if (viewMode === 'landing') {
            navigate('/dua')
            return
        }
    }

    const Header = () => {
        let title = 'Daily Guidance'
        let subtitle = 'Morning & evening adhkar, solah & remembrance'
        if (viewMode === 'sublist') {
            const cat = CATEGORIES.find(c => c.key === activeCategory)
            title = cat?.label || toTitleCase(activeCategory)
            subtitle = cat?.subtitle || 'Daily Supplications'
        } else if (viewMode === 'swipe') {
            title = getDuaTitle(categoryDuas[selectedIndex])
            subtitle = toTitleCase(activeCategory)
        }

        return (
            <div className={`sticky top-0 z-20 ${viewMode === 'landing' ? 'pb-2' : 'pb-1'}`} style={{ background: t(theme, 'surface-0') }}>
                <PageHeader
                    title={title}
                    onBack={goBack}
                    padding="px-4 sm:px-6 pt-6 pb-3"
                    sticky={false}
                />
            </div>
        )
    }

    const renderContent = () => {
        if (viewMode === 'landing') {
            return (
                <main className="px-4 sm:px-6 flex flex-col pb-16 mt-2 animate-fade-in max-w-3xl mx-auto w-full">
                    {/* Section Header */}
                    <h2
                        className="text-[11px] font-bold uppercase tracking-[0.16em] px-2 mb-2 select-none"
                        style={{ color: t(theme, 'text-secondary') }}
                    >
                        Daily Adhkar & Prayer Guide
                    </h2>

                    {/* Continuous Inset Container with Hairline Dividers & Elevated Depth */}
                    <div
                        className="rounded-2xl border overflow-hidden transition-all duration-200"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                            boxShadow: theme === 'dark' ? 'none' : '0 2px 14px rgba(0,0,0,0.025)',
                        }}
                    >
                        {CATEGORIES.map((cat, idx) => {
                            const isLast = idx === CATEGORIES.length - 1
                            const Icon = cat.icon
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(cat.key)
                                        setViewMode('sublist')
                                    }}
                                    className="group w-full flex items-center justify-between gap-3 px-3.5 py-3.5 sm:px-5 sm:py-4 text-left transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02] active:bg-black/[0.04] active:scale-[0.995] cursor-pointer"
                                    style={{
                                        borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                    }}
                                >
                                    {/* Left: Icon Squircle */}
                                    <div
                                        className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-105 shadow-xs"
                                        style={{
                                            background: t(theme, 'accent-soft'),
                                            color: t(theme, 'accent'),
                                            border: `1px solid ${t(theme, 'border')}`,
                                        }}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    {/* Middle: Title with Inline Metadata Chip + Unrestricted Subtitle */}
                                    <div className="min-w-0 flex-1 flex flex-col justify-center pr-1">
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="text-[14.5px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                style={{ color: t(theme, 'text-primary') }}
                                            >
                                                {cat.label}
                                            </h3>
                                            <span
                                                className="text-[9.5px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-md leading-none whitespace-nowrap transition-colors flex-shrink-0"
                                                style={{
                                                    background: t(theme, 'surface-2'),
                                                    color: t(theme, 'accent'),
                                                    border: `1px solid ${t(theme, 'border')}`,
                                                }}
                                            >
                                                {cat.badge}
                                            </span>
                                        </div>
                                        <p
                                            className="text-[12px] sm:text-[12.5px] font-normal leading-normal mt-0.5 line-clamp-1"
                                            style={{ color: t(theme, 'text-secondary') }}
                                        >
                                            {cat.subtitle}
                                        </p>
                                    </div>

                                    {/* Right: Subtle Chevron */}
                                    <IconChevronRight
                                        size={18}
                                        className="text-stone-400/60 dark:text-stone-500/60 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                                    />
                                </button>
                            )
                        })}
                    </div>

                    <div
                        className="mt-10 mb-8 p-8 sm:p-10 rounded-2xl text-center relative overflow-hidden animate-fade-in border"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        <p
                            className="text-lg sm:text-xl opacity-90 leading-relaxed italic max-w-sm mx-auto"
                            style={{
                                color: t(theme, 'text-primary'),
                                fontFamily: 'var(--font-serif-body)',
                            }}
                        >
                            &ldquo;Verily, in the remembrance of Allah do hearts find rest.&rdquo;
                        </p>
                        <p className="text-[11px] mt-4 font-bold tracking-[0.15em] uppercase" style={{ color: t(theme, 'text-secondary') }}>
                            Surah Ar-Ra&apos;d 13:28
                        </p>
                    </div>
                </main>
            )
        }

        if (viewMode === 'sublist') {
            return activeCategory === 'solah' ? (
                <main className="px-4 sm:px-6 flex flex-col pb-16 mt-2 animate-fade-in max-w-3xl mx-auto w-full">
                    {SOLAH_SECTIONS.map((section) => {
                        const sectionDuas = section.ids.map(id => categoryDuas.find(d => d.id === id)).filter(Boolean)
                        if (sectionDuas.length === 0) return null
                        return (
                            <div key={section.key} className="mb-6">
                                <h4
                                    className="text-[11px] font-bold tracking-[0.16em] uppercase px-2 mb-2 select-none"
                                    style={{ color: t(theme, 'text-secondary') }}
                                >
                                    {section.label}
                                </h4>
                                <div
                                    className="rounded-2xl border overflow-hidden transition-all duration-200"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        boxShadow: theme === 'dark' ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                                    }}
                                >
                                    {sectionDuas.map((dua, dIdx) => {
                                        const idx = categoryDuas.findIndex(d => d.id === dua.id)
                                        const isLast = dIdx === sectionDuas.length - 1
                                        const previewText = dua.transliteration || (dua.translation && dua.translation.en) || (typeof dua.translation === 'string' ? dua.translation : '')

                                        return (
                                            <button
                                                key={dua.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedIndex(idx !== -1 ? idx : 0)
                                                    skippingFirstScroll.current = true
                                                    setViewMode('swipe')
                                                }}
                                                className="group w-full flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] active:bg-black/[0.04] cursor-pointer"
                                                style={{
                                                    borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                                }}
                                            >
                                                <div className="flex-1 min-w-0 pr-3">
                                                    <h4
                                                        className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                        style={{ color: t(theme, 'text-primary') }}
                                                    >
                                                        {getDuaTitle(dua)}
                                                    </h4>
                                                    {previewText && (
                                                        <p
                                                            className="text-[12px] truncate leading-tight mt-1 italic font-serif"
                                                            style={{
                                                                color: t(theme, 'text-secondary'),
                                                                fontFamily: 'var(--font-serif-body)',
                                                            }}
                                                        >
                                                            {previewText}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {dua.repeat > 1 && (
                                                        <span
                                                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md leading-none"
                                                            style={{
                                                                background: t(theme, 'surface-2'),
                                                                color: t(theme, 'accent'),
                                                                border: `1px solid ${t(theme, 'border')}`,
                                                            }}
                                                        >
                                                            {dua.repeat}×
                                                        </span>
                                                    )}
                                                    <IconChevronRight
                                                        size={16}
                                                        className="text-stone-400/60 dark:text-stone-500/60 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all"
                                                    />
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </main>
            ) : (
                <main className="px-4 sm:px-6 flex flex-col pb-16 mt-2 animate-fade-in max-w-3xl mx-auto w-full">
                    {categoryDuas.length === 0 ? (
                        <div className="text-center py-20 opacity-30 text-[11px] font-bold tracking-widest uppercase">
                            No duas found
                        </div>
                    ) : (
                        <div
                            className="rounded-2xl border overflow-hidden transition-all duration-200"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                                boxShadow: theme === 'dark' ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                            }}
                        >
                            {categoryDuas.map((dua, dIdx) => {
                                const isLast = dIdx === categoryDuas.length - 1
                                const previewText = dua.transliteration || (dua.translation && dua.translation.en) || (typeof dua.translation === 'string' ? dua.translation : '')

                                return (
                                    <button
                                        key={dua.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedIndex(dIdx)
                                            skippingFirstScroll.current = true
                                            setViewMode('swipe')
                                        }}
                                        className="group w-full flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] active:bg-black/[0.04] cursor-pointer"
                                        style={{
                                            borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                        }}
                                    >
                                        <div className="flex-1 min-w-0 pr-3">
                                            <h4
                                                className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                style={{ color: t(theme, 'text-primary') }}
                                            >
                                                {getDuaTitle(dua)}
                                            </h4>
                                            {previewText && (
                                                <p
                                                    className="text-[12px] truncate leading-tight mt-1 italic font-serif"
                                                    style={{
                                                        color: t(theme, 'text-secondary'),
                                                        fontFamily: 'var(--font-serif-body)',
                                                    }}
                                                >
                                                    {previewText}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {dua.repeat > 1 && (
                                                <span
                                                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md leading-none"
                                                    style={{
                                                        background: t(theme, 'surface-2'),
                                                        color: t(theme, 'accent'),
                                                        border: `1px solid ${t(theme, 'border')}`,
                                                    }}
                                                >
                                                    {dua.repeat}×
                                                </span>
                                            )}
                                            <IconChevronRight
                                                size={16}
                                                className="text-stone-400/60 dark:text-stone-500/60 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all"
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </main>
            )
        }

        if (viewMode === 'swipe') {
            const currentDua = categoryDuas[selectedIndex]
            return (
                <div className="fixed inset-0 z-[100] flex flex-col animate-modal-slide-up" style={{ background: t(theme, 'surface-0') }}>
                    <div className="flex items-center justify-between px-6" style={{ background: t(theme, 'surface-0'), paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)', paddingBottom: '1.5rem' }}>
                        <div className="flex items-center gap-3">
                            <button onClick={goBack} className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90" style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                <IconChevronLeft size={22} />
                            </button>
                            <span className="text-[15px] font-normal tracking-tight truncate max-w-[240px]" style={{ color: t(theme, 'text-primary') }}>
                                {getDuaTitle(currentDua)}
                            </span>
                        </div>
                    </div>
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
                        {categoryDuas.map((dua) => (
                            <div key={dua.id} className="w-full flex-shrink-0 snap-center flex flex-col p-6 overflow-y-auto h-full pb-28">
                                <DuaCard
                                    dua={dua}
                                    type="dua"
                                    hideAudio={true}
                                    hideCounter={dua.category === 'salah'}
                                    hideRepeat={dua.category === 'salah'}
                                    hideTags={true}
                                />
                            </div>
                        ))}
                    </div>
                    {categoryDuas[selectedIndex]?.repeat > 1 && categoryDuas[selectedIndex]?.category !== 'salah' && (
                        <MiniTasbih
                            target={categoryDuas[selectedIndex].repeat}
                            count={miniTasbihCount}
                            onCountChange={setMiniTasbihCount}
                        />
                    )}
                </div>
            )
        }
        return null
    }

    return (
        <div className="pb-32 min-h-screen" style={{ background: t(theme, 'surface-0'), paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            {viewMode !== 'swipe' && <Header />}
            {renderContent()}
        </div>
    )
}
