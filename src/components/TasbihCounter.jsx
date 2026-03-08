import { useState, useCallback, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import { IconPencil, IconTrash } from './Icons'

const DHIKR_OPTIONS = [
    { label: 'سُبْحَانَ اللَّهِ', text: 'SubhanAllah', target: 33 },
    { label: 'الْحَمْدُ لِلَّهِ', text: 'Alhamdulillah', target: 33 },
    { label: 'اللَّهُ أَكْبَرُ', text: 'Allahu Akbar', target: 33 },
    { label: 'أَسْتَغْفِرُ اللَّهَ', text: 'Astaghfirullah', target: 3 },
    { label: 'لَا إِلَٰهَ إِلَّا اللَّهُ', text: 'La ilaha illallah', target: 7 },
    { label: 'أَسْتَغْفِرُ اللَّهَ', text: 'Astaghfirullah', target: 100 },
    { label: 'لَا إِلَٰهَ إِلَّا اللَّهُ', text: 'La ilaha illallah', target: 100 },
    { label: 'Custom Counter', text: 'Custom Counter', target: 100, isCustom: true },
]

export default function TasbihCounter() {
    const { theme } = useSettings()
    const isLight = theme === 'light'

    const [selected, setSelected] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-selected')
            return saved !== null ? parseInt(saved) : 0
        } catch { return 0 }
    })

    const [customLabel, setCustomLabel] = useState(() => localStorage.getItem('dhikr-custom-label') || '')
    const [customTarget, setCustomTarget] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-custom-target')
            const parsed = saved ? parseInt(saved) : 0
            return (parsed === 100) ? 0 : parsed
        } catch { return 0 }
    })

    const [savedCustoms, setSavedCustoms] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-saved-customs')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })


    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [itemToDeleteId, setItemToDeleteId] = useState(null)

    const allOptions = [
        ...DHIKR_OPTIONS.slice(0, -1),
        ...savedCustoms.map(c => ({ ...c, isSaved: true })),
        DHIKR_OPTIONS[DHIKR_OPTIONS.length - 1] // Custom Counter template
    ]

    const [counts, setCounts] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-all-counts')
            const parsed = saved ? JSON.parse(saved) : {}
            return parsed
        } catch {
            return {}
        }
    })

    const [totalAll, setTotalAll] = useState(() => {
        try { return parseInt(localStorage.getItem('dhikr-total') || '0') } catch { return 0 }
    })

    const activeOpt = selected !== null ? allOptions[selected] : null
    const isCustom = activeOpt?.isCustom
    const currentCount = selected !== null ? (counts[selected] || 0) : 0
    const target = isCustom ? customTarget : (activeOpt?.target || 0)
    const displayText = isCustom ? (customLabel || 'Custom Counter') : (activeOpt?.text || 'Select Dhikr')

    const haptic = useCallback(() => {
        if (navigator.vibrate) navigator.vibrate(15)
    }, [])

    const handleTap = useCallback(() => {
        if (currentCount >= target && target > 0) return
        haptic()
        const nextCount = currentCount + 1
        const newTotal = totalAll + 1

        const newCounts = { ...counts, [selected]: nextCount }
        setCounts(newCounts)
        setTotalAll(newTotal)

        localStorage.setItem('dhikr-all-counts', JSON.stringify(newCounts))
        localStorage.setItem('dhikr-total', String(newTotal))
    }, [haptic, totalAll, currentCount, counts, selected, target])

    const handleReset = useCallback(() => {
        haptic()
        const newCounts = { ...counts, [selected]: 0 }
        setCounts(newCounts)
        localStorage.setItem('dhikr-all-counts', JSON.stringify(newCounts))
    }, [haptic, counts, selected])

    const handleSelectDhikr = (index) => {
        setSelected(index)
        localStorage.setItem('dhikr-selected', String(index))
        haptic()
    }

    const saveCustom = () => {
        if (!customLabel.trim() || customTarget <= 0) return

        let newList;
        if (editingId) {
            newList = savedCustoms.map(c => c.id === editingId ? { ...c, label: customLabel, text: customLabel, target: customTarget } : c)
        } else {
            const newItem = {
                label: customLabel,
                text: customLabel,
                target: customTarget,
                id: Date.now()
            }
            newList = [...savedCustoms, newItem]
        }

        setSavedCustoms(newList)
        localStorage.setItem('dhikr-saved-customs', JSON.stringify(newList))

        setCustomLabel('')
        setCustomTarget(0)
        setEditingId(null)
        haptic()

        if (!editingId) {
            const newIdx = DHIKR_OPTIONS.length - 1 + (newList.length - 1)
            handleSelectDhikr(newIdx)
        }
    }

    const startEditCustom = (e, item) => {
        e.stopPropagation()
        setEditingId(item.id)
        setCustomLabel(item.label)
        setCustomTarget(item.target)
        setIsCustomModalOpen(true)
    }

    const initiateDelete = (e, id) => {
        e.stopPropagation()
        setItemToDeleteId(id)
        setShowDeleteConfirm(true)
    }

    const confirmDeleteCustom = () => {
        if (!itemToDeleteId) return
        const newList = savedCustoms.filter(c => c.id !== itemToDeleteId)
        setSavedCustoms(newList)
        localStorage.setItem('dhikr-saved-customs', JSON.stringify(newList))

        if (selected >= allOptions.length - 1) setSelected(0)

        setShowDeleteConfirm(false)
        setItemToDeleteId(null)
        haptic()
    }

    const progress = Math.min((currentCount / target) * 100, 100)

    // UI REFINEMENTS: Lightened active states for a more spiritual, airy feel
    const activeBg = isLight
        ? 'rgba(234, 179, 8, 0.1)' // Soft Gold tint
        : 'rgba(255, 255, 255, 0.08)' // Subtle white mist for dark

    const activeBorder = isLight ? '#EAB308' : '#FACC15'

    const ringColor = isLight ? '#FACC15' : t(theme, 'accent')
    const trackColor = isLight ? '#F8FAFC' : t(theme, 'surface-2')

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 py-4 w-full max-w-6xl mx-auto px-6">

            {/* Selection Area */}
            <div className="w-full lg:w-[440px] flex flex-col gap-4 animate-fade-in text-left relative">
                <div className="grid grid-cols-2 gap-3">
                    {/* Standard Options */}
                    {DHIKR_OPTIONS.slice(0, -1).map((opt, i) => {
                        const isActive = selected === i
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelectDhikr(i)}
                                className="group relative flex items-center justify-center py-6 px-4 transition-all duration-300 active:scale-95 border rounded-[1.25rem] overflow-hidden"
                                style={{
                                    borderColor: isActive ? activeBorder : t(theme, 'border')
                                }}
                            >
                                <div
                                    className={`absolute inset-0 rounded-[1.25rem] transition-all duration-500 ${isActive ? 'opacity-100 shadow-sm scale-100' : 'opacity-0 scale-95'}`}
                                    style={{
                                        background: isActive ? activeBg : 'transparent'
                                    }}
                                />
                                <div className="flex flex-col items-center gap-1.5 relative">
                                    <span
                                        className="text-[22px] transition-all duration-300 leading-tight pt-0.5"
                                        style={{
                                            color: t(theme, 'text-primary'),
                                            fontFamily: 'var(--font-serif-arabic)',
                                            fontWeight: isActive ? 700 : 500
                                        }}
                                    >
                                        {opt.label}
                                    </span>
                                    <span
                                        className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60 transition-colors"
                                        style={{ color: t(theme, 'text-muted') }}
                                    >
                                        {opt.text}
                                    </span>
                                </div>
                            </button>
                        )
                    })}

                    {/* Saved Items */}
                    {savedCustoms.map((opt, idx) => {
                        const realIndex = DHIKR_OPTIONS.length - 1 + idx
                        const isActive = selected === realIndex
                        return (
                            <div
                                key={opt.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSelectDhikr(realIndex)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleSelectDhikr(realIndex); haptic(); } }}
                                className="group relative flex items-center justify-center py-6 px-4 transition-all duration-300 active:scale-95 border rounded-[1.25rem] overflow-hidden cursor-pointer outline-none"
                                style={{
                                    borderColor: isActive ? activeBorder : t(theme, 'border')
                                }}
                            >
                                <div
                                    className={`absolute inset-0 rounded-[1.25rem] transition-all duration-500 ${isActive ? 'opacity-100 shadow-sm scale-100' : 'opacity-0 scale-95'}`}
                                    style={{
                                        background: isActive ? activeBg : 'transparent'
                                    }}
                                />
                                <div className="flex flex-col items-center justify-center relative w-full h-full pt-8 pb-4">
                                    {/* Action pill - grouped unit in corner */}
                                    <div className={`absolute top-2 right-2 flex items-center gap-0.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-full p-0.5 transition-all duration-300 z-10 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                                        <button
                                            onClick={(e) => startEditCustom(e, opt)}
                                            className={`p-1.5 rounded-full transition-colors ${isActive ? 'hover:bg-black/10 text-primary' : 'hover:bg-black/5 text-muted'}`}
                                            title="Edit"
                                        >
                                            <IconPencil size={11} />
                                        </button>
                                        <div className="w-[1px] h-3 bg-black/10 dark:bg-white/10" />
                                        <button
                                            onClick={(e) => initiateDelete(e, opt.id)}
                                            className={`p-1.5 rounded-full transition-colors ${isActive ? 'hover:bg-red-500/10 text-primary hover:text-red-500' : 'hover:bg-red-500/10 text-muted hover:text-red-500'}`}
                                            title="Delete"
                                        >
                                            <IconTrash size={11} />
                                        </button>
                                    </div>

                                    <span
                                        className="text-[13px] font-semibold tracking-tight transition-all duration-300 text-center px-4 line-clamp-2 w-full leading-tight mb-1"
                                        style={{ color: t(theme, 'text-primary') }}
                                    >
                                        {opt.label}
                                    </span>
                                    <div className="flex items-center gap-1.5 opacity-40">
                                        <div className="w-1 h-1 rounded-full" style={{ background: t(theme, 'accent') }} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{opt.target}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Custom Counter Trigger */}
                    <button
                        onClick={() => {
                            setEditingId(null)
                            setCustomLabel('')
                            setCustomTarget(0)
                            setIsCustomModalOpen(true)
                        }}
                        className="group flex flex-col items-center justify-center py-6 px-4 transition-all duration-300 active:scale-95"
                    >
                        <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-80 transition-opacity">
                            <span className="text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: t(theme, 'text-primary') }}>
                                Custom
                            </span>
                            <div style={{ color: t(theme, 'accent') }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14M5 12h14"></path>
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Custom Modal */}
                {isCustomModalOpen && (
                    <div className="mt-4 p-8 rounded-[2rem] shadow-xl animate-fade-in-up border group relative overflow-hidden"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                            boxShadow: isLight ? '0 15px 40px rgba(0,0,0,0.06)' : '0 20px 50px rgba(0,0,0,0.3)'
                        }}>
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                            style={{ background: `radial-gradient(circle at top right, ${t(theme, 'accent')}, transparent)` }} />

                        <div className="flex items-center justify-between mb-8 relative">
                            <h3 className="text-xl font-medium" style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>
                                {editingId ? 'Edit Counter' : 'Custom Counter'}
                            </h3>
                            <button
                                onClick={() => { setIsCustomModalOpen(false); setEditingId(null); }}
                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all opacity-40 hover:opacity-100"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-1.5 focus-within:opacity-100 opacity-80 transition-opacity">
                                    <label className="text-[14px] font-medium opacity-80 mb-1 ml-1" style={{ color: t(theme, 'text-primary') }}>Dua Name</label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={customLabel}
                                        onChange={(e) => setCustomLabel(e.target.value)}
                                        className="bg-transparent border-b-2 py-3 outline-none text-[17px] font-medium transition-all focus:border-accent w-full"
                                        style={{ borderColor: t(theme, 'border'), color: t(theme, 'text-primary') }}
                                        placeholder="SubhanAllah"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 focus-within:opacity-100 opacity-80 transition-opacity">
                                    <label className="text-[14px] font-medium opacity-80 mb-1 ml-1" style={{ color: t(theme, 'text-primary') }}>Target</label>
                                    <input
                                        type="number"
                                        value={customTarget === 0 ? '' : customTarget}
                                        onChange={(e) => setCustomTarget(parseInt(e.target.value) || 0)}
                                        className="bg-transparent border-b-2 py-3 outline-none text-[17px] font-medium transition-all focus:border-accent font-mono w-full"
                                        style={{ borderColor: t(theme, 'border'), color: t(theme, 'text-primary') }}
                                        placeholder="33, 100"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => { saveCustom(); setIsCustomModalOpen(false); }}
                                disabled={!customLabel.trim() || customTarget <= 0}
                                className="w-full py-4 md:py-5 rounded-[1.25rem] text-[16px] font-bold transition-all active:scale-95 disabled:opacity-20 shadow-xl mt-2"
                                style={{
                                    background: t(theme, 'text-primary'),
                                    color: theme === 'dark' ? '#000000' : '#ffffff'
                                }}
                            >
                                {editingId ? 'Update Counter' : 'Initialize Counter'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Selected Dua Display - contained to prevent collision */}
                <div className="mt-8 mb-4 animate-fade-in-up" key={selected}>
                    <div className="p-6 rounded-[1.5rem] border relative overflow-hidden group"
                        style={{
                            background: t(theme, 'surface-0'),
                            borderColor: t(theme, 'border'),
                            boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.02)' : 'none'
                        }}>
                        <div className="flex flex-col gap-1 relative z-10">
                            <p
                                className="text-[24px] md:text-[28px] font-light italic tracking-tight leading-snug break-words"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-serif-body)'
                                }}
                            >
                                {displayText}
                            </p>
                        </div>
                        {/* Subtle decorative element */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.03] transition-transform duration-700 group-hover:scale-110" style={{ color: t(theme, 'accent') }}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L14.4 9.6H22L15.8 14.2L18.2 21.8L12 17.2L5.8 21.8L8.2 14.2L2 9.6H9.6L12 2Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Interaction Environment */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <button
                    onClick={handleTap}
                    disabled={currentCount >= target && target > 0}
                    className="relative w-80 h-80 md:w-[32rem] md:h-[32rem] flex items-center justify-center rounded-full transition-all duration-300 active:enabled:scale-[0.95] group overflow-hidden select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                    style={{
                        WebkitTapHighlightColor: 'transparent',
                        background: t(theme, 'surface-1'),
                        boxShadow: theme === 'dark'
                            ? '0 40px 100px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.02)'
                            : '0 30px 60px rgba(0,0,0,0.06), inset 0 2px 10px rgba(255,255,255,1)',
                        border: `1px solid ${t(theme, 'border')}`,
                        cursor: (currentCount >= target && target > 0) ? 'default' : 'pointer'
                    }}
                    aria-label="Tap to count"
                >
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="50%" cy="50%" r="48%"
                            fill="none"
                            stroke={trackColor}
                            strokeWidth={isLight ? "10" : "2"}
                            className={isLight ? "opacity-100" : "opacity-20"}
                        />
                        <circle
                            cx="50%" cy="50%" r="48%"
                            fill="none"
                            stroke={ringColor}
                            strokeWidth={isLight ? "18" : "10"}
                            strokeLinecap="round"
                            strokeDasharray="301%"
                            strokeDashoffset={`${301 - (301 * progress) / 100}%`}
                            className="transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)"
                            style={{
                                filter: `drop-shadow(0 0 16px ${isLight ? '#EAB30855' : t(theme, 'accent-glow')})`,
                                opacity: (currentCount === 0 && !isCustom) ? 0.05 : 1
                            }}
                        />
                    </svg>

                    <div className="relative flex flex-col items-center gap-2 pointer-events-none">
                        <div className="flex items-baseline gap-1">
                            <span
                                className="text-8xl md:text-[11rem] font-light tabular-nums leading-none"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-serif-body)',
                                    opacity: (currentCount >= target && target > 0) ? 0.3 : 1
                                }}
                            >
                                {currentCount}
                            </span>
                            <span className="text-2xl md:text-3xl opacity-20 font-light" style={{ color: t(theme, 'text-primary') }}>
                                / {target}
                            </span>
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-[0.618em] opacity-30 mt-4">
                            {(currentCount >= target && target > 0) ? 'Target Reached' : 'Tap to Count'}
                        </p>
                    </div>
                </button>

                {/* Reset Action */}
                <button
                    onClick={handleReset}
                    className="flex items-center justify-center px-10 py-5 rounded-3xl transition-all duration-300 active:scale-95 hover:bg-surface-2"
                    style={{
                        background: t(theme, 'surface-1'),
                        color: t(theme, 'text-primary'),
                        border: `1px solid ${t(theme, 'border')}`,
                        boxShadow: `0 8px 25px rgba(0,0,0,${theme === 'dark' ? '0.2' : '0.04'})`
                    }}
                >
                    <span className="text-[12px] font-black tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Reset</span>
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-sm p-10 rounded-[3rem] shadow-2xl animate-modal-slide-up flex flex-col items-center text-center"
                        style={{ background: t(theme, 'surface-0'), border: `1px solid ${t(theme, 'border')}` }}>

                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8 bg-black/5"
                            style={{
                                background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                color: '#ef4444'
                            }}>
                            <IconTrash size={32} />
                        </div>

                        <h3 className="text-[24px] font-medium tracking-tight mb-4 italic"
                            style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>
                            Delete Counter?
                        </h3>

                        <p className="text-[14px] leading-relaxed opacity-50 mb-10 max-w-[240px]">
                            Are you sure you want to remove this counter from your list? This action cannot be undone.
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={confirmDeleteCustom}
                                className="w-full py-4 rounded-full font-bold text-[12px] tracking-[0.1em] transition-all active:scale-[0.98]"
                                style={{ background: '#ef4444', color: '#ffffff' }}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setItemToDeleteId(null); }}
                                className="w-full py-4 rounded-full font-bold text-[12px] tracking-[0.1em] uppercase transition-all active:scale-[0.98] border"
                                style={{
                                    background: 'transparent',
                                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
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
