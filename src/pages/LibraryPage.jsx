import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
    IconSparkles,
    IconMoon,
    IconSun,
    IconRemembrance,
    IconFlower,
    IconHome,
    IconTag,
    IconMessage
} from '../components/Icons'
import DuaCard from '../components/DuaCard'
import PageHeader from '../components/PageHeader'
import MiniTasbih from '../components/MiniTasbih'
import { toTitleCase } from '../utils/text'



export default function LibraryPage({ duas, embedded = false, initialSection = null }) {
    const { theme } = useSettings()
    const isDark = theme === 'dark'
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // View state
    const [viewMode, setViewMode] = useState(() => {
        const v = searchParams.get('view')
        if (v) return v
        if (!initialSection) return 'landing'
        if (initialSection === 'custom-prayers') return 'custom'
        if (['situational', 'emotions', 'general', 'robbana', 'salawat', 'salah', 'ramadan'].includes(initialSection)) return 'list'
        return 'swipe'
    })
    const [activeSection, setActiveSection] = useState(() => {
        if (initialSection) return initialSection
        return searchParams.get('sec')
    })
    const [activeSubSection, setActiveSubSection] = useState(() => {
        return searchParams.get('sub')
    })
    const [selectedIndex, setSelectedIndex] = useState(() => {
        const idx = parseInt(searchParams.get('idx'))
        return isNaN(idx) ? 0 : idx
    })
    const [search, setSearch] = useState('')
    const [miniTasbihCount, setMiniTasbihCount] = useState(0)

    // Sync search params when state changes
    useEffect(() => {
        const params = new URLSearchParams()
        if (viewMode !== 'landing') params.set('view', viewMode)
        if (activeSection) params.set('sec', activeSection)
        if (activeSubSection) params.set('sub', activeSubSection)
        if (viewMode === 'swipe') params.set('idx', selectedIndex)
        setSearchParams(params, { replace: true })
    }, [viewMode, activeSection, activeSubSection, selectedIndex, setSearchParams])
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
        { id: 'general', title: 'Daily Duas', subtitle: 'Prophetic Traditions', icon: IconSun },
        { id: 'emotions', title: 'Spiritual State', subtitle: 'Emotional Well-being', icon: IconRemembrance },
        { id: 'situational', title: 'Life Event', subtitle: 'Situational Supplications', icon: IconCompass },
    ]

    const sectionWideDuas = useMemo(() => {
        let result = duas
        if (activeSection === 'emotions') {
            const emotionsIds = ['anxiety', 'sadness', 'fear', 'gratitude', 'trust']
            result = result.filter(d => d.category === 'emotions' && emotionsIds.some(tag => d.tags?.includes(tag)))
        } else if (activeSection === 'situational') {
            const situationalCats = ['travel', 'illness', 'istikhara']
            // Strictly exclude robbana and other random protection-tagged duas. Limit to protection-1 specifically.
            result = result.filter(d => (situationalCats.includes(d.category) || d.id === 'protection-1') && d.category !== 'robbana')
        } else if (activeSection === 'general') {
            const generalIds = ['waking', 'sleeping', 'eating', 'dressing', 'home', 'toilet', 'prophetic', 'etiquette', 'animals']
            result = result.filter(d => generalIds.includes(d.category) && d.id !== 'light-1')
        } else if (activeSection === 'ramadan') {
            result = result.filter(d => d.category === 'ramadan')
        } else if (activeSection) {
            result = result.filter(d => d.category === activeSection)
        }

        if (['emotions', 'situational', 'general', 'ramadan'].includes(activeSection)) {
            const getSortIndex = (d) => {
                if (activeSection === 'emotions') {
                    if (d.tags?.includes('anxiety')) return 0;
                    if (d.tags?.includes('sadness')) return 1;
                    if (d.tags?.includes('fear') && !d.tags?.includes('trust')) return 2;
                    if (d.tags?.includes('gratitude')) return 3;
                    if (d.tags?.includes('trust') && !d.tags?.includes('patience') && d.id !== 'trust-3') return 4;
                    if (d.tags?.includes('patience') || d.id === 'trust-3') return 5;
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
                    if (d.category === 'home') {
                        // Group entering duas together, then leaving duas
                        if (d.id === 'home-0') return 4.0; // Entering Home
                        if (d.id === 'home-1') return 4.2; // Leaving Home
                        if (d.id === 'home-3') return 4.3; // Leaving Home (extended)
                        return 4.1;
                    }
                    if (d.category === 'toilet') return 5;
                    const isSneezingYawning = d.tags?.includes('sneezing') || d.tags?.includes('yawning');
                    if (isSneezingYawning || d.category === 'etiquette' || d.category === 'animals') return 6;
                    if (d.category === 'prophetic' && !isSneezingYawning) return 7;
                }
                else if (activeSection === 'ramadan') {
                    if (d.tags?.includes('moon')) return 0;
                    if (d.tags?.includes('intention')) return 1;
                    if (d.tags?.includes('iftar')) return 2;
                    if (d.tags?.includes('after-iftar')) return 3;
                    if (d.tags?.includes('first-10-days')) return 4;
                    if (d.tags?.includes('middle-10-days')) return 5;
                    if (d.tags?.includes('last-10-days')) return 6;
                    if (d.tags?.includes('laylat-al-qadr')) return 7;
                    if (d.tags?.includes('general')) return 8;
                    if (d.tags?.includes('parents')) return 9;
                    if (d.tags?.includes('guidance')) return 10;
                    if (d.tags?.includes('knowledge')) return 11;
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
                { id: 'travel', title: 'Travel & Journey', icon: IconClock, count: sectionWideDuas.filter(d => d.category === 'travel').length },
                { id: 'illness', title: 'Illness & Visiting', icon: IconInfo, count: sectionWideDuas.filter(d => d.category === 'illness').length },
                { id: 'istikhara', title: 'Istikhara & Guidance', icon: IconStar, count: sectionWideDuas.filter(d => d.category === 'istikhara').length },
                { id: 'protection', title: 'Comprehensive Shield', icon: IconStar, count: sectionWideDuas.filter(d => d.id === 'protection-1').length },
            ]
        }
        if (activeSection === 'emotions') {
            return [
                { id: 'anxiety', title: 'Anxiety & Relief', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('anxiety')).length },
                { id: 'sadness', title: 'Sadness & Sorrow', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('sadness')).length },
                { id: 'fear', title: 'Fear & Worry', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('fear')).length },
                { id: 'gratitude', title: 'Gratitude & Praise', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('gratitude')).length },
                { id: 'trust', title: 'Reliance & Strength', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('trust') && !d.tags?.includes('patience') && d.id !== 'trust-3').length },
                { id: 'patience', title: 'Patience & Perseverance', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('patience') || d.id === 'trust-3').length },
            ]
        }
        if (activeSection === 'general') {
            return [
                { id: 'waking', title: 'Starting the Day', icon: IconCompass, count: sectionWideDuas.filter(d => d.category === 'waking').length },
                { id: 'sleeping', title: 'Night & Sleep', icon: IconMoon, count: sectionWideDuas.filter(d => d.category === 'sleeping').length },
                { id: 'eating', title: 'Meals & Gratitude', icon: IconDua, count: sectionWideDuas.filter(d => d.category === 'eating').length },
                { id: 'dressing', title: 'Dressing', icon: IconTag, count: sectionWideDuas.filter(d => d.category === 'dressing').length },
                { id: 'home', title: 'Home & Living', icon: IconHome, count: sectionWideDuas.filter(d => d.category === 'home' || d.id === 'home-3').length },
                { id: 'toilet', title: 'Restroom Etiquette', icon: IconFlower, count: sectionWideDuas.filter(d => d.category === 'toilet').length },
                { id: 'etiquette', title: 'Sneezing & Yawning', icon: IconMessage, count: sectionWideDuas.filter(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning')).length },
                { id: 'animal-sounds', title: 'Hearing Animal Sounds', icon: IconSparkles, count: sectionWideDuas.filter(d => d.tags?.includes('animals')).length },
                { id: 'prophetic', title: 'Prophetic Remembrance', icon: IconStar, count: sectionWideDuas.filter(d => d.category === 'prophetic' && !d.tags?.some(t => ['sneezing', 'yawning', 'wudu', 'mosque', 'animals', 'home'].includes(t)) && d.id !== 'light-1' && d.id !== 'home-3').length },
            ]

        }
        if (activeSection === 'ramadan') {
            return [
                { id: 'ramadan-moon', title: 'Moon Sighting', icon: IconStar, count: sectionWideDuas.filter(d => d.tags?.includes('moon')).length },
                { id: 'ramadan-fasting', title: 'Suhoor & Iftar', icon: IconDua, count: sectionWideDuas.filter(d => d.tags?.includes('intention') || d.tags?.includes('iftar') || d.tags?.includes('after-iftar')).length },
                { id: 'ramadan-days', title: 'The 30 Days', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('first-10-days') || d.tags?.includes('middle-10-days') || d.tags?.includes('last-10-days') || d.tags?.includes('laylat-al-qadr')).length },
                { id: 'ramadan-personal', title: 'Personal Supplications', icon: IconCompass, count: sectionWideDuas.filter(d => d.tags?.includes('general') || d.tags?.includes('parents') || d.tags?.includes('guidance') || d.tags?.includes('knowledge')).length },
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
            if (activeSubSection === 'sneezing-yawning') {
                result = result.filter(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning'))
            } else if (activeSubSection === 'animal-sounds') {
                result = result.filter(d => d.tags?.includes('animals'))
            } else if (activeSection === 'emotions') {
                if (activeSubSection === 'fear') {
                    result = result.filter(d => d.tags?.includes('fear') && !d.tags?.includes('trust'))
                } else {
                    result = result.filter(d => d.tags?.includes(activeSubSection))
                }
            } else if (activeSection === 'situational') {
                if (activeSubSection === 'protection') {
                    result = result.filter(d => d.id === 'protection-1')
                } else if (activeSubSection === 'travel') {
                    result = result.filter(d => d.category === 'travel' && !d.tags?.includes('animals'))
                } else {
                    result = result.filter(d => d.category === activeSubSection)
                }
            } else if (activeSection === 'general') {
                if (activeSubSection === 'prophetic') {
                    result = result.filter(d => d.category === 'prophetic' && !d.tags?.some(t => ['sneezing', 'yawning', 'wudu', 'mosque', 'animals', 'home'].includes(t)) && d.id !== 'home-3')
                } else {
                    result = result.filter(d => d.category === activeSubSection)
                }
            } else if (activeSection === 'ramadan') {
                if (activeSubSection === 'ramadan-moon') {
                    result = result.filter(d => d.tags?.includes('moon'))
                } else if (activeSubSection === 'ramadan-fasting') {
                    result = result.filter(d => d.tags?.includes('intention') || d.tags?.includes('iftar') || d.tags?.includes('after-iftar'))
                } else if (activeSubSection === 'ramadan-days') {
                    result = result.filter(d => d.tags?.includes('first-10-days') || d.tags?.includes('middle-10-days') || d.tags?.includes('last-10-days') || d.tags?.includes('laylat-al-qadr'))
                } else if (activeSubSection === 'ramadan-personal') {
                    result = result.filter(d => d.tags?.includes('general') || d.tags?.includes('parents') || d.tags?.includes('guidance') || d.tags?.includes('knowledge'))
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

    const groupedSections = useMemo(() => {
        if (activeSection === 'ramadan' && viewMode === 'list' && !activeSubSection) return null; // Ramadan uses sublist navigation mostly

        if (activeSection === 'salah') {
            return [
                {
                    title: 'Before Salah',
                    items: listDuas.filter(d => d.id.startsWith('salah-adhan-'))
                },
                {
                    title: 'In Solah',
                    items: listDuas.filter(d => ['salah-opening'].includes(d.id) || d.id.startsWith('salah-motion-'))
                },
                {
                    title: 'After Salah',
                    items: listDuas.filter(d => d.category === 'after-salah')
                }
            ].filter(g => g.items.length > 0);
        }

        if (['general', 'emotions', 'situational'].includes(activeSection) && !activeSubSection) {
            return SUB_SECTIONS.map(sub => {
                let items = []
                if (sub.id === 'sneezing-yawning') {
                    items = listDuas.filter(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning'))
                } else if (sub.id === 'animal-sounds') {
                    items = listDuas.filter(d => d.tags?.includes('animals'))
                } else if (activeSection === 'emotions') {
                    if (sub.id === 'fear') {
                        items = listDuas.filter(d => d.tags?.includes('fear') && !d.tags?.includes('trust'))
                    } else {
                        items = listDuas.filter(d => d.tags?.includes(sub.id))
                    }
                } else if (activeSection === 'situational') {
                    if (sub.id === 'protection') {
                        items = listDuas.filter(d => d.tags?.includes('protection') && (d.category === 'prophetic' || d.category === 'travel'))
                    } else if (sub.id === 'travel') {
                        items = listDuas.filter(d => d.category === 'travel' && !d.tags?.includes('animals'))
                    } else {
                        items = listDuas.filter(d => d.category === sub.id)
                    }
                } else if (activeSection === 'general') {
                    if (sub.id === 'prophetic') {
                        items = listDuas.filter(d => d.category === 'prophetic' && !d.tags?.some(t => ['sneezing', 'yawning', 'wudu', 'mosque', 'animals'].includes(t)))
                    } else {
                        items = listDuas.filter(d => d.category === sub.id)
                    }
                }
                return { title: sub.title, items, id: sub.id }
            }).filter(g => g.items.length > 0)
        }
        return null;
    }, [listDuas, activeSection, SUB_SECTIONS, activeSubSection, viewMode])

    // Final list for swiper (respects custom prayers)
    const swipeDuas = useMemo(() => {
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') {
            return customPrayers.map(p => ({
                ...p,
                arabic_text: p.arabic || '',
                category: 'custom'
            }))
        }
        // Continuous swipe across all sub-categories in these root sections
        // Swipe view uses the ENTIRE category pool but must be strictly limited to the active root section
        if (['emotions', 'situational', 'general', 'ramadan'].includes(activeSection)) {
            return sectionWideDuas
        }

        // For Salawat and Robbana, we also use the section-wide list
        if (['robbana', 'salawat'].includes(activeSection)) {
            return sectionWideDuas
        }

        if (activeSection && !search && activeSection !== 'custom' && activeSection !== 'custom-prayers') {
            return sectionWideDuas
        }
        return filteredDuasBase
    }, [filteredDuasBase, sectionWideDuas, customPrayers, viewMode, activeSection, activeSubSection, search])

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

    // Handle swiper scroll to update selected index
    const handleSwipeScroll = (e) => {
        if (skippingFirstScroll.current && e.target.scrollLeft === 0 && selectedIndex > 0) return
        skippingFirstScroll.current = false
        const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth)
        if (idx !== selectedIndex) setSelectedIndex(idx)
    }

    // Reset Tasbih count and sync activeSubSection when swiping
    useEffect(() => {
        setMiniTasbihCount(0)

        // Sync activeSubSection for context-aware "Back" navigation
        if (viewMode === 'swipe' && ['general', 'emotions', 'situational', 'ramadan'].includes(activeSection)) {
            const currentDua = swipeDuas[selectedIndex]
            if (currentDua) {
                const sub = SUB_SECTIONS.find(s => {
                    if (s.id === 'etiquette') return currentDua.tags?.includes('sneezing') || currentDua.tags?.includes('yawning')
                    if (s.id === 'animal-sounds') return currentDua.tags?.includes('animals')
                    if (activeSection === 'emotions') {
                        if (s.id === 'patience') return currentDua.tags?.includes('patience') || currentDua.id === 'trust-3'
                        if (s.id === 'fear') return currentDua.tags?.includes('fear')
                        return currentDua.tags?.includes(s.id)
                    }
                    if (activeSection === 'situational') {
                        if (s.id === 'protection') return currentDua.id === 'protection-1'
                        return currentDua.category === s.id
                    }
                    if (activeSection === 'general') {
                        if (s.id === 'prophetic') return currentDua.category === 'prophetic' && !currentDua.tags?.some(t => ['sneezing', 'yawning', 'wudu', 'mosque'].includes(t))
                        return currentDua.category === s.id
                    }
                    if (activeSection === 'ramadan') {
                        if (s.id === 'ramadan-moon') return currentDua.tags?.includes('moon')
                        if (s.id === 'ramadan-fasting') return currentDua.tags?.includes('intention') || currentDua.tags?.includes('iftar') || currentDua.tags?.includes('after-iftar')
                        if (s.id === 'ramadan-days') return currentDua.tags?.includes('first-10-days') || currentDua.tags?.includes('middle-10-days') || currentDua.tags?.includes('last-10-days') || currentDua.tags?.includes('laylat-al-qadr')
                        if (s.id === 'ramadan-personal') return currentDua.tags?.includes('general') || currentDua.tags?.includes('parents') || currentDua.tags?.includes('guidance') || currentDua.tags?.includes('knowledge')
                    }
                    return currentDua.category === s.id
                })
                if (sub && sub.id !== activeSubSection) setActiveSubSection(sub.id)
            }
        }
    }, [selectedIndex, swipeDuas, viewMode, activeSection, SUB_SECTIONS, activeSubSection])

    const goBack = () => {
        if (search) {
            setSearch('')
            return
        }

        if (viewMode === 'swipe') {
            if (activeSection === 'robbana' || activeSection === 'salawat' || activeSection === 'salah') {
                setViewMode('list')
                return
            }
            if (['general', 'emotions', 'situational', 'ramadan'].includes(activeSection)) {
                setViewMode('list')
                setActiveSubSection(null) // Directly return to the full list/grouped list
                return
            }
            if (activeSubSection) {
                setViewMode('list')
                return
            }
            if (activeSection === 'custom' || activeSection === 'custom-prayers') {
                setViewMode('custom')
                return
            }
            if (initialSection) {
                navigate('/dua')
                return
            }
            setViewMode('landing')
            setActiveSection(null)
            setActiveSubSection(null)
            return
        }

        if (viewMode === 'list') {
            if (activeSubSection) {
                if (['general', 'emotions', 'situational'].includes(activeSection)) {
                    // Skip the sublist intermediate step and go back to landing
                    setViewMode('landing')
                    setActiveSection(null)
                    setActiveSubSection(null)
                } else {
                    setActiveSubSection(null)
                }
                return
            }
            if (activeSection === 'ramadan') {
                setViewMode('landing')
                setActiveSection(null)
                return
            }
            if (initialSection === activeSection) {
                navigate('/dua')
                return
            }
            setViewMode('landing')
            setActiveSection(null)
            return
        }

        if (viewMode === 'sublist') {
            setViewMode('landing')
            setActiveSection(null)
            return
        }

        if (viewMode === 'custom' || viewMode === 'landing') {
            navigate('/dua')
            return
        }
    }


    // ─── Unique titles for every dua (sourced from authentic Islamic references) ───
    const UNIQUE_TITLES = {
        // Waking
        'waking-1': 'Praise Upon Waking',
        'waking-2': 'Gratitude for Life',
        'sleeping-1': 'In Your Name I Sleep',
        'sleeping-7': 'The Three Quls (Protection)',
        // Eating
        'eating-0': 'Bismillah Before Eating',
        'eating-1': 'Gratitude After Eating',
        // Toilet
        'toilet-1': 'Entering the Restroom',
        'toilet-2': 'Leaving the Restroom',
        // Home — entering, then leaving
        'home-0': 'Entering the Home',
        'home-1': 'Leaving the Home',
        'home-3': 'Refuge Upon Leaving',
        // Dressing
        'dressing-0': 'Before Undressing',
        'dressing-1': 'Gratitude for Clothing',
        'dressing-2': 'Wearing New Clothes',
        // Etiquette
        'sneezing-1': 'Upon Sneezing',
        'sneezing-2': 'Response to a Sneeze',
        'sneezing-3': 'Reply to Yarhamukallah',
        'yawning-1': 'Refuge Upon Yawning',
        'animal-1': 'Hearing an Animal at Night',
        'animal-2': 'Hearing a Rooster Crow',
        // Prophetic (General Remembrance)
        'prophetic-1': 'Firmness of Heart',
        'prophetic-2': 'Seeking Righteousness',
        'prophetic-3': 'Protection from Evil',
        'guidance-2': 'Seeking Guidance',
        'protection-1': 'The Comprehensive Shield',
        'parents-1': 'Mercy for Parents',
        'light-1': 'Dua for Light (Noor)',
        // Travel
        'travel-1': 'Glory of the Journey',
        'travel-2': 'Righteousness in Travel',
        'travel-3': 'Safety and Return',
        'travel-long': 'The Complete Travel Supplication',
        'market-1': 'Entering the Market',
        'ease-1': 'Supplication for Ease',
        // Illness
        'illness-1': 'Supplication for Healing',
        'illness-2': 'Visiting the Sick',
        'illness-3': 'Comfort in Affliction',
        'distress-1': 'Gratitude in Hardship',
        'clothes-1': 'Wearing New Clothes',
        // Istikhara
        'istikhara-1': 'The Prayer of Guidance',
        // Emotions
        'anxiety-1': 'Refuge from Anxiety',
        'anxiety-2': 'Relief from Distress',
        'anxiety-3': 'The Great Declaration',
        'sadness-1': 'Comfort in Sadness',
        'sadness-2': 'Surrendering to Allah',
        'fear-1': 'Reliance in Fear',
        'fear-2': 'Refuge from Enemies',
        'fear-3': 'Courage from Allah',
        'gratitude-1': 'Praise of the Grateful',
        'gratitude-2': 'Abundant Gratitude',
        'gratitude-3': 'Blessed Praise',
        'trust-1': 'Sufficiency in Allah',
        'trust-2': 'Tawakkul (Reliance)',
        'trust-3': 'Patience & Perseverance',
        'doubt-1': 'Refuge from Doubt',
        'anger-1': 'The Shield from Anger',
        'loneliness-1': 'The Hope in Mercy',
        // Morning Adhkar
        'morning-1': 'The Dominion of Morning',
        'morning-2': 'Supplication of the Day',
        'morning-3': 'The Decisive Glorification',
        'morning-4': 'The Shield of Protection',
        'morning-5': 'The Shelter of Safety',
        'morning-6': 'Wellness and Pardon',
        // Evening Adhkar
        'evening-1': 'The Dominion of Evening',
        'evening-2': 'Supplication of the Night',
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
        'remembrance-19': 'Protection of Blessings',
        'remembrance-20': 'Refuge from Laziness',
        'remembrance-21': 'Acceptance of Repentance',
        'remembrance-22': 'Protection from Grief',
        'remembrance-23': 'Best Disposer of Affairs',
        'remembrance-24': 'Steadfastness in Religion',
        'remembrance-25': 'Forgiveness & Well-being',
        // Salawat
        'salawat-1': 'The Ibrahimic Salawat',
        'salawat-2': 'Salutation of Peace',
        'salawat-3': 'Blessings and Mercy',
        'salawat-4': 'Blessings on the Ahlo-Bait',
        'salawat-5': 'The Unlettered Prophet',
        'salawat-6': 'Blessings of the Universe',
        'salawat-7': 'Salutation of Service',
        'salawat-8': 'The Highest Station',
        // Mosque & Wudu
        'wudu-2': 'Supplication After Wudu',
        'mosque-1': 'Entering the Mosque',
        'mosque-2': 'Leaving the Mosque',
        'dhikr-4': 'Expiation of a Gathering',
        'dhikr-5': 'Constant Repentance',
        // Salah
        'salah-adhan-1': 'Response to Adhan',
        'salah-adhan-2': 'Dua After Adhan',
        'salah-opening': 'Opening Supplication',
        'salah-motion-1': 'The Bowing (Rukoo)',
        'salah-motion-2': 'Rising from Rukoo',
        'salah-motion-3': 'The Prostration (Sujood)',
        'salah-motion-4': 'Between Prostrations',
        'salah-motion-5': 'The Tashahhud',
        'salah-motion-6': 'Dua After Tashahhud',
        'salah-motion-7': 'The Salutation (Tasleem)',
        // After Salah
        'salah-1': 'Forgiveness After Salah',
        'salah-2': 'The Source of Peace',
        'salah-3': 'Glorification (Subhanallah)',
        'salah-4': 'Gratitude (Alhamdulillah)',
        'salah-5': 'Magnification (Allahu Akbar)',
        'salah-6': 'Ayatul Kursi (Post-Salah)',
        'salah-7': 'Universal Declaration',
        // Ramadan
        'ramadan-1': 'Moon Sighting Dua',
        'ramadan-2': 'Intention for Fasting',
        'ramadan-3': 'Dua for Breaking Fast',
        'ramadan-4': 'Praise After Iftar',
        'ramadan-5': 'Mercy of the First Ten',
        'ramadan-6': 'Pardon of the Middle Ten',
        'ramadan-7': 'Safety from the Fire',
        'ramadan-8': 'The Night of Decree',
        'ramadan-9': 'Comprehensive Goodness',
        'ramadan-10': 'Prayer for Parents',
        'ramadan-11': 'Seeking Knowledge',
        'ramadan-12': 'Guidance & Taqwa',
    }

    const getTitle = (dua, i) => {
        if (!dua) return ''

        // 1. Robbana logic: Always Return "Robbana X" (No prefix numbering)
        if (dua.category === 'robbana') {
            const rNum = dua.id.split('-')[1] || (i !== undefined ? i + 1 : '')
            return `Robbana ${rNum}`
        }

        // 2. Salawat, Ramadan, etc: Use unique title, or snippet. (No numbering as requested)
        if (dua.category === 'salawat' || dua.category === 'ramadan') {
            return UNIQUE_TITLES[dua.id] || toTitleCase(dua.category)
        }

        // 3. Fallback for others to UNIQUE_TITLES
        if (UNIQUE_TITLES[dua.id]) return UNIQUE_TITLES[dua.id]

        // 4. Final Fallback: snippet
        if (dua.transliteration) {
            return dua.transliteration.split(' ').slice(0, 5).join(' ').replace(/[,.;]$/, '') + '...'
        }

        return toTitleCase(dua.category) || 'Supplication'
    }

    // Header logic
    const getPageTitle = () => {
        if (viewMode === 'landing') return 'Library'
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') return 'Personal Duas'
        if (activeSection === 'ramadan') {
            if (viewMode === 'sublist') return 'Ramadan'
            if (activeSubSection) {
                const sec = SUB_SECTIONS.find(s => s.id === activeSubSection)
                if (sec) return sec.title
            }
            return 'Ramadan'
        }
        if (activeSection === 'salah') return 'In Prayer'

        // If we are looking at the sub-groups list, show the root category title
        if (viewMode === 'sublist') {
            const currentRoot = SECTIONS.find(s => s.id === activeSection)
            if (currentRoot) return currentRoot.title
        }

        // Detail override for ramadan
        if (viewMode === 'swipe') {
            const dua = swipeDuas[selectedIndex]

            if (activeSection === 'salawat' || activeSection === 'robbana' || activeSection === 'ramadan') {
                const currentDua = swipeDuas[selectedIndex]
                if (currentDua) {
                    return getTitle(currentDua)
                }
            }

            if (activeSection === 'custom' || activeSection === 'custom-prayers') {
                return dua?.transliteration || 'Personal Prayer'
            }

            if (dua) return getTitle(dua)
        }

        if (activeSubSection) {
            const sec = SUB_SECTIONS.find(s => s.id === activeSubSection)
            if (sec) return sec.title
        }

        if (!activeSection) return 'Supplications'

        const cat = activeSection
        if (cat === 'robbana') return '40 Robbana'
        if (cat === 'salawat') return 'Durood & Salawat'
        if (cat === 'emotions') return 'Spiritual State'
        if (cat === 'situational') return 'Life Event'
        if (cat === 'general') return 'Daily Duas'

        return toTitleCase(cat)
    }

    const getListTitle = () => {
        if (activeSubSection) {
            const sec = SUB_SECTIONS.find(s => s.id === activeSubSection)
            return sec ? sec.title : toTitleCase(activeSubSection)
        }
        return getPageTitle()
    }

    const Header = () => {
        const title = getPageTitle()
        let subtitle = 'Collections of Supplication'

        if (activeSubSection) {
            subtitle = toTitleCase(activeSubSection)
        } else if (activeSection === 'robbana') {
            subtitle = 'Prophetic Prayers'
        } else if (activeSection === 'emotions') {
            subtitle = 'Spiritual State'
        } else if (activeSection === 'situational') {
            subtitle = 'Life Event'
        } else if (activeSection === 'ramadan') {
            subtitle = 'Spiritual Season'
        } else if (activeSection === 'salah') {
            subtitle = 'Supplications in Prayer'
        }

        return (
            <div className={`sticky top-0 z-20 ${viewMode === 'landing' ? 'pb-2' : 'pb-1'}`} style={{ background: t(theme, 'surface-0') }}>
                <PageHeader
                    title={viewMode === 'list' && activeSubSection ? getListTitle() : title}
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
                                    setActiveSubSection(null) // Reset sub-section when switching main sections
                                    // Logic: Unified Daily Duas / Spiritual States flow — skipped sublist
                                    if (['general', 'emotions', 'situational', 'ramadan'].includes(s.id)) {
                                        setViewMode('list')
                                        setActiveSubSection(null)
                                    } else if (s.id === 'custom-prayers') {
                                        setViewMode('custom')
                                    } else {
                                        const fIdx = swipeDuas.findIndex(d => d.category === s.id)
                                        setSelectedIndex(fIdx !== -1 ? fIdx : 0)
                                        skippingFirstScroll.current = true
                                        setViewMode('swipe')
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
                                    <Icon size={20} />
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

    // SUB-LIST / LIST: Grouped or flat list of duas (matches DailyPage structure)
    if (viewMode === 'sublist' || viewMode === 'list') {
        const isDark = theme === 'dark'
        const title = viewMode === 'list' && activeSubSection ? getListTitle() : getPageTitle()

        // For root sections (general, emotions, situational), render grouped sections
        const renderGroupedList = () => (
            <main className="px-6 flex flex-col gap-1 mt-2 animate-fade-in">
                {(groupedSections || []).map((group, gIdx) => (
                    <div key={gIdx} className="mb-4">
                        <h4
                            className="text-[11px] font-black tracking-[0.12em] uppercase px-2 pt-4 pb-2"
                            style={{ color: t(theme, 'text-muted'), opacity: 0.5 }}
                        >
                            {group.title}
                        </h4>
                        <div className="flex flex-col gap-1.5">
                            {group.items.map((dua) => {
                                const absoluteIdx = swipeDuas.findIndex(d => d.id === dua.id)
                                return (
                                    <button
                                        key={dua.id}
                                        onClick={() => {
                                            setSelectedIndex(absoluteIdx !== -1 ? absoluteIdx : 0)
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
                                            <h4 className="text-[14px] font-semibold tracking-tight truncate" style={{ color: t(theme, 'text-primary') }}>
                                                {getTitle(dua)}
                                            </h4>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </main>
        )

        // For other views (Salawat, Robbana, or specific sub-sections), render a flat list
        const renderFlatList = () => (
            <main className="px-6 flex flex-col gap-1.5 mt-2 animate-fade-in">
                {listDuas.length === 0 ? (
                    <div className="text-center py-20 opacity-30 text-[11px] font-black tracking-widest uppercase">No supplications found</div>
                ) : (
                    listDuas.map((dua, i) => {
                        const absoluteIdx = swipeDuas.findIndex(d => d.id === dua.id)
                        return (
                            <button
                                key={dua.id}
                                onClick={() => {
                                    setSelectedIndex(absoluteIdx !== -1 ? absoluteIdx : 0)
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
                                    <h4 className="text-[14px] font-semibold tracking-tight truncate" style={{ color: t(theme, 'text-primary') }}>
                                        {getTitle(dua)}
                                    </h4>
                                </div>
                            </button>
                        )
                    })
                )}
            </main>
        )

        return (
            <div className="pb-32 min-h-screen" style={{ background: t(theme, 'surface-0'), paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {!embedded && <Header />}
                {/* For root sections (general, emotions, situational), render grouped sections */}
                {/* For other views (Salawat, Robbana, or specific sub-sections), render a flat list */}
                {(['general', 'emotions', 'situational'].includes(activeSection) && !activeSubSection) ? renderGroupedList() : renderFlatList()}
            </div>
        )
    }

    // DUALIST: Removed as requested (this was the 'third list')
    



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
                        <span className="text-[15px] font-normal tracking-tight truncate max-w-[240px]" style={{ color: t(theme, 'text-primary') }}>
                            {getPageTitle()}
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
                        <div key={`${dua?.id}-${i}`} className="w-full flex-shrink-0 snap-center flex flex-col p-6 overflow-y-auto h-full pb-40">
                            <DuaCard
                                dua={{
                                    ...dua,
                                    reference: toTitleCase(dua.reference) || 'Supplication'
                                }}
                                label=""
                                type="dua"
                                hideAudio={true}
                                hideCounter={['robbana', 'salawat', 'salah', 'general', 'emotions', 'situational'].includes(dua.category) || ['robbana', 'salawat', 'salah'].includes(activeSection)}
                                hideTags={true}
                                onDelete={dua.category === 'custom' ? () => initiateDelete(dua.id) : null}
                            />
                        </div>
                    ))}
                </div>

                {/* Mounted mini tasbeeh whenever a Dua is to be read a certain amount of times */}
                {swipeDuas[selectedIndex]?.repeat > 1 && swipeDuas[selectedIndex]?.category !== 'salah' && (
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
                {!embedded && <Header />}

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
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setSelectedIndex(i)
                                        skippingFirstScroll.current = true
                                        setViewMode('swipe')
                                    }}
                                    className="group relative flex flex-col p-8 rounded-[2rem] text-left transition-all duration-500 border hover:shadow-xl active:scale-[0.99] overflow-hidden"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        boxShadow: isDark ? 'none' : '0 10px 30px -10px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-2 w-full">
                                        <h3
                                            className="text-[20px] font-medium tracking-tight italic"
                                            style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}
                                        >
                                            {p.transliteration || 'Personal Prayer'}
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
                                </button>
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
