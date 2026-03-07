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
    IconInfo,
    IconPencil,
    IconTrash,
    IconSparkles
} from '../components/Icons'
import DuaCard from '../components/DuaCard'
import PageHeader from '../components/PageHeader'
import MiniTasbih from '../components/MiniTasbih'
import { toTitleCase } from '../utils/text'

export default function LibraryPage({ duas, embedded = false, initialSection = null }) {
    const { theme } = useSettings()
    const isDark = theme === 'dark'
    const navigate = useNavigate()

    // View state
    const [viewMode, setViewMode] = useState(() => {
        if (!initialSection) return 'landing'
        if (initialSection === 'custom-prayers') return 'custom'
        if (['situational', 'emotions', 'general', 'rabbana', 'salawat', 'ramadan'].includes(initialSection)) return 'dualist'
        return 'swipe'
    })
    const [activeSection, setActiveSection] = useState(initialSection)
    const [activeSubSection, setActiveSubSection] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [search, setSearch] = useState('')
    const [miniTasbihCount, setMiniTasbihCount] = useState(0)
    const [editingPrayerId, setEditingPrayerId] = useState(null)
    const [customPrayers, setCustomPrayers] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user-custom-prayers') || '[]') } catch { return [] }
    })
    const [showAddModal, setShowAddModal] = useState(false)
    const [newPrayer, setNewPrayer] = useState({ arabic: '', transliteration: '', translation: '', reference: '' })
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [prayerToDeleteId, setPrayerToDeleteId] = useState(null)

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
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') return customPrayers.map(p => ({
            ...p,
            arabic_text: p.arabic || '',
            category: 'custom'
        }))
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
    }, [duas, activeSection, listDuas, viewMode, customPrayers])

    const savePrayerManual = (prayer, id) => {
        let updated;
        if (id) {
            updated = customPrayers.map(p => p.id === id ? { ...prayer, id } : p)
        } else {
            updated = [...customPrayers, { ...prayer, id: Date.now() }]
        }
        setCustomPrayers(updated)
        localStorage.setItem('user-custom-prayers', JSON.stringify(updated))
    }

    const initiateDelete = (id, e) => {
        if (e) e.stopPropagation()
        setPrayerToDeleteId(id)
        setShowDeleteConfirm(true)
    }

    const confirmDelete = () => {
        if (!prayerToDeleteId) return
        const updated = customPrayers.filter(p => p.id !== prayerToDeleteId)
        setCustomPrayers(updated)
        localStorage.setItem('user-custom-prayers', JSON.stringify(updated))

        // Handle navigation if we are in swipe mode and just deleted the last item
        if (viewMode === 'swipe' && (activeSection === 'custom' || activeSection === 'custom-prayers')) {
            if (updated.length === 0) {
                setViewMode('custom')
            } else {
                setSelectedIndex(prev => Math.max(0, prev - 1))
            }
        }
        setShowDeleteConfirm(false)
        setPrayerToDeleteId(null)
    }

    const startEditManual = (p, e) => {
        if (e) e.stopPropagation()
        setNewPrayer({
            arabic: p.arabic || '',
            transliteration: p.transliteration || '',
            translation: p.translation || '',
            reference: p.reference || ''
        })
        setEditingPrayerId(p.id)
        setShowAddModal(true)
    }

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
            if (activeSection === 'custom' || activeSection === 'custom-prayers') {
                setViewMode('custom')
                return
            }
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
            navigate('/dua')
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
            if (dua.id === 'ramadan-1') return 'Sighting the Moon'
            if (dua.id === 'ramadan-2') return 'Intention (Suhoor)'
            if (dua.id === 'ramadan-3') return 'Breaking Fast (Iftar)'
            if (dua.id === 'ramadan-4') return 'After Iftar'
            if (dua.id === 'ramadan-5') return 'First 10 Days (Mercy)'
            if (dua.id === 'ramadan-6') return 'Middle 10 Days (Forgiveness)'
            if (dua.id === 'ramadan-7') return 'Last 10 Days (Safety)'
            if (dua.id === 'ramadan-8') return 'Laylatul Qadr'
            if (dua.id === 'ramadan-9') return 'World & Hereafter'
            if (dua.id === 'ramadan-10') return 'For Parents'
            if (dua.id === 'ramadan-11') return 'Guidance & Provision'
            if (dua.id === 'ramadan-12') return 'For Knowledge'
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
        } else if (activeSection === 'ramadan') {
            subtitle = 'Spiritual Season'
        }

        return (
            <div className={`sticky top-0 z-20 ${viewMode === 'landing' ? 'pb-2' : 'pb-1'}`} style={{ background: t(theme, 'surface-0') }}>
                <PageHeader
                    title={title}
                    onBack={goBack}
                    padding={(viewMode === 'swipe') ? "px-6 pt-10 pb-6" : "px-6 pt-8 pb-3"}
                    titleSize="text-xl"
                    titleWeight={300}
                    sticky={false}
                    titleSerif={false}
                />

            </div>
        )
    }


    // LANDING: Grid of sections
    if (viewMode === 'landing') {
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
        return (
            <div className="pb-32 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {!embedded && <Header />}
                <main className="px-6 flex flex-col gap-2 mt-8 animate-fade-in">
                    {SUB_SECTIONS.map((sub, idx) => {
                        return (
                            <button
                                key={sub.id}
                                onClick={() => {
                                    if (sub.id === 'custom-prayers') {
                                        setActiveSection('custom')
                                        setViewMode('custom')
                                        return
                                    }
                                    // Enter list mode for the selected sub-category
                                    setViewMode('dualist')
                                    setActiveSubSection(sub.id)
                                }}
                                className="group flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all active:scale-[0.98] hover:shadow-md"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                    boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)'
                                }}
                            >
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-semibold text-xs relative overflow-hidden"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                    <div className="absolute inset-0 opacity-[0.08]" style={{ background: t(theme, 'text-primary') }} />
                                    {idx + 1}
                                </div>
                                <h4 className="flex-1 font-semibold text-[14px] tracking-tight" style={{ color: t(theme, 'text-primary') }}>{sub.title}</h4>
                                <IconChevronRight size={16} className="opacity-10 group-hover:opacity-40 group-hover:translate-x-1 transition-all" />
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
                        <div className="text-center py-20 opacity-30 text-[11px] font-black tracking-widest">No duas found</div>
                    ) : (
                        listDuas.map((dua, i) => {
                            // Helper to make title more "Institutional"
                            const getTitle = (d) => {
                                if (activeSection === 'ramadan') {
                                    const ramadanTitles = [
                                        'Sighting the Moon',
                                        'Intention (Suhoor)',
                                        'Breaking Fast (Iftar)',
                                        'After Iftar',
                                        'First 10 Days (Mercy)',
                                        'Middle 10 Days (Forgiveness)',
                                        'Last 10 Days (Safety)',
                                        'Laylatul Qadr',
                                        'World & Hereafter',
                                        'For Parents',
                                        'Guidance & Provision',
                                        'For Knowledge'
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
                                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-semibold text-xs relative overflow-hidden"
                                        style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                        <div className="absolute inset-0 opacity-10" style={{ background: t(theme, 'text-primary') }} />
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[14px] font-medium text-primary truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
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
                                hideAudio={dua.category === 'custom'}
                                hideCounter={['rabbana', 'salawat'].includes(activeSection)}
                                onDelete={dua.category === 'custom' ? () => initiateDelete(dua.id) : null}
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
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="w-full max-w-sm p-10 rounded-[3rem] shadow-2xl animate-modal-slide-up flex flex-col items-center text-center"
                            style={{ background: t(theme, 'surface-0'), border: `1px solid ${t(theme, 'border')}` }}>

                            {/* Trash Icon */}
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-black/5"
                                style={{
                                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                    color: '#ef4444'
                                }}>
                                <IconTrash size={32} />
                            </div>

                            <h3 className="text-[24px] font-medium tracking-tight mb-4 italic"
                                style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>
                                Delete Supplication?
                            </h3>

                            <p className="text-[14px] leading-relaxed opacity-50 mb-10 max-w-[240px]">
                                Are you sure you want to remove this prayer from your list? This action cannot be undone.
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-4 rounded-full font-bold text-[12px] tracking-[0.1em] transition-all active:scale-[0.98]"
                                    style={{ background: '#ef4444', color: '#ffffff' }}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => { setShowDeleteConfirm(false); setPrayerToDeleteId(null); }}
                                    className="w-full py-4 rounded-full font-bold text-[12px] tracking-[0.1em] uppercase transition-all active:scale-[0.98] border"
                                    style={{
                                        background: 'transparent',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        color: t(theme, 'text-primary')
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }


    // CUSTOM PRAYERS VIEW
    if (viewMode === 'custom') {
        const savePrayer = () => {
            const hasInput = Object.values(newPrayer).some(v => v.trim() !== '')
            if (!hasInput) return
            savePrayerManual(newPrayer, editingPrayerId)
            setNewPrayer({ arabic: '', transliteration: '', translation: '', reference: '' })
            setEditingPrayerId(null)
            setShowAddModal(false)
        }

        return (
            <div className="pb-32 min-h-screen" style={{ background: t(theme, 'surface-0'), paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <div className="sticky top-0 z-20 pb-4" style={{ background: t(theme, 'surface-0') }}>
                    <PageHeader
                        title="Personal Duas"
                        onBack={goBack}
                        padding="px-6 pt-10 pb-4"
                        titleSize="text-xl"
                        titleWeight={300}
                        titleSerif={false}
                        sticky={false}
                    />
                </div>

                <main className="px-6 animate-fade-in mt-2 container mx-auto">
                    {/* Add Prayer Action */}
                    <button
                        onClick={() => {
                            setEditingPrayerId(null)
                            setNewPrayer({ arabic: '', transliteration: '', translation: '', reference: '' })
                            setShowAddModal(true)
                        }}
                        className="w-full h-14 flex items-center justify-center gap-2 rounded-full border transition-all hover:scale-[1.01] active:scale-[0.98] mb-12"
                        style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            color: t(theme, 'text-primary'),
                            boxShadow: isDark ? 'none' : '0 4px 12px rgba(0,0,0,0.01)'
                        }}
                    >
                        <span className="text-[14px] font-bold tracking-[0.05em] opacity-70">
                            + Add Prayer
                        </span>
                    </button>

                    <div className="mb-6">
                        <h2 className="text-[11px] font-bold tracking-[0.15em] opacity-40">
                            Saved Supplications
                        </h2>
                    </div>

                    <div className="flex flex-col gap-5">
                        {customPrayers.length === 0 ? (
                            <div
                                className="flex flex-col items-center justify-center gap-4 py-16 px-10 rounded-[2.5rem] border-2 border-dashed text-center"
                                style={{ borderColor: t(theme, 'border'), opacity: 0.6 }}
                            >
                                <div className="p-4 rounded-full" style={{ background: t(theme, 'surface-1') }}>
                                    <IconSparkles size={32} />
                                </div>
                                <p className="text-[14px] font-medium max-w-[200px] leading-relaxed">
                                    Keep your heart light with regular supplications.
                                </p>
                            </div>
                        ) : (
                            customPrayers.map((p, i) => (
                                <div
                                    key={p.id}
                                    className="group relative flex flex-col p-8 rounded-[2rem] transition-all duration-500 border hover:shadow-xl active:scale-[0.99] overflow-hidden"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        boxShadow: isDark ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3
                                            className="text-[20px] font-medium tracking-tight italic"
                                            style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}
                                        >
                                            {p.transliteration || 'Personal Dua'}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => startEditManual(p, e)}
                                                className="p-2 transition-all hover:scale-110 opacity-60 hover:opacity-100"
                                                style={{ color: t(theme, 'text-primary') }}
                                            >
                                                <IconPencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => initiateDelete(p.id, e)}
                                                className="p-2 transition-all hover:scale-110 opacity-60 hover:opacity-100"
                                                style={{ color: t(theme, 'text-primary') }}
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        {/* Tag removed as per institutional minimalism request */}
                                    </div>

                                    <p
                                        className="text-[15px] leading-relaxed opacity-70 italic font-serif-body"
                                        style={{ color: t(theme, 'text-primary') }}
                                    >
                                        "{p.translation || 'No translation provided'}"
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </main>

                {showAddModal && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="w-full max-w-lg p-10 rounded-[3rem] shadow-2xl animate-modal-slide-up" style={{ background: t(theme, 'surface-0'), border: `1px solid ${t(theme, 'border')}` }}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-medium" style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>
                                    {editingPrayerId ? 'Edit Personal Prayer' : 'New Personal Prayer'}
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6L6 18M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black tracking-widest opacity-40">Arabic Text (Optional)</label>
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
                                            <label className="text-[10px] font-black tracking-widest opacity-40">Transliteration</label>
                                            <input
                                                placeholder="Transliteration"
                                                value={newPrayer.transliteration}
                                                onChange={e => setNewPrayer({ ...newPrayer, transliteration: e.target.value })}
                                                className="w-full p-4 rounded-[1.25rem] outline-none transition-all focus:ring-2 focus:ring-accent/20"
                                                style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary') }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black tracking-widest opacity-40">Reference</label>
                                            <input
                                                placeholder="Reference (Optional)"
                                                value={newPrayer.reference}
                                                onChange={e => setNewPrayer({ ...newPrayer, reference: e.target.value })}
                                                className="w-full p-4 rounded-[1.25rem] outline-none transition-all focus:ring-2 focus:ring-accent/20"
                                                style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary') }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black tracking-widest opacity-40">Translation</label>
                                        <input
                                            placeholder="Translation"
                                            value={newPrayer.translation}
                                            onChange={e => setNewPrayer({ ...newPrayer, translation: e.target.value })}
                                            className="w-full p-4 rounded-[1.25rem] outline-none transition-all focus:ring-2 focus:ring-accent/20"
                                            style={{ background: t(theme, 'surface-1'), color: t(theme, 'text-primary') }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={savePrayer}
                                    className="w-full py-5 rounded-[1.5rem] font-bold text-[14px] tracking-[0.05em] transition-all active:scale-[0.98] shadow-lg hover:shadow-xl group"
                                    style={{
                                        background: t(theme, 'text-primary'),
                                        color: t(theme, 'surface-0'),
                                        boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 20px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Save Prayer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="w-full max-w-sm p-10 rounded-[3rem] shadow-2xl animate-modal-slide-up flex flex-col items-center text-center"
                            style={{ background: t(theme, 'surface-0'), border: `1px solid ${t(theme, 'border')}` }}>

                            {/* Trash Icon */}
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
                                style={{
                                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                    color: '#ef4444'
                                }}>
                                <IconTrash size={32} />
                            </div>

                            <h3 className="text-[24px] font-medium tracking-tight mb-4 italic"
                                style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>
                                Delete Supplication?
                            </h3>

                            <p className="text-[14px] leading-relaxed opacity-50 mb-10 max-w-[240px]">
                                Are you sure you want to remove this prayer from your list? This action cannot be undone.
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={confirmDelete}
                                    className="w-full py-4 rounded-full font-bold text-[12px] tracking-[0.1em] transition-all active:scale-[0.98]"
                                    style={{ background: '#ef4444', color: '#ffffff' }}
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => { setShowDeleteConfirm(false); setPrayerToDeleteId(null); }}
                                    className="w-full py-4 rounded-full font-bold text-[12px] tracking-[0.1em] transition-all active:scale-[0.98] border"
                                    style={{
                                        background: 'transparent',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        color: t(theme, 'text-primary')
                                    }}
                                >
                                    Cancel
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
