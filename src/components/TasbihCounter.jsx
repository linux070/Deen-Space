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
    const isDark = theme === 'dark'
    const isLight = theme !== 'dark'

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

        let newList
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

    const progress = target > 0 ? Math.min((currentCount / target) * 100, 100) : 0
    const ringColor = t(theme, 'accent')
    const trackColor = t(theme, 'surface-2')

    return (
        <div className="flex flex-col items-center justify-start gap-4 sm:gap-6 py-2 w-full max-w-4xl mx-auto">
            {/* ── 1. Horizontal Scrollable Dhikr Pill Strip ── */}
            <div className="w-full px-4 sm:px-6">
                <div
                    className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* Standard Options */}
                    {DHIKR_OPTIONS.slice(0, -1).map((opt, i) => {
                        const isActive = selected === i
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectDhikr(i)}
                                className={`group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-200 flex-shrink-0 cursor-pointer active:scale-95 ${
                                    isActive
                                        ? 'scale-[1.02] shadow-sm'
                                        : 'opacity-75 hover:opacity-100 hover:border-amber-500/40'
                                }`}
                                style={{
                                    background: isActive ? t(theme, 'surface-1') : t(theme, 'surface-2'),
                                    borderColor: isActive ? t(theme, 'accent') : t(theme, 'border'),
                                    boxShadow: isActive ? `0 4px 14px ${t(theme, 'accent-glow')}` : 'none',
                                }}
                            >
                                <span
                                    className="text-base sm:text-lg leading-none pt-0.5"
                                    style={{
                                        color: isActive ? t(theme, 'accent') : t(theme, 'text-primary'),
                                        fontFamily: 'var(--font-serif-arabic)',
                                        fontWeight: 400,
                                    }}
                                >
                                    {opt.label}
                                </span>
                                <span
                                    className="text-[10px] sm:text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-md leading-none"
                                    style={{
                                        background: isActive ? t(theme, 'accent-soft') : t(theme, 'surface-3'),
                                        color: isActive ? t(theme, 'accent') : t(theme, 'text-muted'),
                                    }}
                                >
                                    {opt.target}×
                                </span>
                            </button>
                        )
                    })}

                    {/* Saved Custom Items */}
                    {savedCustoms.map((opt, idx) => {
                        const realIndex = DHIKR_OPTIONS.length - 1 + idx
                        const isActive = selected === realIndex
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectDhikr(realIndex)}
                                className={`group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-200 flex-shrink-0 cursor-pointer active:scale-95 ${
                                    isActive
                                        ? 'scale-[1.02] shadow-sm'
                                        : 'opacity-75 hover:opacity-100 hover:border-amber-500/40'
                                }`}
                                style={{
                                    background: isActive ? t(theme, 'surface-1') : t(theme, 'surface-2'),
                                    borderColor: isActive ? t(theme, 'accent') : t(theme, 'border'),
                                    boxShadow: isActive ? `0 4px 14px ${t(theme, 'accent-glow')}` : 'none',
                                }}
                            >
                                <span
                                    className="text-xs sm:text-sm font-medium truncate max-w-[140px]"
                                    style={{
                                        color: isActive ? t(theme, 'accent') : t(theme, 'text-primary'),
                                    }}
                                >
                                    {opt.label}
                                </span>
                                <span
                                    className="text-[10px] sm:text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-md leading-none"
                                    style={{
                                        background: isActive ? t(theme, 'accent-soft') : t(theme, 'surface-3'),
                                        color: isActive ? t(theme, 'accent') : t(theme, 'text-muted'),
                                    }}
                                >
                                    {opt.target}×
                                </span>
                            </button>
                        )
                    })}

                    {/* Add Custom Dhikr Trigger */}
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null)
                            setCustomLabel('')
                            setCustomTarget(0)
                            setIsCustomModalOpen(true)
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-dashed transition-all duration-200 flex-shrink-0 cursor-pointer active:scale-95 opacity-60 hover:opacity-100 hover:border-amber-500/60"
                        style={{
                            borderColor: t(theme, 'border'),
                            color: t(theme, 'text-muted'),
                        }}
                    >
                        <span className="text-sm font-bold" style={{ color: t(theme, 'accent') }}>+</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">Custom</span>
                    </button>
                </div>
            </div>

            {/* ── 2. Active Dhikr Sacred Header Banner ── */}
            <div className="flex flex-col items-center text-center px-4 my-1 sm:my-2 animate-fade-in" key={selected}>
                {/* Arabic title with delicate unbolded weight */}
                <p
                    className="text-3xl sm:text-4xl md:text-5xl tracking-normal mb-1 leading-relaxed select-text font-normal"
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--font-serif-arabic)',
                        direction: 'rtl',
                        fontWeight: 400,
                    }}
                >
                    {activeOpt?.label || displayText}
                </p>

                {/* Transliteration text alone, target number removed */}
                <p
                    className="text-xs sm:text-sm font-normal tracking-wide opacity-65 select-text"
                    style={{
                        color: t(theme, 'text-muted'),
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    {displayText}
                </p>

                {/* Contextual Edit & Delete controls for Custom Dhikr */}
                {activeOpt?.isSaved && (
                    <div className="flex items-center gap-2 mt-2.5 animate-fade-in">
                        <button
                            type="button"
                            onClick={(e) => startEditCustom(e, activeOpt)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium transition-all active:scale-95 hover:border-amber-500/50"
                            style={{
                                background: t(theme, 'surface-2'),
                                borderColor: t(theme, 'border'),
                                color: t(theme, 'text-secondary'),
                            }}
                        >
                            <IconPencil size={11} />
                            <span>Edit</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => initiateDelete(e, activeOpt.id)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium transition-all active:scale-95 hover:border-red-500/50 hover:text-red-400"
                            style={{
                                background: t(theme, 'surface-2'),
                                borderColor: t(theme, 'border'),
                                color: t(theme, 'text-muted'),
                            }}
                        >
                            <IconTrash size={11} />
                            <span>Delete</span>
                        </button>
                    </div>
                )}
            </div>

            {/* ── 3. Counter Hero (Former Build Exact Tap Zone & SVG) ── */}
            <div className="flex flex-col items-center justify-center animate-fade-in" style={{ animationDelay: '50ms' }}>
                <button
                    type="button"
                    onClick={handleTap}
                    disabled={currentCount >= target && target > 0}
                    className="relative w-80 h-80 md:w-[30rem] md:h-[30rem] flex items-center justify-center rounded-full transition-all duration-300 active:enabled:scale-[0.95] group overflow-hidden select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                    style={{
                        WebkitTapHighlightColor: 'transparent',
                        background: t(theme, 'surface-1'),
                        boxShadow: theme === 'dark'
                            ? '0 40px 100px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.02)'
                            : '0 30px 60px rgba(0,0,0,0.06), inset 0 2px 10px rgba(255,255,255,1)',
                        border: `1px solid ${t(theme, 'border')}`,
                        cursor: (currentCount >= target && target > 0) ? 'default' : 'pointer',
                    }}
                    aria-label="Tap to count"
                >
                    {/* Former Build SVG Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                        <circle
                            cx="50%" cy="50%" r="48%"
                            fill="none"
                            stroke={trackColor}
                            strokeWidth={isLight ? '10' : '2'}
                            className={isLight ? 'opacity-100' : 'opacity-20'}
                        />
                        <circle
                            cx="50%" cy="50%" r="48%"
                            fill="none"
                            stroke={ringColor}
                            strokeWidth={isLight ? '18' : '10'}
                            strokeLinecap="round"
                            strokeDasharray="301%"
                            strokeDashoffset={`${301 - (301 * progress) / 100}%`}
                            className="transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)"
                            style={{
                                filter: `drop-shadow(0 0 16px ${isLight ? '#EAB30855' : t(theme, 'accent-glow')})`,
                                opacity: (currentCount === 0 && !isCustom) ? 0.05 : 1,
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
                                    opacity: (currentCount >= target && target > 0) ? 0.3 : 1,
                                }}
                            >
                                {currentCount}
                            </span>
                            <span className="text-2xl md:text-3xl opacity-20 font-light" style={{ color: t(theme, 'text-primary') }}>
                                / {target}
                            </span>
                        </div>
                    </div>
                </button>

                {/* ── 4. Former Reset Action (Clean Text, No Icon, No Total Button) ── */}
                <div className="mt-6 sm:mt-8">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center justify-center px-10 py-4 sm:py-5 rounded-3xl transition-all duration-300 active:scale-95 hover:bg-surface-2"
                        style={{
                            background: t(theme, 'surface-1'),
                            color: t(theme, 'text-primary'),
                            border: `1px solid ${t(theme, 'border')}`,
                            boxShadow: `0 8px 25px rgba(0,0,0,${theme === 'dark' ? '0.2' : '0.04'})`,
                        }}
                    >
                        <span className="text-[12px] font-black tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                            Reset
                        </span>
                    </button>
                </div>
            </div>

            {/* ── 5. Custom Dhikr Modal ── */}
            {isCustomModalOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div
                        className="w-full max-w-md p-6 sm:p-8 rounded-[2rem] shadow-2xl animate-modal-slide-up border relative overflow-hidden"
                        style={{
                            background: t(theme, 'surface-0'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3
                                className="text-xl font-normal tracking-tight"
                                style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}
                            >
                                {editingId ? 'Edit Dhikr' : 'Add Custom Dhikr'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => { setIsCustomModalOpen(false); setEditingId(null); }}
                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all opacity-40 hover:opacity-100"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: t(theme, 'text-primary') }}>
                                    Dhikr Name / Arabic
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={customLabel}
                                    onChange={(e) => setCustomLabel(e.target.value)}
                                    className="border rounded-xl px-4 py-3 outline-none text-base font-medium transition-all"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        color: t(theme, 'text-primary'),
                                    }}
                                    placeholder="e.g. SubhanAllah wa bihamdihi"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: t(theme, 'text-primary') }}>
                                    Target Count
                                </label>
                                <input
                                    type="number"
                                    value={customTarget === 0 ? '' : customTarget}
                                    onChange={(e) => setCustomTarget(parseInt(e.target.value) || 0)}
                                    className="border rounded-xl px-4 py-3 outline-none text-base font-medium font-mono transition-all"
                                    style={{
                                        background: t(theme, 'surface-1'),
                                        borderColor: t(theme, 'border'),
                                        color: t(theme, 'text-primary'),
                                    }}
                                    placeholder="e.g. 33, 100"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => { saveCustom(); setIsCustomModalOpen(false); }}
                                disabled={!customLabel.trim() || customTarget <= 0}
                                className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-30 shadow-md mt-2"
                                style={{
                                    background: t(theme, 'accent'),
                                    color: isDark ? '#0c0f14' : '#ffffff',
                                }}
                            >
                                {editingId ? 'Update Dhikr' : 'Save Dhikr'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 6. Delete Confirmation Modal (Embodying App Design) ── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div
                        className="w-full max-w-sm p-6 sm:p-8 rounded-[2rem] shadow-2xl animate-modal-slide-up flex flex-col items-center text-center border"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.6)' : '0 20px 50px rgba(0,0,0,0.08)',
                        }}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}
                        >
                            <IconTrash size={24} />
                        </div>

                        <h3
                            className="text-xl font-normal tracking-tight mb-2"
                            style={{
                                color: t(theme, 'text-primary'),
                                fontFamily: 'var(--font-serif-body)',
                            }}
                        >
                            Delete Counter?
                        </h3>

                        <p
                            className="text-xs leading-relaxed opacity-60 mb-6 max-w-[240px]"
                            style={{ color: t(theme, 'text-muted') }}
                        >
                            Are you sure you want to remove this counter? This action cannot be undone.
                        </p>

                        <div className="flex items-center gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => { setShowDeleteConfirm(false); setItemToDeleteId(null); }}
                                className="flex-1 py-3 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all active:scale-[0.98]"
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
                                onClick={confirmDeleteCustom}
                                className="flex-1 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all active:scale-[0.98] shadow-sm"
                                style={{
                                    background: '#ef4444',
                                    color: '#ffffff',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
