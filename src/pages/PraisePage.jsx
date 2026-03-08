import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { IconHeartFill, IconHeart, IconSearch, IconStar, IconBook, IconChevronLeft, IconChevronRight } from '../components/Icons'
import { t } from '../utils/theme'
import DuaCard from '../components/DuaCard'
import PageHeader from '../components/PageHeader'

export default function PraisePage({ duas, asma, embedded = false }) {
    const { theme } = useSettings()
    const navigate = useNavigate()
    const { toggle, isFavorite } = useFavorites()

    // View state: 'list' (names) -> 'swipe' (detail view for names)
    const [viewMode, setViewMode] = useState('list')
    const [subTab, setSubTab] = useState('names')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [search, setSearch] = useState('')

    const scrollRef = useRef(null)
    const skippingFirstScroll = useRef(false)

    // Filtered data
    const salawatDuas = useMemo(() => duas.filter(d => d.category === 'salawat'), [duas])


    const filteredNames = useMemo(() => {
        if (!search.trim()) return asma
        const q = search.toLowerCase()
        return asma.filter(n =>
            n.transliteration.toLowerCase().includes(q) ||
            n.meaning.toLowerCase().includes(q) ||
            n.arabic_name.includes(search)
        )
    }, [asma, search])

    const scrollToName = (idx) => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTo({
            left: idx * scrollRef.current.offsetWidth,
            behavior: 'smooth'
        })
        setSelectedIndex(idx)
    }

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
    const goBack = () => {
        if (search) {
            setSearch('')
            return
        }
        if (viewMode === 'swipe') {
            setViewMode('list')
            return
        }
        if (viewMode === 'list') {
            navigate('/dua')
            return
        }
    }

    // LIST: Salawat or Names
    if (viewMode === 'list') {
        const isDark = theme === 'dark'
        return (
            <div className="pb-32 min-h-screen animate-fade-in" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                {/* INLINE HEADER to prevent focus loss on re-render */}
                <div className="sticky top-0 z-20 pb-6" style={{ background: t(theme, 'surface-0') }}>
                    <PageHeader
                        title="Asma-ul-Husna"
                        onBack={goBack}
                        padding="px-6 pt-8"
                        titleSize="text-xl"
                        titleWeight={300}
                        sticky={false}
                        titleSerif={false}
                    />

                </div>

                <main className="px-6 flex flex-col gap-1.5 -mt-2">
                    <div className="flex flex-col items-center py-4 opacity-80 animate-fade-in">
                        <p
                            className="text-[1.3rem] md:text-3xl text-center mb-1 whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ fontFamily: 'var(--script-font)', color: t(theme, 'text-primary'), direction: 'rtl' }}
                        >
                            بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
                        </p>
                        <p className="text-[10px] font-bold tracking-[0.2em] opacity-40 mt-1 text-center">
                            In the Name of Allah, the Most Beneficent, the Most Merciful
                        </p>
                    </div>

                    {filteredNames.length === 0 ? (
                        <div className="text-center py-20 opacity-30 text-[11px] font-black tracking-widest">No names found</div>
                    ) : (
                        filteredNames.map((name, i) => (
                            <button
                                key={name.id}
                                onClick={() => { setSelectedIndex(i); skippingFirstScroll.current = true; setViewMode('swipe'); }}
                                className="group flex gap-3.5 items-center p-3 rounded-2xl text-left transition-all active:scale-[0.98] hover:shadow-lg"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    border: `1px solid ${t(theme, 'border')}`,
                                    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.01)'
                                }}
                            >
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-semibold text-xs relative overflow-hidden"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}>
                                    <div className="absolute inset-0 opacity-10" style={{ background: t(theme, 'text-primary') }} />
                                    {name.id}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4">
                                        <h4 className="text-[14px] font-medium text-primary truncate tracking-tight" style={{ color: t(theme, 'text-primary') }}>{name.transliteration}</h4>
                                        <span className="text-[20px] pb-1" style={{ fontFamily: 'var(--script-font)', direction: 'rtl', color: t(theme, 'text-primary') }}>{name.arabic_name}</span>
                                    </div>
                                    <p className="text-[11px] font-bold tracking-[0.02em] opacity-40 -mt-1" style={{ color: t(theme, 'text-muted') }}>
                                        {name.meaning}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </main>
            </div>
        )
    }

    // SWIPE: Detailed 99 Names
    if (viewMode === 'swipe') {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col animate-modal-slide-up" style={{ background: t(theme, 'surface-0') }}>
                {/* Header Sub-Nav */}
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
                            onClick={() => setViewMode('list')}
                            className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90"
                            style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}
                        >
                            <IconChevronLeft size={22} />
                        </button>
                        <span className="text-[15px] font-normal tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                            {filteredNames[selectedIndex]?.transliteration} {selectedIndex + 1} / {filteredNames.length}
                        </span>
                    </div>

                    <button
                        onClick={() => toggle({ id: `asma-${filteredNames[selectedIndex]?.id}`, type: 'asma' })}
                        className="w-9 h-9 flex items-center justify-center rounded-2xl transition-all active:scale-90"
                        style={{ background: t(theme, 'surface-2'), color: t(theme, 'accent') }}
                    >
                        {isFavorite(`asma-${filteredNames[selectedIndex]?.id}`) ? <IconHeartFill size={18} className="text-red-500" /> : <IconHeart size={18} />}
                    </button>
                </div>

                {/* Content */}
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
                    {filteredNames.map((name, i) => {
                        const fav = isFavorite(`asma-${name.id}`)
                        return (
                            <div key={name.id} className="w-full flex-shrink-0 snap-center flex flex-col p-8 overflow-y-auto">
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="relative group mb-12">
                                        <div className="w-52 h-52 rounded-[3.5rem] flex items-center justify-center text-6xl shadow-lg transition-transform" style={{ background: t(theme, 'surface-1'), border: `1px solid ${t(theme, 'border')}`, color: t(theme, 'accent'), fontFamily: 'var(--script-font)', direction: 'rtl' }}>
                                            {name.arabic_name}
                                        </div>
                                    </div>

                                    <h2 className="text-4xl font-black mb-2 tracking-tight" style={{ color: t(theme, 'text-primary') }}>{name.transliteration}</h2>
                                    <p className="text-lg opacity-60 italic mb-10" style={{ color: t(theme, 'text-secondary'), fontFamily: 'var(--font-serif-body)' }}>{name.meaning}</p>

                                    {name.benefit && (
                                        <div className="p-8 rounded-[2.5rem]" style={{ background: t(theme, 'surface-1'), border: `1px solid ${t(theme, 'border')}` }}>
                                            <p className="text-[10px] font-black tracking-widest mb-3 opacity-30">Benefit</p>
                                            <p className="text-sm leading-relaxed" style={{ color: t(theme, 'text-primary') }}>{name.benefit}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div >
        )
    }

    return null
}
