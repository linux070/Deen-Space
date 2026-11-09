import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconChevronLeft,
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
    IconMessage,
    RubElHizbBadge,
    IconUser,
    IconX,
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

    // View state: 'list', 'swipe', or 'custom'
    const [viewMode, setViewMode] = useState(() => {
        const v = searchParams.get('view')
        if (v && ['list', 'swipe', 'custom'].includes(v)) return v
        if (initialSection === 'custom-prayers') return 'custom'
        return 'list'
    })
    const [activeSection, setActiveSection] = useState(() => {
        const sec = initialSection || searchParams.get('sec')
        const validSections = ['general', 'emotions', 'situational', 'ramadan', 'robbana', 'salawat', 'salah', 'custom-prayers']
        return validSections.includes(sec) ? sec : 'general'
    })
    const [activeSubSection, setActiveSubSection] = useState(() => searchParams.get('sub'))
    const [selectedIndex, setSelectedIndex] = useState(() => {
        const idx = parseInt(searchParams.get('idx'))
        return isNaN(idx) ? 0 : idx
    })

    // Route parameter sync: when switching routes (e.g. /library/robbana -> /library/salawat -> /library/general)
    useEffect(() => {
        if (initialSection) {
            const validSections = ['general', 'emotions', 'situational', 'ramadan', 'robbana', 'salawat', 'salah', 'custom-prayers']
            if (validSections.includes(initialSection)) {
                setActiveSection(initialSection)
                if (initialSection === 'custom-prayers') {
                    setViewMode('custom')
                } else if (viewMode === 'custom') {
                    setViewMode('list')
                }
                setActiveSubSection(null)
                setSelectedIndex(0)
            }
        }
    }, [initialSection])

    // Reset view if critical state is missing - default to 'general' list
    useEffect(() => {
        if (!activeSection) {
            setActiveSection('general')
        }
        if (viewMode !== 'swipe' && viewMode !== 'custom') {
            setViewMode('list')
        }
    }, [viewMode, activeSection])

    // Scroll to top on navigation/refresh
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [viewMode, activeSection, activeSubSection])

    // Sync search params when state changes
    const [search, setSearch] = useState('')
    const [miniTasbihCount, setMiniTasbihCount] = useState(0)

    useEffect(() => {
        const params = new URLSearchParams()
        params.set('view', viewMode)
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
            if (activeSubSection === 'sneezing-yawning' || activeSubSection === 'etiquette') {
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
                if (sub.id === 'sneezing-yawning' || sub.id === 'etiquette') {
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
                    if (s.id === 'etiquette' || s.id === 'sneezing-yawning') return currentDua.tags?.includes('sneezing') || currentDua.tags?.includes('yawning')
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
            setViewMode(activeSection === 'custom' || activeSection === 'custom-prayers' ? 'custom' : 'list')
            return
        }

        if (activeSubSection) {
            setActiveSubSection(null)
            return
        }

        navigate('/dua')
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
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') return 'Personal Duas'
        if (activeSection === 'ramadan') {
            if (activeSubSection) {
                const sec = SUB_SECTIONS.find(s => s.id === activeSubSection)
                if (sec) return sec.title
            }
            return 'Ramadan'
        }
        if (activeSection === 'salah') return 'In Prayer'

        // Detail override for swiper
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

        if (!activeSection) return 'Daily Duas'

        const cat = activeSection
        if (activeSection === 'robbana') return '40 Robbana'
        if (activeSection === 'salawat') return 'Durood & Salawat'
        if (['general', 'emotions', 'situational'].includes(activeSection)) return 'Dua'

        return toTitleCase(activeSection) || 'Dua'
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
        let subtitle = 'Prophetic Traditions & Supplications'
        const isCustom = activeSection === 'custom' || activeSection === 'custom-prayers' || viewMode === 'custom'

        if (activeSubSection) {
            const sec = SUB_SECTIONS.find(s => s.id === activeSubSection)
            subtitle = sec ? `${toTitleCase(activeSection)} • ${sec.title}` : toTitleCase(activeSubSection)
        } else if (activeSection === 'robbana') {
            subtitle = '40 Quranic Prayers of the Prophets'
        } else if (activeSection === 'salawat') {
            subtitle = 'Blessings Upon Prophet Muhammad ﷺ'
        } else if (activeSection === 'emotions') {
            subtitle = 'Spiritual State & Emotional Well-being'
        } else if (activeSection === 'situational') {
            subtitle = 'Life Events & Situational Supplications'
        } else if (activeSection === 'general') {
            subtitle = 'Daily Duas & Prophetic Traditions'
        } else if (activeSection === 'ramadan') {
            subtitle = 'Spiritual Season & Fasting Supplications'
        } else if (activeSection === 'salah') {
            subtitle = 'Supplications in Prayer'
        } else if (isCustom) {
            subtitle = 'Private offline supplications & reflections'
        }

        return (
            <div className="sticky top-0 z-20 pb-1" style={{ background: t(theme, 'surface-0') }}>
                <PageHeader
                    title={viewMode === 'list' && activeSubSection ? getListTitle() : title}
                    onBack={goBack}
                    padding="px-4 sm:px-6 pt-6 pb-3"
                    sticky={false}
                    rightElement={
                        isCustom && customPrayers.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingPrayerId(null)
                                    setNewPrayer({ arabic: '', transliteration: '', translation: '', reference: '' })
                                    setShowAddModal(true)
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
                                style={{
                                    background: t(theme, 'accent'),
                                    color: isDark ? '#0c0f14' : '#ffffff',
                                }}
                            >
                                <span className="text-sm font-light leading-none">+</span>
                                <span>New</span>
                            </button>
                        ) : null
                    }
                />
            </div>
        )
    }

    const renderContent = () => {
        if (viewMode === 'list') {
            const isGrouped = ['general', 'emotions', 'situational'].includes(activeSection) && !activeSubSection
            return (
                <main className="px-4 sm:px-6 flex flex-col pb-16 mt-1 animate-fade-in max-w-3xl mx-auto w-full">
                    {/* Segmented Filter Pills for living & emotional collections */}
                    {['general', 'emotions', 'situational'].includes(activeSection) && (
                        <div
                            className="flex items-center gap-1 p-1 rounded-2xl mb-5 overflow-x-auto no-scrollbar border"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border')
                            }}
                        >
                            {[
                                { id: 'general', label: 'Daily Duas' },
                                { id: 'emotions', label: 'Spiritual State' },
                                { id: 'situational', label: 'Life Events' }
                            ].map(tab => {
                                const isCurrent = activeSection === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveSection(tab.id)
                                            setActiveSubSection(null)
                                        }}
                                        className="flex-1 min-w-[105px] py-2 px-3 text-center rounded-xl text-[12px] font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap"
                                        style={{
                                            background: isCurrent ? t(theme, 'surface-0') : 'transparent',
                                            color: isCurrent ? t(theme, 'text-primary') : t(theme, 'text-secondary'),
                                            boxShadow: isCurrent ? (isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.06)') : 'none',
                                            border: isCurrent ? `1px solid ${t(theme, 'border')}` : '1px solid transparent'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                    {isGrouped ? (
                        (groupedSections || []).map((group, gIdx) => (
                            <div key={gIdx} className="mb-6">
                                <h4
                                    className="text-[11px] font-bold tracking-[0.16em] uppercase px-2 mb-2 select-none"
                                    style={{ color: t(theme, 'text-secondary') }}
                                >
                                    {group.title}
                                </h4>
                                <div
                                    className="rounded-2xl border overflow-hidden transition-all duration-200"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                                    }}
                                >
                                    {group.items.map((dua, dIdx) => {
                                        const absoluteIdx = swipeDuas.findIndex(d => d.id === dua.id)
                                        const isLast = dIdx === group.items.length - 1
                                        const previewText = dua.transliteration || (dua.translation && dua.translation.en) || (typeof dua.translation === 'string' ? dua.translation : '')

                                        return (
                                            <button
                                                key={dua.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedIndex(absoluteIdx !== -1 ? absoluteIdx : 0)
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
                                                        {getTitle(dua)}
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

                                                {dua.repeat > 1 && (
                                                    <div className="flex items-center flex-shrink-0">
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
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        listDuas.length === 0 ? (
                            <div className="text-center py-20 text-xs font-semibold tracking-wider uppercase" style={{ color: t(theme, 'text-secondary') }}>
                                No supplications found
                            </div>
                        ) : (
                            <div
                                className="rounded-2xl border overflow-hidden mb-6 transition-all duration-200"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                    boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                                }}
                            >
                                {listDuas.map((dua, dIdx) => {
                                    const absoluteIdx = swipeDuas.findIndex(d => d.id === dua.id)
                                    const isLast = dIdx === listDuas.length - 1
                                    const previewText = dua.transliteration || (dua.translation && dua.translation.en) || (typeof dua.translation === 'string' ? dua.translation : '')
                                    const isRobbana = activeSection === 'robbana'

                                    return (
                                        <button
                                            key={dua.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedIndex(absoluteIdx !== -1 ? absoluteIdx : 0)
                                                skippingFirstScroll.current = true
                                                setViewMode('swipe')
                                            }}
                                            className="group w-full flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] active:bg-black/[0.04] cursor-pointer"
                                            style={{
                                                borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                            }}
                                        >
                                            {isRobbana && (
                                                <RubElHizbBadge
                                                    number={dIdx + 1}
                                                    size={34}
                                                    theme={theme}
                                                />
                                            )}

                                            <div className="flex-1 min-w-0 pr-3">
                                                <h4
                                                    className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                    style={{ color: t(theme, 'text-primary') }}
                                                >
                                                    {getTitle(dua, dIdx)}
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

                                            {dua.repeat > 1 && (
                                                <div className="flex items-center flex-shrink-0">
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
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )
                    )}
                </main>
            )
        }

        if (viewMode === 'swipe') {
            return (
                <div className="fixed inset-0 z-[100] flex flex-col animate-modal-slide-up" style={{ background: t(theme, 'surface-0') }}>
                    <div className="flex items-center justify-between px-6" style={{ background: t(theme, 'surface-0'), paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)', paddingBottom: '1.5rem' }}>
                        <div className="flex items-center gap-3">
                            <button onClick={goBack} className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90" style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                <IconChevronLeft size={22} />
                            </button>
                            <span className="text-[15px] font-normal tracking-tight truncate max-w-[240px]" style={{ color: t(theme, 'text-primary') }}>
                                {getPageTitle()}
                            </span>
                        </div>
                    </div>
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
                                    dua={{ ...dua, reference: toTitleCase(dua.reference) || 'Supplication' }}
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
                    {swipeDuas[selectedIndex]?.repeat > 1 && swipeDuas[selectedIndex]?.category !== 'salah' && (
                        <MiniTasbih target={swipeDuas[selectedIndex].repeat} count={miniTasbihCount} onCountChange={setMiniTasbihCount} />
                    )}
                </div>
            )
        }

        if (viewMode === 'custom') {
            return (
                <main className="px-4 sm:px-6 animate-fade-in mt-3 max-w-3xl mx-auto w-full pb-20">
                    {customPrayers.length === 0 ? (
                        /* ── Modern Minimalist Empty State ── */
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in max-w-sm mx-auto">
                            {/* Graceful Emblem */}
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 hover:scale-105 shadow-xs"
                                style={{
                                    background: t(theme, 'accent-soft'),
                                    color: t(theme, 'accent'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                }}
                            >
                                <IconUser size={28} />
                            </div>

                            {/* Poetic & Dignified Typography */}
                            <h3
                                className="text-xl sm:text-2xl font-normal tracking-tight mb-2.5"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-serif-heading)',
                                }}
                            >
                                Your Private Space
                            </h3>
                            <p
                                className="text-[13px] leading-relaxed mb-8 max-w-[280px]"
                                style={{ color: t(theme, 'text-secondary') }}
                            >
                                Record heartfelt du'as, intimate personal supplications, and spiritual notes. Stored completely offline on your device.
                            </p>

                            {/* Elevated Call-to-Action */}
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingPrayerId(null)
                                    setNewPrayer({ arabic: '', transliteration: '', translation: '', reference: '' })
                                    setShowAddModal(true)
                                }}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-semibold tracking-wide transition-all duration-200 active:scale-95 shadow-sm cursor-pointer group"
                                style={{
                                    background: t(theme, 'accent'),
                                    color: isDark ? '#0c0f14' : '#ffffff',
                                }}
                            >
                                <span className="text-base font-light leading-none group-hover:rotate-90 transition-transform duration-300">+</span>
                                <span>Add Your First Prayer</span>
                            </button>
                        </div>
                    ) : (
                        /* ── Populated State: Sleek Continuous Ledger ── */
                        <div className="flex flex-col gap-3 animate-fade-in">
                            {/* Section Header with dynamic count */}
                            <div className="flex items-center justify-between px-2 mb-1">
                                <h2
                                    className="text-[11px] font-bold tracking-[0.16em] uppercase select-none"
                                    style={{ color: t(theme, 'text-secondary') }}
                                >
                                    Saved Supplications
                                </h2>
                                <span
                                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md leading-none"
                                    style={{
                                        background: t(theme, 'surface-2'),
                                        color: t(theme, 'text-secondary'),
                                        border: `1px solid ${t(theme, 'border')}`,
                                    }}
                                >
                                    {customPrayers.length} {customPrayers.length === 1 ? 'Prayer' : 'Prayers'}
                                </span>
                            </div>

                            {/* Inset Ledger Container */}
                            <div
                                className="rounded-2xl border overflow-hidden transition-all duration-200"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                    boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                                }}
                            >
                                {customPrayers.map((p, i) => {
                                    const isLast = i === customPrayers.length - 1
                                    const previewText = p.translation || p.reference || ''
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedIndex(i)
                                                skippingFirstScroll.current = true
                                                setViewMode('swipe')
                                            }}
                                            className="group w-full flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] active:bg-black/[0.04] cursor-pointer"
                                            style={{
                                                borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                            }}
                                        >
                                            <div className="flex-1 min-w-0 pr-3">
                                                <div className="flex items-center gap-2">
                                                    <h4
                                                        className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                        style={{ color: t(theme, 'text-primary') }}
                                                    >
                                                        {p.transliteration || 'Personal Prayer'}
                                                    </h4>
                                                    {p.reference && (
                                                        <span
                                                            className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                                                            style={{
                                                                background: t(theme, 'surface-2'),
                                                                color: t(theme, 'text-secondary'),
                                                                border: `1px solid ${t(theme, 'border')}`,
                                                            }}
                                                        >
                                                            {p.reference}
                                                        </span>
                                                    )}
                                                </div>

                                                {p.arabic && (
                                                    <p
                                                        className="text-sm truncate leading-normal mt-1"
                                                        style={{
                                                            fontFamily: 'var(--font-serif-arabic)',
                                                            color: t(theme, 'accent'),
                                                            direction: 'rtl',
                                                            textAlign: 'left',
                                                        }}
                                                    >
                                                        {p.arabic}
                                                    </p>
                                                )}

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

                                            {/* Edit & Delete Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={(e) => startEditManual(p, e)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                                    style={{ color: t(theme, 'text-secondary') }}
                                                    aria-label="Edit"
                                                    title="Edit"
                                                >
                                                    <IconPencil size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => initiateDelete(p.id, e)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all opacity-75 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 active:scale-90 cursor-pointer"
                                                    style={{ color: t(theme, 'text-secondary') }}
                                                    aria-label="Delete"
                                                    title="Delete"
                                                >
                                                    <IconTrash size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </main>
            )
        }
        return null
    }

    const savePrayer = () => {
        const hasInput = Object.values(newPrayer).some(v => v.trim() !== '')
        if (!hasInput) return
        savePrayerManual(newPrayer, editingPrayerId)
        setNewPrayer({ arabic: '', transliteration: '', translation: '', reference: '' })
        setEditingPrayerId(null)
        setShowAddModal(false)
    }

    return (
        <div className="pb-32 min-h-screen" style={{ background: t(theme, 'surface-0') }}>
            {!embedded && viewMode !== 'swipe' && <Header />}
            {renderContent()}

            {/* Modals outside main scroll flow */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div
                        className="w-full max-w-sm p-6 rounded-2xl border shadow-xl animate-modal-slide-up flex flex-col items-center text-center gap-3"
                        style={{
                            background: t(theme, 'surface-0'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                            }}
                        >
                            <IconTrash size={22} />
                        </div>
                        <h3
                            className="text-base font-semibold tracking-tight"
                            style={{ color: t(theme, 'text-primary') }}
                        >
                            Delete Supplication?
                        </h3>
                        <p className="text-xs leading-relaxed max-w-[240px]" style={{ color: t(theme, 'text-secondary') }}>
                            This personal prayer will be permanently removed from your device.
                        </p>
                        <div className="flex items-center gap-2.5 w-full mt-2">
                            <button
                                type="button"
                                onClick={() => { setShowDeleteConfirm(false); setPrayerToDeleteId(null); }}
                                className="flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 cursor-pointer"
                                style={{
                                    borderColor: t(theme, 'border'),
                                    color: t(theme, 'text-primary'),
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-all active:scale-95 cursor-pointer shadow-xs"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowAddModal(false);
                    }}
                    className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in"
                >
                    <div
                        className="w-full max-w-lg rounded-2xl sm:rounded-3xl border shadow-2xl animate-modal-slide-up flex flex-col overflow-hidden"
                        style={{
                            background: t(theme, 'surface-0'),
                            borderColor: t(theme, 'border'),
                            boxShadow: isDark
                                ? '0 24px 60px -12px rgba(0, 0, 0, 0.85), 0 2px 4px rgba(255, 255, 255, 0.04)'
                                : '0 24px 60px -12px rgba(15, 23, 42, 0.18), 0 2px 4px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b"
                            style={{ borderColor: t(theme, 'border') }}
                        >
                            <div className="min-w-0 pr-3">
                                <h3
                                    className="text-xl sm:text-2xl font-normal tracking-tight"
                                    style={{
                                        color: t(theme, 'text-primary'),
                                        fontFamily: 'var(--font-serif-heading)',
                                    }}
                                >
                                    {editingPrayerId ? 'Edit Supplication' : 'New Supplication'}
                                </h3>
                                <p className="text-xs font-medium mt-1" style={{ color: t(theme, 'text-secondary') }}>
                                    Saved privately on this device. Only you can view these.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                type="button"
                                className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-all active:scale-95 cursor-pointer flex-shrink-0"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    color: t(theme, 'text-primary'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                }}
                                aria-label="Close"
                                title="Close"
                            >
                                <IconX size={15} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto max-h-[calc(85vh-160px)]">
                            {/* 1. Arabic Text Inscription (Textarea) */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold" style={{ color: t(theme, 'text-primary') }}>
                                        Arabic Text
                                    </label>
                                    <span
                                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md"
                                        style={{
                                            background: t(theme, 'surface-2'),
                                            color: t(theme, 'text-secondary'),
                                            border: `1px solid ${t(theme, 'border')}`,
                                        }}
                                    >
                                        Optional
                                    </span>
                                </div>
                                <textarea
                                    placeholder="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ..."
                                    value={newPrayer.arabic}
                                    onChange={e => setNewPrayer({ ...newPrayer, arabic: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl sm:rounded-2xl text-right outline-none transition-all resize-none text-base sm:text-lg leading-[2.1] border focus:ring-2 placeholder:text-stone-400 dark:placeholder:text-stone-400"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        color: t(theme, 'text-primary'),
                                        direction: 'rtl',
                                        fontFamily: 'var(--script-font)',
                                    }}
                                />
                            </div>

                            {/* 2. Transliteration & Reference (Responsive Grid) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {/* Transliteration */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold" style={{ color: t(theme, 'text-primary') }}>
                                            Transliteration
                                        </label>
                                        <span
                                            className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md"
                                            style={{
                                                background: t(theme, 'surface-2'),
                                                color: t(theme, 'text-secondary'),
                                                border: `1px solid ${t(theme, 'border')}`,
                                            }}
                                        >
                                            Optional
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rabbana atina fid-dunya hasanatan..."
                                        value={newPrayer.transliteration}
                                        onChange={e => setNewPrayer({ ...newPrayer, transliteration: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-all border focus:ring-2 placeholder:text-stone-400 dark:placeholder:text-stone-400"
                                        style={{
                                            background: t(theme, 'surface-1'),
                                            borderColor: t(theme, 'border'),
                                            color: t(theme, 'text-primary'),
                                        }}
                                    />
                                </div>

                                {/* Reference */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold" style={{ color: t(theme, 'text-primary') }}>
                                            Reference / Source
                                        </label>
                                        <span
                                            className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md"
                                            style={{
                                                background: t(theme, 'surface-2'),
                                                color: t(theme, 'text-secondary'),
                                                border: `1px solid ${t(theme, 'border')}`,
                                            }}
                                        >
                                            Optional
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. Surah 2:201, Sahih Muslim, or personal note"
                                        value={newPrayer.reference}
                                        onChange={e => setNewPrayer({ ...newPrayer, reference: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-all border focus:ring-2 placeholder:text-stone-400 dark:placeholder:text-stone-400"
                                        style={{
                                            background: t(theme, 'surface-1'),
                                            borderColor: t(theme, 'border'),
                                            color: t(theme, 'text-primary'),
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 3. Translation & Meaning */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold" style={{ color: t(theme, 'text-primary') }}>
                                        Translation / Notes
                                    </label>
                                    <span
                                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                                        style={{
                                            background: t(theme, 'accent-soft'),
                                            color: t(theme, 'accent'),
                                            border: `1px solid ${t(theme, 'accent')}`,
                                        }}
                                    >
                                        Required
                                    </span>
                                </div>
                                <textarea
                                    rows={2}
                                    placeholder="Write the English translation or meaning of this supplication..."
                                    value={newPrayer.translation}
                                    onChange={e => setNewPrayer({ ...newPrayer, translation: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-all resize-none border focus:ring-2 leading-relaxed placeholder:text-stone-400 dark:placeholder:text-stone-400"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        color: t(theme, 'text-primary'),
                                    }}
                                />
                            </div>
                        </div>

                        {/* Footer Action Bar */}
                        <div
                            className="p-4 sm:p-5 pt-3 border-t flex items-center justify-end gap-2.5"
                            style={{
                                borderColor: t(theme, 'border'),
                                background: t(theme, 'surface-0'),
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer border hover:opacity-90"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    borderColor: t(theme, 'border'),
                                    color: t(theme, 'text-primary'),
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={savePrayer}
                                className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                                style={{
                                    background: t(theme, 'accent'),
                                    color: isDark ? '#0c0f14' : '#ffffff',
                                    boxShadow: `0 4px 14px ${t(theme, 'accent-glow')}`,
                                }}
                            >
                                <span>{editingPrayerId ? 'Update Dua' : 'Save Dua'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}