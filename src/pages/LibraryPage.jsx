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
    IconSparkles
} from '../components/Icons'
import DuaCard from '../components/DuaCard'
import PageHeader from '../components/PageHeader'
import MiniTasbih from '../components/MiniTasbih'
import { toTitleCase } from '../utils/text'

const salawatTitles = {
    'salawat-1': 'The Ibrahimic Salawat',
    'salawat-2': 'Salutation of Peace',
    'salawat-3': 'Blessings and Mercy',
    'salawat-4': 'Blessings on the Ahlo-Bait',
    'salawat-5': 'The Unlettered Prophet',
    'salawat-6': 'Blessings of the Universe',
    'salawat-7': 'Salutation of Service',
    'salawat-8': 'The Highest Station'
}

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
        if (['situational', 'emotions', 'general', 'ramadan'].includes(initialSection)) return 'sublist'
        if (['robbana', 'salawat'].includes(initialSection)) return 'list'
        return 'swipe'
    })
    const [activeSection, setActiveSection] = useState(initialSection)
    const [activeSubSection, setActiveSubSection] = useState(null)
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
        if (viewMode === 'swipe') params.set('idx', selectedIndex)
        setSearchParams(params, { replace: true })
    }, [viewMode, selectedIndex, setSearchParams])
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
        { id: 'emotions', title: 'Spiritual State', subtitle: 'Emotional Well-being', icon: IconHeart },
        { id: 'situational', title: 'Life Event', subtitle: 'Situational Supplications', icon: IconCompass },
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
                { id: 'travel', title: 'Travel & Journey', icon: IconClock, count: sectionWideDuas.filter(d => d.category === 'travel' && !d.tags?.includes('animals')).length },
                { id: 'illness', title: 'Illness & Visiting', icon: IconInfo, count: sectionWideDuas.filter(d => d.category === 'illness').length },
                { id: 'istikhara', title: 'Istikhara & Guidance', icon: IconStar, count: sectionWideDuas.filter(d => d.category === 'istikhara').length },
                { id: 'protection', title: 'Shield & Refuge', icon: IconCompass, count: sectionWideDuas.filter(d => d.tags?.includes('protection') && (d.category === 'prophetic' || d.category === 'travel')).length },
            ]
        }
        if (activeSection === 'emotions') {
            return [
                { id: 'anxiety', title: 'Anxiety & Relief', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('anxiety')).length },
                { id: 'sadness', title: 'Sadness & Sorrow', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('sadness')).length },
                { id: 'fear', title: 'Fear & Worry', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('fear') && !d.tags?.includes('trust')).length },
                { id: 'gratitude', title: 'Gratitude & Praise', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('gratitude')).length },
                { id: 'trust', title: 'Reliance & Strength', icon: IconHeart, count: sectionWideDuas.filter(d => d.tags?.includes('trust')).length },
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
                { id: 'sneezing-yawning', title: 'Sneezing & Yawning', icon: IconSparkles, count: sectionWideDuas.filter(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning') || d.tags?.includes('animals')).length },
                { id: 'prophetic', title: 'Remembrance & Light', icon: IconStar, count: sectionWideDuas.filter(d => d.category === 'prophetic' && !d.tags?.some(t => ['sneezing', 'yawning', 'wudu', 'mosque'].includes(t))).length },
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
            if (activeSubSection === 'sneezing-yawning' || activeSubSection === 'etiquettes') {
                result = result.filter(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning') || d.tags?.includes('animals'))
            } else if (activeSection === 'emotions') {
                if (activeSubSection === 'fear') {
                    result = result.filter(d => d.tags?.includes('fear') && !d.tags?.includes('trust'))
                } else {
                    result = result.filter(d => d.tags?.includes(activeSubSection))
                }
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
                    result = result.filter(d => d.category === 'prophetic' && !d.tags?.some(t => ['sneezing', 'yawning', 'wudu', 'mosque'].includes(t)))
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

    const solahGroups = useMemo(() => {
        if (activeSection !== 'salah') return null;
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
    }, [listDuas, activeSection])

    // Final list for swiper (respects custom prayers)
    const swipeDuas = useMemo(() => {
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') {
            return customPrayers.map(p => ({
                ...p,
                arabic_text: p.arabic || '',
                category: 'custom'
            }))
        }
        // When a sub-section is active, limit swipe to that sub-section only
        if (activeSubSection && ['emotions', 'situational', 'general', 'ramadan'].includes(activeSection)) {
            return filteredDuasBase
        }
        // Swipe view uses the ENTIRE category pool
        if (['emotions', 'situational', 'general', 'ramadan'].includes(activeSection)) {
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
            if (activeSection === 'robbana' || activeSection === 'salawat') {
                setViewMode('list')
                return
            }
            if (activeSubSection) {
                setViewMode('sublist')
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
            return
        }

        if (viewMode === 'list') {
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


    // ─── Unique titles for every dua (sourced from authentic Islamic references) ───
    const UNIQUE_TITLES = {
        // Waking
        'waking-1': 'Praise Upon Waking',
        // Sleeping
        'sleeping-1': 'In Your Name I Sleep',
        'sleeping-7': 'The Three Quls',
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
        // Etiquette
        'sneezing-1': 'Upon Sneezing',
        'sneezing-2': 'Response to a Sneeze',
        'sneezing-3': 'Reply to Yarhamukallah',
        'yawning-1': 'Refuge Upon Yawning',
        'animal-1': 'Hearing an Animal at Night',
        'animal-2': 'Hearing a Rooster Crow',
        // Prophetic (General Remembrance)
        'prophetic-1': 'Firmness of Heart',
        'guidance-2': 'Seeking Guidance',
        'protection-1': 'The Comprehensive Shield',
        'parents-1': 'Mercy for Parents',
        'light-1': 'Dua for Light (Noor)',
        // Travel
        'travel-1': 'Glory of the Journey',
        'travel-2': 'Righteousness in Travel',
        'travel-3': 'Safety on the Road',
        // Illness
        'illness-1': 'Supplication for Healing',
        'illness-2': 'Visiting the Sick',
        'distress-1': 'Gratitude in Hardship',
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
        // Ramadan
        'ramadan-1': 'Sighting the Moon',
        'ramadan-2': 'Intention (Suhoor)',
        'ramadan-3': 'Breaking Fast (Iftar)',
        'ramadan-4': 'After Iftar',
        'ramadan-5': 'First 10 Days (Mercy)',
        'ramadan-6': 'Middle 10 Days (Forgiveness)',
        'ramadan-7': 'Last 10 Days (Safety)',
        'ramadan-8': 'Laylatul Qadr',
        'ramadan-9': 'World & Hereafter',
        'ramadan-10': 'For Parents',
        'ramadan-11': 'Guidance & Provision',
        'ramadan-12': 'For Knowledge',
    }

    const getTitle = (dua, i) => {
        if (!dua) return ''

        // 1. Check the unique title map first
        if (UNIQUE_TITLES[dua.id]) return UNIQUE_TITLES[dua.id]

        // 2. Salawat has its own map
        if (dua.category === 'salawat') {
            return salawatTitles[dua.id] || (i !== undefined ? (i + 1).toString() : 'Salawat')
        }

        // 3. Robbana numbered
        if (dua.category === 'robbana') return `Robbana ${i !== undefined ? i + 1 : ''}`

        // 4. Fallback: use transliteration snippet
        if (dua.transliteration) {
            return dua.transliteration.split(' ').slice(0, 5).join(' ').replace(/[,.;]$/, '') + '...'
        }

        return toTitleCase(dua.category) || 'Supplication'
    }

    // Header logic
    const getPageTitle = () => {
        if (viewMode === 'landing') return 'Library'
        if (viewMode === 'custom' || activeSection === 'custom' || activeSection === 'custom-prayers') return 'My Prayers'
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

            if (activeSection === 'robbana' || activeSection === 'salawat') {
                const currentDua = swipeDuas[selectedIndex]
                if (currentDua) {
                    const pool = swipeDuas.filter(d => d.category === currentDua.category)
                    const pIdx = pool.findIndex(d => d.id === currentDua.id)
                    if (activeSection === 'robbana') return `Robbana ${pIdx + 1}`
                    return getTitle(currentDua, pIdx)
                }
            }

            if (dua) return getTitle(dua)
        }

        if (activeSubSection) {
            const sec = SUB_SECTIONS.find(s => s.id === activeSubSection)
            if (sec) return sec.title
        }

        if (!activeSection) return 'Supplications'

        const cat = activeSection
        if (cat === 'robbana') return 'Robbana Duas'
        if (cat === 'salawat') return 'Durood & Salawat'
        if (cat === 'emotions') return 'Spiritual State'
        if (cat === 'situational') return 'Life Event'
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
                    title={(() => {
                        if (viewMode === 'swipe') {
                            const currentDua = swipeDuas[selectedIndex]
                            if (currentDua) {
                                // Find index within the current pool for secondary titles
                                const poolIdx = swipeDuas.filter(d => d.category === currentDua.category).findIndex(d => d.id === currentDua.id)
                                return getTitle(currentDua, poolIdx)
                            }
                        }
                        return title
                    })()}
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
                                    setActiveSubSection(null) // Reset sub-section when switching main sections
                                    // Logic: Unified Daily Duas / Spiritual States flow
                                    if (['general', 'emotions', 'situational', 'ramadan'].includes(s.id)) {
                                        setViewMode('sublist')
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
                                    // Enter swipe view — jump to the first dua of this sub-section within the full pool
                                    setActiveSubSection(sub.id)
                                    // Find the index of the first dua matching this sub-section in the full swipe pool
                                    const firstSubDua = (() => {
                                        if (sub.id === 'sneezing-yawning') return sectionWideDuas.find(d => d.tags?.includes('sneezing') || d.tags?.includes('yawning') || d.tags?.includes('animals'))
                                        if (activeSection === 'emotions') {
                                            if (sub.id === 'fear') return sectionWideDuas.find(d => d.tags?.includes('fear') && !d.tags?.includes('trust'))
                                            return sectionWideDuas.find(d => d.tags?.includes(sub.id))
                                        }
                                        if (activeSection === 'situational') {
                                            if (sub.id === 'protection') return sectionWideDuas.find(d => d.tags?.includes('protection') && (d.category === 'prophetic' || d.category === 'travel'))
                                            if (sub.id === 'travel') return sectionWideDuas.find(d => d.category === 'travel' && !d.tags?.includes('animals'))
                                            return sectionWideDuas.find(d => d.category === sub.id)
                                        }
                                        if (activeSection === 'general') {
                                            if (sub.id === 'prophetic') return sectionWideDuas.find(d => d.category === 'prophetic' && !d.tags?.some(t => ['sneezing', 'yawning', 'wudu', 'mosque'].includes(t)))
                                            return sectionWideDuas.find(d => d.category === sub.id)
                                        }
                                        return sectionWideDuas.find(d => d.category === sub.id)
                                    })()
                                    const jumpIdx = firstSubDua ? sectionWideDuas.indexOf(firstSubDua) : 0
                                    setSelectedIndex(jumpIdx !== -1 ? jumpIdx : 0)
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

    // DUALIST: Removed as requested (this was the 'third list')
    


    // LIST: Flat list of items (used for Salawat, Robbana, etc)
    if (viewMode === 'list') {
        const title = getPageTitle()
        return (
            <div className="pb-32 min-h-screen" style={{ background: t(theme, 'surface-0'), paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {!embedded && (
                    <div className="sticky top-0 z-20 pb-4" style={{ background: t(theme, 'surface-0') }}>
                        <PageHeader
                            title={title}
                            onBack={goBack}
                            padding="px-6 pt-10 pb-4"
                            titleSize="text-xl"
                            titleWeight={300}
                            titleSerif={false}
                            sticky={false}
                        />
                    </div>
                )}
                <main className="px-6 flex flex-col gap-2 mt-2 animate-fade-in">
                    {listDuas.map((dua, idx) => (
                        <button
                            key={dua.id}
                            onClick={() => {
                                setSelectedIndex(idx)
                                setViewMode('swipe')
                            }}
                            className="group flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-all active:scale-[0.98] hover:shadow-md"
                            style={{
                                background: t(theme, 'surface-1'),
                                border: `1px solid ${t(theme, 'border')}`,
                                boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)'
                            }}
                        >
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-[14px] relative overflow-hidden"
                                style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                <div className="absolute inset-0 opacity-[0.08]" style={{ background: t(theme, 'text-primary') }} />
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[14px] font-semibold truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                                    {getTitle(dua, idx)}
                                </h4>
                            </div>
                        </button>
                    ))}
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
                        <div key={`${dua?.id}-${i}`} className="w-full h-full flex-shrink-0 snap-center flex flex-col p-6 pb-28 overflow-y-auto">
                            <DuaCard
                                dua={{
                                    ...dua,
                                    reference: toTitleCase(dua.reference) || 'Supplication'
                                }}
                                label={(['robbana', 'salawat'].includes(dua.category) || ['robbana', 'salawat'].includes(activeSection)) ? (i + 1).toString() : getTitle(dua, i)}
                                type="dua"
                                hideAudio={dua.category === 'custom'}
                                hideCounter={['robbana', 'salawat', 'salah'].includes(dua.category) || ['robbana', 'salawat', 'salah'].includes(activeSection)}
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
