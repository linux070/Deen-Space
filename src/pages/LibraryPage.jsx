import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconChevronLeft,
    IconChevronRight,
    IconCompass,
    IconHeart,
    IconDua,
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
        if (['situational', 'emotions', 'general', 'robbana', 'salawat', 'ramadan'].includes(initialSection)) return 'dualist'
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
        { id: 'general', title: 'Daily Duas', subtitle: 'Prophetic Traditions', icon: IconDua },
        { id: 'emotions', title: 'Spiritual States', subtitle: 'Emotional Well-being', icon: IconHeart },
        { id: 'situational', title: 'Life Events', subtitle: 'Situational Supplications', icon: IconCompass },
    ]

    const sectionWideDuas = useMemo(() => {
        let result = duas
        if (activeSection === 'emotions') {
            result = result.filter(d => d.category === 'emotions')
        } else if (activeSection === 'situational') {
            const situationalIds = ['travel', 'illness', 'istikhara', 'protection']
            result = result.filter(d => situationalIds.includes(d.category) || d.tags?.includes('protection'))
        } else if (activeSection === 'general') {
            const generalIds = ['waking', 'sleeping', 'eating', 'dressing', 'home', 'toilet', 'prophetic', 'etiquette', 'animals']
            result = result.filter(d => generalIds.includes(d.category))
        } else if (activeSection) {
            result = result.filter(d => d.category === activeSection)
        }

        if (['emotions', 'situational', 'general'].includes(activeSection)) {
            const getSortIndex = (d) => {
                if (activeSection === 'emotions') {
                    if (d.tags?.includes('anxiety')) return 0;
                    if (d.tags?.includes('sadness')) return 1;
                    if (d.tags?.includes('fear')) return 2;
                    if (d.tags?.includes('gratitude')) return 3;
                    if (d.tags?.includes('trust')) return 4;
                }
                else if (activeSection === 'situational') {
                    if (d.tags?.includes('protection')) return 3; // Priority for protection (it spans across categories)
                    if (d.category === 'travel' && !d.tags?.includes('animals')) return 0;
                    if (d.category === 'illness') return 1;
                    if (d.category === 'istikhara') return 2;
                }
                else if (activeSection === 'general') {
                    if (d.category === 'waking') return 0;
                    if (d.category === 'sleeping') return 1;
                    if (d.category === 'eating') return 2;
                    if (d.category === 'dressing') return 3;
                    if (d.category === 'home') return 4;
                    if (d.category === 'toilet') return 5;
                    const isSneezingYawning = d.tags?.includes('sneezing') || d.tags?.includes('yawning');
                    if (d.category === 'prophetic' && !isSneezingYawning) return 6;
                    if (isSneezingYawning || d.category === 'etiquette' || d.category === 'animals') return 7;
                }
                return 999;
            }

            result.sort((a, b) => getSortIndex(a) - getSortIndex(b))
        }
        return result
    }, [duas, activeSection])

    // SUB SECTIONS for Situational/Emotions
    const SUB_SECTIONS = useMemo(() => {
        if (!activeSection) return []
        if (activeSection === 'situational') {
            return [
                { id: 'travel', title: 'Travel & Journey', icon: IconClock, count: sectionWideDuas.filter(d => d.category === 'travel' && !d.tags?.includes('animals')).length },
                { id: 'illness', title: 'Illness & Visiting', icon: IconInfo, count: sectionWideDuas.filter(d => d.category === 'illness').length },
                { id: 'istikhara', title: 'Istikhara & Guidance', icon: IconStar, count: sectionWideDuas.filter(d => d.category === 'istikhara').length },
                { id: 'protection', title: 'General Protection', icon: IconCompass, count: sectionWideDuas.filter(d => d.tags?.includes('protection') && (d.category === 'prophetic' || d.category === 'travel')).length },
            ]
        }
        if (activeSection === 'emotions') {
            return [
                { id: 'anxiety', title: 'Anxiety & Relief', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('anxiety')).length },
                { id: 'sadness', title: 'Sadness & Sorrow', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('sadness')).length },
                { id: 'fear', title: 'Fear & Worry', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('fear')).length },
                { id: 'gratitude', title: 'Gratitude & Praise', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('gratitude')).length },
                { id: 'trust', title: 'Trust & Strength', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('trust')).length },
            ]
        }
        if (activeSection === 'general') {
            return [
                { id: 'waking', title: 'Upon Waking', icon: IconCompass, count: sectionWideDuas.filter(d => d.category === 'waking').length },
                { id: 'sleeping', title: 'Before Sleeping', icon: IconHeart, count: sectionWideDuas.filter(d => d.category === 'sleeping').length },
                { id: 'eating', title: 'Meals & Drink', icon: IconCompass, count: sectionWideDuas.filter(d => d.category === 'eating').length },
                { id: 'dressing', title: 'Clothes & Attire', icon: IconHeart, count: sectionWideDuas.filter(d => d.category === 'dressing').length },
                { id: 'home', title: 'Home & Living', icon: IconCompass, count: sectionWideDuas.filter(d => d.category === 'home').length },
                { id: 'toilet', title: 'Hygiene & Purity', icon: IconInfo, count: sectionWideDuas.filter(d => d.category === 'toilet').length },
                { id: 'prophetic', title: 'General Remembrances', icon: IconStar, count: sectionWideDuas.filter(d => d.category === 'prophetic' && !['sneezing', 'yawning', 'wudu', 'mosque'].includes(d.tags?.[1])).length },
                { id: 'sneezing-yawning', title: 'Sneezing & Yawning', icon: IconSparkles, count: sectionWideDuas.filter(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning') || d.tags?.includes('animals')).length },
            ]

        }
        return []       
    }, [activeSection, sectionWideDuas])

    // Filtered duas based on active section/subsection and search
    // Logic: If activeSubSection is set, we filter specifically for it (category or tags)
    // Otherwise we filter for the whole section.
    const filteredDuasBase = useMemo(() => {
        let result = sectionWideDuas

        // Priority 1: Sub-section filtering
        if (activeSubSection) {
            if (activeSubSection === 'sneezing-yawning' || activeSubSection === 'etiquettes') {
                result = result.filter(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning') || d.tags?.includes('animals'))
            } else if (activeSection === 'emotions') {
                result = result.filter(d => d.tags?.includes(activeSubSection))
            } else if (activeSection === 'situational') {
                if (activeSubSection === 'protection') {
                    result = result.filter(d => d.tags?.includes('protection') && (d.category === 'prophetic' || d.category === 'travel'))
                } else if (activeSubSection === 'travel') {
                    result = result.filter(d => d.category === 'travel' && !d.tags?.includes('animals'))
                } else {
                    result = result.filter(d => d.category === activeSubSection)
                }
            } else if (activeSection === 'general') {
                if (activeSubSection === 'prophetic') {
                    result = result.filter(d => d.category === 'prophetic' && !['sneezing', 'yawning', 'wudu', 'mosque'].includes(d.tags?.[1]))
                } else {
                    result = result.filter(d => d.category === activeSubSection)
                }
            } else {
                result = result.filter(d => d.category === activeSubSection)
            }
        }
        return result
    }, [sectionWideDuas, activeSection, activeSubSection])

    // Final list for vertical display (with search)
    const listDuas = useMemo(() => {
        let result = filteredDuasBase
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
    }, [filteredDuasBase, search])

    // Final list for swiper (respects custom prayers)
    const swipeDuas = useMemo(() => {
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') {
            return customPrayers.map(p => ({
                ...p,
                arabic_text: p.arabic || '',
                category: 'custom'
            }))
        }
        // Swipe view uses the ENTIRE category pool, ensuring lateral swiping reaches all sub-sections
        if (['emotions', 'situational', 'general'].includes(activeSection)) {
            return sectionWideDuas
        }
        if (activeSection && !search && activeSection !== 'custom' && activeSection !== 'custom-prayers') {
            return sectionWideDuas
        }
        return filteredDuasBase
    }, [filteredDuasBase, sectionWideDuas, customPrayers, viewMode, activeSection, search])

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

    // Handle swiper scroll to update active sub-section header dynamically
    const handleSwipeScroll = (e) => {
        if (skippingFirstScroll.current) {
            skippingFirstScroll.current = false
            return
        }
        if (!e.target) return
        const width = e.target.offsetWidth
        const scrollLeft = e.target.scrollLeft
        // Calculate the index exactly
        const exactIndex = scrollLeft / width
        // Only update index when perfectly snapped
        if (Math.abs(exactIndex - Math.round(exactIndex)) < 0.05) {
            const index = Math.round(exactIndex)
            if (index !== selectedIndex) {
                setSelectedIndex(index)
                
                // Update active sub-section so the header matches the currently displayed dua during lateral swiping
                const currentDua = swipeDuas[index];
                if (currentDua) {
                    let newSub = activeSubSection;
                    if (activeSection === 'emotions') {
                        newSub = currentDua.tags?.find(t => ['anxiety', 'sadness', 'fear', 'gratitude', 'trust'].includes(t)) || currentDua.category;
                    } else if (activeSection === 'situational') {
                        newSub = currentDua.category;
                        if (currentDua.tags?.includes('protection')) newSub = 'protection';
                        if (currentDua.category === 'travel' && !currentDua.tags?.includes('animals')) newSub = 'travel';
                    } else if (activeSection === 'general') {
                        newSub = currentDua.category;
                        if (currentDua.tags?.includes('sneezing') || currentDua.tags?.includes('yawning') || currentDua.category === 'etiquette' || currentDua.category === 'animals') newSub = 'sneezing-yawning';
                        if (currentDua.category === 'prophetic' && !(currentDua.tags?.includes('sneezing') || currentDua.tags?.includes('yawning'))) newSub = 'prophetic';
                    }
                    if (newSub && newSub !== activeSubSection && SUB_SECTIONS.some(s => s.id === newSub)) {
                        setActiveSubSection(newSub);
                    }
                }
            }
        }
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
            if (activeSubSection) {
                setViewMode('sublist')
                setSelectedIndex(0)
                return
            }
            if (['robbana', 'salawat', 'ramadan'].includes(activeSection) || initialSection) {
                if (initialSection) navigate('/dua')
                else {
                    setViewMode('landing')
                    setActiveSection(null)
                }
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
            if (initialSection) {
                navigate('/dua')
                return
            }
            setViewMode('landing')
            setActiveSection(null)
            return
        }

        if (viewMode === 'sublist') {
            if (initialSection) {
                navigate('/dua')
                return
            }
            setViewMode('landing')
            setActiveSection(null)
            return
        }

        if (viewMode === 'custom' || viewMode === 'landing') {
            navigate('/dua')
            return
        }
    }


    // Map specific categories to institutional labels
    const getDuaLabel = (dua) => {
        const cat = dua.category
        if (dua.tags?.includes('sneezing')) return 'Sneezing'
        if (dua.tags?.includes('yawning')) return 'Yawning'
        if (dua.tags?.includes('animals')) return 'Animal Sounds'
        if (cat === 'prophetic') return 'Prophetic Supplication'
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
        if (cat === 'robbana') return 'Quranic Robbana'
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

    // Header logic
    const getPageTitle = () => {
        if (viewMode === 'landing') return 'Library'
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') return 'My Prayers'
        if (activeSection === 'ramadan') return 'Ramadan'
        
        // If we are looking at the sub-groups list, show the root category title
        if (viewMode === 'sublist') {
            const currentRoot = SECTIONS.find(s => s.id === activeSection)
            if (currentRoot) return currentRoot.title
        }

        // Detail override for ramadan
        if (viewMode === 'swipe') {
            const dua = swipeDuas[selectedIndex]
            
            if (activeSection === 'ramadan') {
                if (dua?.id === 'ramadan-1') return 'Sighting the Moon'
                if (dua?.id === 'ramadan-2') return 'Intention (Suhoor)'
                if (dua?.id === 'ramadan-3') return 'Breaking Fast (Iftar)'
                if (dua?.id === 'ramadan-4') return 'After Iftar'
                if (dua?.id === 'ramadan-5') return 'First 10 Days'
                if (dua?.id === 'ramadan-6') return 'Middle 10 Days'
                if (dua?.id === 'ramadan-7') return 'Last 10 Days'
                if (dua?.id === 'ramadan-8') return 'Laylatul Qadr'
                if (dua?.id === 'ramadan-9') return 'World & Hereafter'
                if (dua?.id === 'ramadan-10') return 'For Parents'
                if (dua?.id === 'ramadan-11') return 'Guidance & Provision'
                if (dua?.id === 'ramadan-12') return 'For Knowledge'
                return 'Ramadan Special'
            }

            // Detail override for emotions
            if (activeSection === 'emotions') {
                if (dua?.id === 'anxiety-1') return 'Anxiety'
                if (dua?.id === 'anxiety-2') return 'Anxiety'
                if (dua?.id === 'anxiety-3') return 'Relief'
                if (dua?.id === 'sadness-1') return 'Sadness'
                if (dua?.id === 'sadness-2') return 'Sorrow'
                if (dua?.id === 'fear-1') return 'Fear'
                if (dua?.id === 'fear-2') return 'Worry'
                if (dua?.id === 'gratitude-1') return 'Gratitude'
                if (dua?.id === 'gratitude-2') return 'Gratitude'
                if (dua?.id === 'gratitude-3') return 'Praise'
                if (dua?.id === 'trust-1') return 'Trust'
            }
            
            if (activeSection === 'robbana') return `Robbana ${selectedIndex + 1}`
            if (activeSection === 'salawat') return `Salawat ${selectedIndex + 1}`
            
            if (dua) return getDuaLabel(dua)
        }

        if (activeSubSection) {
            const sec = SUB_SECTIONS.find(s => s.id === activeSubSection)
            if (sec) return sec.title
        }

        if (!activeSection) return 'Supplications'

        const cat = activeSection
        if (cat === 'robbana') return 'Robbana Duas'
        if (cat === 'salawat') return 'Durood & Salawat'
        if (cat === 'emotions') return 'Spiritual States'
        if (cat === 'situational') return 'Life Events'
        if (cat === 'general') return 'Daily Duas'

        return toTitleCase(cat)
    }

    const Header = () => {
        const title = getPageTitle()
        let subtitle = 'Collections of Supplication'

        if (activeSubSection) {
            subtitle = toTitleCase(activeSubSection)
        } else if (activeSection === 'robbana') {
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
                                    // Logic: If it's a major section with sub-divisions, go to sublist
                                    if (['general', 'emotions', 'situational'].includes(s.id)) {
                                        setViewMode('sublist')
                                    } else if (s.id === 'custom-prayers') {
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
                                    // Enter swipe mode (detail view) directly for the selected sub-category
                                    setActiveSubSection(sub.id)
                                    // Calculate global starting index within sectionWideDuas
                                    const firstItemIndex = sectionWideDuas.findIndex(d => {
                                        if (sub.id === 'sneezing-yawning' || sub.id === 'etiquettes') return d.tags?.includes('sneezing') || d.tags?.includes('yawning') || d.category === 'etiquette' || d.category === 'animals'
                                        if (activeSection === 'emotions') {
                                            if (d.tags?.includes(sub.id)) {
                                                const highestEmotion = d.tags?.find(t => ['anxiety', 'sadness', 'fear', 'gratitude', 'trust'].includes(t));
                                                return highestEmotion === sub.id;
                                            }
                                            return false;
                                        }
                                        if (activeSection === 'situational' && sub.id === 'protection') return d.tags?.includes('protection')
                                        if (activeSection === 'situational' && sub.id === 'travel') return d.category === 'travel' && !d.tags?.includes('protection') && !d.tags?.includes('animals')
                                        if (activeSection === 'general' && sub.id === 'prophetic') return d.category === 'prophetic' && !d.tags?.includes('sneezing') && !d.tags?.includes('yawning')
                                        return d.category === sub.id
                                    })
                                    setSelectedIndex(firstItemIndex !== -1 ? firstItemIndex : 0)
                                    skippingFirstScroll.current = true
                                    setViewMode('swipe')

                                }}
                                className="group flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all active:scale-[0.98] hover:shadow-md"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                    boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)'
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-[14px] tracking-tight truncate" style={{ color: t(theme, 'text-primary') }}>{sub.title}</h4>
                                    {sub.count !== undefined && (
                                        <p className="text-[10px] font-bold tracking-[0.1em] opacity-40 mt-0.5" style={{ color: t(theme, 'text-muted') }}>
                                            {sub.count} {sub.count === 1 ? 'Supplication' : 'Supplications'}
                                        </p>
                                    )}
                                </div>
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
                                if (d.tags?.includes('yawning')) return 'Yawning'
                                if (d.tags?.includes('sneezing')) return 'Sneezing Etiquette'
                                if (d.tags?.includes('animals')) return 'Animal Sounds'
                                if (activeSection === 'emotions') {
                                    if (d.id === 'anxiety-1') return 'For Anxiety'
                                    if (d.id === 'anxiety-2') return 'For Anxiety'
                                    if (d.id === 'anxiety-3') return 'For Relief'
                                    if (d.id === 'sadness-1') return 'For Sadness'
                                    if (d.id === 'sadness-2') return 'For Sorrow'
                                    if (d.id === 'fear-1') return 'For Fear'
                                    if (d.id === 'fear-2') return 'For Worry'
                                    if (d.id === 'gratitude-1') return 'For Gratitude'
                                    if (d.id === 'gratitude-2') return 'For Gratitude'
                                    if (d.id === 'gratitude-3') return 'For Praise'
                                    if (d.id === 'trust-1') return 'For Trust'
                                    
                                    const emotionTag = d.tags?.find(t => ['anxiety', 'sadness', 'fear', 'anger', 'gratitude', 'loneliness', 'worry', 'trust'].includes(t))
                                    return emotionTag ? `For ${toTitleCase(emotionTag)}` : 'For the Heart'
                                }
                                if (d.category === 'eating') {
                                    if (d.id.includes('after')) return 'After Eating'
                                    if (d.arabic_text?.includes('بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ')) return 'Forgotten Bismillah'
                                    return 'Before Eating'
                                }
                                if (d.category === 'home') {
                                    if (d.arabic_text?.includes('وَلَجْنَا')) return 'Entering Home'
                                    if (d.arabic_text?.includes('بِسْمِ اللَّهِ، تَوَكَّلْتُ')) return 'Leaving Home'
                                    return 'For Home'
                                }
                                if (d.category === 'dressing') {
                                    if (d.arabic_text?.includes('كَسَانِي')) return 'While Dressing'
                                    if (d.id.includes('undressing')) return 'Undressing'
                                    return 'Dressing'
                                }
                                if (d.category === 'toilet') {
                                    if (d.arabic_text?.includes('غُفْرَانَكَ')) return 'Leaving Restroom'
                                    return 'Entering Restroom'
                                }
                                if (d.category === 'waking') return 'Upon Waking'
                                if (d.category === 'sleeping') return 'Before Sleeping'
                                if (d.category === 'robbana') return `Robbana ${i + 1}`
                                if (d.category === 'salawat') return `Salawat ${i + 1}`
                                if (['morning', 'evening', 'after-salah'].includes(d.category)) return `${toTitleCase(d.category)} ${i + 1}`
                                return toTitleCase(d.category) || toTitleCase(d.reference) || 'Supplication'
                            }

                            return (
                                <button
                                    key={`${dua.id}-${i}`}
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
                        <div key={`${dua?.id}-${i}`} className="w-full h-full flex-shrink-0 snap-center flex flex-col p-6 overflow-y-auto">
                            <DuaCard
                                dua={{
                                    ...dua,
                                    reference: toTitleCase(dua.reference) || 'Supplication'
                                }}
                                label={null}
                                type="dua"
                                hideAudio={dua.category === 'custom'}
                                hideCounter={['robbana', 'salawat'].includes(activeSection)}
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
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in relative mt-4">
                                <p className="text-[14px] min-[390px]:text-[15px] font-normal max-w-[280px] leading-relaxed" style={{ color: t(theme, 'text-secondary') }}>
                                    Keep your spiritual journey close by adding your first personal dua.
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
