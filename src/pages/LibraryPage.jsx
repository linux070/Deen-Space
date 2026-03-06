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
    const [viewMode, setViewMode] = useState(() => {
        if (!initialSection) return 'landing'
        if (initialSection === 'custom-prayers') return 'custom'
        if (['situational', 'emotions', 'general', 'rabbana', 'salawat'].includes(initialSection)) return 'dualist'
        return 'swipe'
    })
    const [activeSection, setActiveSection] = useState(initialSection)
    const [activeSubSection, setActiveSubSection] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [search, setSearch] = useState('')
    const [miniTasbihCount, setMiniTasbihCount] = useState(0)
    const [customPrayers, setCustomPrayers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user-custom-prayers') || '[]') } catch { return [] }
    })
    const [showAddModal, setShowAddModal] = useState(false)
    const [newPrayer, setNewPrayer] = useState({ arabic: '', transliteration: '', translation: '', reference: '' })

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
                { id: 'custom-prayers', title: 'Custom Prayers', icon: IconGrid },
            ]
        }
        return []
    }, [activeSection])

    // Filtered duas based on active section/subsection and search
    // We now have two versions: one for the list, one for the swiper
    const listDuas = useMemo(() => {
        let result = duas
        if (activeSubSection) {
            result = result.filter(d => d.category === activeSubSection)
        } else if (activeSection) {
            if (['situational', 'emotions', 'general'].includes(activeSection)) {
                if (activeSection === 'emotions') {
                    result = result.filter(d => d.category === 'emotions')
                } else {
                    let subIds = []
                    if (activeSection === 'situational') subIds = ['travel', 'illness', 'istikhara']
                    else if (activeSection === 'general') subIds = ['prophetic', 'waking', 'sleeping', 'eating', 'toilet', 'home', 'dressing']
                    result = result.filter(d => subIds.includes(d.category))
                }
            } else {
                result = result.filter(d => d.category === activeSection)
            }
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(d =>
                (d.translation && d.translation.en && d.translation.en.toLowerCase().includes(q)) ||
                (d.transliteration && d.transliteration.toLowerCase().includes(q)) ||
                (d.arabic && d.arabic.includes(search)) ||
                (d.category && d.category.toLowerCase().includes(q))
            )
        }
        return result
    }, [duas, activeSection, activeSubSection, search])

    // For the swiper, we want all siblings even if we entered from a sub-section
    const swipeDuas = useMemo(() => {
        if (!activeSection) return listDuas
        if (['situational', 'emotions', 'general'].includes(activeSection)) {
            if (activeSection === 'emotions') {
                return duas.filter(d => d.category === 'emotions')
            }
            let subIds = []
            if (activeSection === 'situational') subIds = ['travel', 'illness', 'istikhara']
            else if (activeSection === 'general') subIds = ['prophetic', 'waking', 'sleeping', 'eating', 'toilet', 'home', 'dressing']

            return duas
                .filter(d => subIds.includes(d.category))
                .sort((a, b) => subIds.indexOf(a.category) - subIds.indexOf(b.category))
        }
        return listDuas
    }, [duas, activeSection, listDuas])

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

    const goBack = () => {
        if (search) {
            setSearch('')
            return
        }

        if (viewMode === 'swipe') {
            setViewMode('dualist')
            return
        }

        if (viewMode === 'dualist') {
            if (activeSubSection) {
                setViewMode('sublist')
                setActiveSubSection(null)
                return
            }
            if (activeSection === 'salawat' || activeSection === 'rabbana' || (initialSection && activeSection === initialSection)) {
                navigate('/dua')
                return
            }
            setViewMode('landing')
            setActiveSection(null)
            return
        }
        if (viewMode === 'sublist') {
            if (initialSection && activeSection === initialSection) {
                navigate('/dua')
                return
            }
            setViewMode('landing')
            setActiveSection(null)
            return
        }
        if (viewMode === 'custom') {
            setViewMode('sublist')
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
            const currentDua = swipeDuas[selectedIndex]
            if (activeSection === 'rabbana') return `Robbana ${selectedIndex + 1}`
            if (activeSection === 'salawat') return `Salawat ${selectedIndex + 1}`
            if (currentDua) {
                return getDuaLabel(currentDua)
            }
        }

        const coreCollections = {
            general: 'General',
            emotions: 'Emotions',
            situational: 'Situational',
            rabbana: '40 Robbana',
            salawat: 'Salawat',
            ramadan: 'Ramadan Special'
        }

        if (activeSection && coreCollections[activeSection]) {
            return coreCollections[activeSection]
        }

        if (activeSubSection) return toTitleCase(activeSubSection)
        return activeSection ? toTitleCase(activeSection) : 'Library'
    }

    // Map specific categories to institutional labels
    const getDuaLabel = (dua) => {
        const cat = dua.category
        if (cat === 'prophetic') return 'Prophetic Dua'
        if (cat === 'waking') return 'Waking Up'
        if (cat === 'sleeping') return 'Before Sleeping'
        if (cat === 'eating') {
            if (dua.arabic_text.includes('الْحَمْدُ لِلَّهِ')) return 'After Eating'
            return 'Before Eating'
        }
        if (cat === 'toilet') {
            if (dua.arabic_text.includes('غُفْرَانَكَ')) return 'Leaving Restroom'
            return 'Entering Restroom'
        }
        if (cat === 'home') {
            if (dua.arabic_text.includes('بِسْمِ اللَّهِ تَوَكَّلْتُ')) return 'Leaving Home'
            return 'Entering Home'
        }
        if (cat === 'dressing') {
            if (dua.arabic_text.includes('الْحَمْدُ لِلَّهِ')) return 'Dressing'
            return 'Undressing'
        }
        if (cat === 'rabbana') return 'Quranic Rabbana'
        if (cat === 'salawat') return 'Prophetic Salawat'
        if (cat === 'illness') return 'Dua for Sickness'
        if (cat === 'travel') return 'Dua for Travel'
        if (cat === 'istikhara') return 'Dua for Istikhara'
        if (cat === 'emotions') {
            const emotionTag = dua.tags?.find(t => ['anxiety', 'sadness', 'fear', 'anger', 'gratitude', 'loneliness', 'worry', 'trust'].includes(t))
            return emotionTag ? `For ${toTitleCase(emotionTag)}` : 'For the Heart'
        }
        if (cat === 'ramadan') {
            if (dua.id === 'ramadan-1') return 'Dua for Opening Fast'
            if (dua.id === 'ramadan-2') return 'Dua for Laylat-al-Qadr'
            if (dua.id === 'ramadan-3') return 'Dua for Goodness'
            if (dua.id === 'ramadan-4') return 'Dua for Steadfastness'
            if (dua.id === 'ramadan-5') return 'Remembrance & Gratitude'
            return 'Ramadan Special'
        }

        return toTitleCase(cat)
    }

    const Header = () => {
        const title = getPageTitle()
        let subtitle = 'Collections of Supplication'

        if (activeSubSection) {
            subtitle = toTitleCase(activeSubSection)
        } else if (activeSection === 'rabbana') {
            subtitle = 'Prophetic Prayers'
        } else if (activeSection === 'emotions') {
            subtitle = 'Spiritual States'
        } else if (activeSection === 'situational') {
            subtitle = 'Life Events'
        }

        return (
            <div className={`sticky top-0 z-20 ${viewMode === 'landing' ? 'pb-12' : 'pb-6'}`} style={{ background: t(theme, 'surface-0') }}>
                <PageHeader
                    title={(viewMode === 'dualist' || viewMode === 'sublist') && !['rabbana', 'salawat', 'general', 'emotions', 'situational'].includes(activeSection) ? '' : title}
                    subtitle={(viewMode === 'dualist' || viewMode === 'sublist' || viewMode === 'swipe') ? null : subtitle}
                    onBack={goBack}
                    padding={viewMode === 'landing' ? "px-6 pt-8 pb-0" : (viewMode === 'dualist' || viewMode === 'sublist') ? "px-6 pt-8 pb-1" : "px-6 pt-10 pb-6"}
                    titleSize={['rabbana', 'salawat', 'general', 'emotions', 'situational'].includes(activeSection) ? "text-xl" : "text-3xl"}
                    titleWeight={['rabbana', 'salawat', 'general', 'emotions', 'situational'].includes(activeSection) ? 300 : (viewMode === 'dualist' ? 300 : 400)}
                    sticky={false}
                    titleSerif={false}
                    subtitleCase="title"
                />

            </div>
        )
    }


    // LANDING: Grid of sections
    if (viewMode === 'landing') {
        const isDark = theme === 'dark'
        return (
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {!embedded && <Header />}
                <main className="px-6 flex flex-col gap-2 mt-8 animate-fade-in">
                    {SECTIONS.map((s, idx) => {
                        const Icon = s.icon
                        return (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setActiveSection(s.id)
                                    if (s.id === 'custom-prayers') {
                                        setViewMode('custom')
                                    } else {
                                        setViewMode('dualist')
                                    }
                                }}
                                className="group flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all active:scale-[0.98] hover:shadow-md"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                    boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)'
                                }}
                            >
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-xs relative overflow-hidden"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                    <div className="absolute inset-0 opacity-[0.08]" style={{ background: t(theme, 'text-primary') }} />
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[14px] font-semibold truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
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
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {!embedded && <Header />}
                <main className="px-6 flex flex-col gap-3 mt-4 animate-fade-in">
                    {SUB_SECTIONS.map((sub, idx) => {
                        const Icon = sub.icon
                        return (
                            <button
                                key={sub.id}
                                onClick={() => {
                                    setActiveSubSection(sub.id)
                                    if (sub.id === 'custom-prayers') {
                                        setViewMode('custom')
                                        return
                                    }
                                    // Enter list mode for the selected sub-category
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
                                <h4 className="flex-1 font-medium text-[15px] tracking-tight" style={{ color: t(theme, 'text-primary') }}>{sub.title}</h4>
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
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {!embedded && <Header />}
                <main className="px-6 flex flex-col gap-1.5 mt-2 animate-fade-in">
                    {listDuas.length === 0 ? (
                        <div className="text-center py-20 opacity-30 text-[11px] font-black uppercase tracking-widest">No duas found</div>
                    ) : (
                        listDuas.map((dua, i) => {
                            // Helper to make title more "Institutional"
                            const getTitle = (d) => {
                                if (activeSection === 'ramadan') {
                                    const ramadanTitles = [
                                        'Dua for Opening Fast',
                                        'Dua for Laylat-al-Qadr',
                                        'Dua for Goodness',
                                        'Dua for Steadfastness',
                                        'Remembrance & Gratitude'
                                    ]
                                    return ramadanTitles[i] || 'Ramadan Dua'
                                }
                                if (d.category === 'illness') return 'Dua for Sickness'
                                if (d.category === 'travel') return 'Dua for Travel'
                                if (d.category === 'istikhara') return 'Dua for Istikhara'
                                if (activeSection === 'emotions') {
                                    const emotionTag = d.tags?.find(t => ['anxiety', 'sadness', 'fear', 'anger', 'gratitude', 'loneliness', 'worry', 'trust'].includes(t))
                                    return emotionTag ? `For ${toTitleCase(emotionTag)}` : 'For the Heart'
                                }
                                if (d.category === 'rabbana') return `Robbana ${i + 1}`
                                if (d.category === 'salawat') return `Salawat ${i + 1}`
                                if (['morning', 'evening', 'after-salah'].includes(d.category)) return `${toTitleCase(d.category)} ${i + 1}`
                                return toTitleCase(d.category) || toTitleCase(d.reference) || 'Supplication'
                            }

                            return (
                                <button
                                    key={dua.id}
                                    onClick={() => {
                                        const globalIndex = swipeDuas.findIndex(sd => sd.id === dua.id)
                                        setSelectedIndex(globalIndex !== -1 ? globalIndex : i)
                                        skippingFirstScroll.current = true
                                        setViewMode('swipe')
                                    }}
                                    className="group flex gap-3.5 items-center p-3 rounded-2xl text-left transition-all active:scale-[0.98] hover:shadow-lg"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        border: `1px solid ${t(theme, 'border')}`,
                                        boxShadow: theme === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.01)'
                                    }}
                                >
                                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-xs relative overflow-hidden"
                                        style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                        <div className="absolute inset-0 opacity-10" style={{ background: t(theme, 'text-primary') }} />
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[14px] font-semibold text-primary truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                                            {getTitle(dua)}
                                        </h4>
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
                    {swipeDuas.map((dua, i) => (
                        <div key={dua?.id || i} className="w-full h-full flex-shrink-0 snap-center flex flex-col p-6 overflow-y-auto">
                            <DuaCard
                                dua={{
                                    ...dua,
                                    reference: toTitleCase(dua.reference) || 'Supplication'
                                }}
                                label={null}
                                type="dua"
                                hideAudio={false}
                                hideCounter={['rabbana', 'salawat'].includes(activeSection)}
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


    // CUSTOM PRAYERS VIEW
    if (viewMode === 'custom') {
        const isDark = theme === 'dark'
        const savePrayer = () => {
            if (!newPrayer.arabic.trim()) return
            const updated = [...customPrayers, { ...newPrayer, id: Date.now() }]
            setCustomPrayers(updated)
            localStorage.setItem('user-custom-prayers', JSON.stringify(updated))
            setNewPrayer({ arabic: '', transliteration: '', translation: '', reference: '' })
            setShowAddModal(false)
        }
        const removePrayer = (id) => {
            const updated = customPrayers.filter(p => p.id !== id)
            setCustomPrayers(updated)
            localStorage.setItem('user-custom-prayers', JSON.stringify(updated))
        }

        return (
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {/* Header removed as per user request for Custom Dua section */}
                <div className="px-6 pt-8 pb-6 container mx-auto flex items-center justify-between">
                    <button onClick={goBack} className="p-3 rounded-2xl transition-all active:scale-95" style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary') }}>
                        <IconChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98]"
                        style={{ background: t(theme, 'accent'), color: theme === 'dark' ? '#000' : '#fff' }}
                    >
                        + New prayer
                    </button>
                </div>

                <main className="px-6 animate-fade-in mt-2 container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customPrayers.length === 0 ? (
                            <div className="col-span-full text-center py-24 opacity-30 text-[11px] font-black uppercase tracking-[0.3em]">No personal prayers yet</div>
                        ) : (
                            customPrayers.map((p) => (
                                <div
                                    key={p.id}
                                    className="group relative flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 border hover:shadow-xl hover:-translate-y-1"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.03)'
                                    }}
                                >
                                    <div className="flex-1 flex flex-col items-start leading-tight min-w-0">
                                        <span className="text-[16px] font-bold tracking-tight truncate w-full" style={{ color: t(theme, 'text-primary') }}>{p.transliteration || 'Personal Dua'}</span>
                                        <span className="text-[11px] opacity-50 font-medium line-clamp-1 mt-1.5" style={{ color: t(theme, 'text-muted') }}>{p.translation || 'Private Supplication'}</span>
                                    </div>
                                    <button
                                        onClick={() => removePrayer(p.id)}
                                        className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500"
                                        style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-muted') }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 6L6 18M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </main>

                {showAddModal && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="w-full max-w-lg p-10 rounded-[3rem] shadow-2xl animate-modal-slide-up" style={{ background: t(theme, 'surface-0'), border: `1px solid ${t(theme, 'border')}` }}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-medium" style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>New Personal Prayer</h3>
                                <button onClick={() => setShowAddModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6L6 18M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Arabic Text (Optional)</label>
                                        <textarea
                                            placeholder="بِسْمِ اللَّهِ..."
                                            value={newPrayer.arabic}
                                            onChange={e => setNewPrayer({ ...newPrayer, arabic: e.target.value })}
                                            className="w-full p-5 rounded-[1.5rem] text-right min-h-[120px] outline-none transition-all focus:ring-2 focus:ring-accent/20 resize-none text-xl"
                                            style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary'), direction: 'rtl', fontFamily: 'var(--font-serif-arabic)' }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Transliteration</label>
                                            <input
                                                placeholder="Bismillah..."
                                                value={newPrayer.transliteration}
                                                onChange={e => setNewPrayer({ ...newPrayer, transliteration: e.target.value })}
                                                className="w-full p-4 rounded-[1.25rem] outline-none transition-all focus:ring-2 focus:ring-accent/20"
                                                style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary') }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Reference</label>
                                            <input
                                                placeholder="e.g. Personal"
                                                value={newPrayer.reference}
                                                onChange={e => setNewPrayer({ ...newPrayer, reference: e.target.value })}
                                                className="w-full p-4 rounded-[1.25rem] outline-none transition-all focus:ring-2 focus:ring-accent/20"
                                                style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary') }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Translation</label>
                                        <input
                                            placeholder="In the name of Allah..."
                                            value={newPrayer.translation}
                                            onChange={e => setNewPrayer({ ...newPrayer, translation: e.target.value })}
                                            className="w-full p-4 rounded-[1.25rem] outline-none transition-all focus:ring-2 focus:ring-accent/20"
                                            style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary') }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={savePrayer}
                                    className="w-full py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl"
                                    style={{ background: t(theme, 'accent'), color: theme === 'dark' ? '#000' : '#fff' }}
                                >
                                    Save Prayer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return null
}
