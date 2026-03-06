import { useState, useCallback, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'

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
            // Special case: we want it to default to "Select Dhikr" (null) on fresh load/refresh
            // unless the user has explicitly interacted with it in this session.
            // But to follow the "go back to select dhikr on refresh" instruction:
            return null
        } catch { return null }
    })

    const [customLabel, setCustomLabel] = useState(() => localStorage.getItem('dhikr-custom-label') || '')
    const [customTarget, setCustomTarget] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-custom-target')
            const parsed = saved ? parseInt(saved) : 0
            // Reset to 0 if it was the old default of 100
            return (parsed === 100) ? 0 : parsed
        } catch { return 0 }
    })

    // Saved custom list
    const [savedCustoms, setSavedCustoms] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-saved-customs')
            return saved ? JSON.parse(saved) : []
        } catch { return [] }
    })


    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

    // Combined options
    const allOptions = [
        ...DHIKR_OPTIONS.slice(0, -1),
        ...savedCustoms.map(c => ({ ...c, isSaved: true })),
        DHIKR_OPTIONS[DHIKR_OPTIONS.length - 1] // Custom Counter
    ]

    // Store counts for all dhikrs in an object format
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

    const btnRef = useRef(null)
    const activeOpt = selected !== null ? allOptions[selected] : null
    const isCustom = activeOpt?.isCustom
    const currentCount = selected !== null ? (counts[selected] || 0) : 0
    const target = isCustom ? customTarget : (activeOpt?.target || 0)
    const displayText = isCustom ? (customLabel || 'Custom Counter') : (activeOpt?.text || 'Select Dhikr')

    const haptic = useCallback(() => {
        if (navigator.vibrate) navigator.vibrate(15)
    }, [])

    const handleTap = useCallback(() => {
        if (currentCount >= target && target > 0) return // Hard stop at target
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
        const newItem = {
            label: customLabel,
            text: customLabel,
            target: customTarget,
            id: Date.now()
        }
        const newList = [...savedCustoms, newItem]
        setSavedCustoms(newList)
        localStorage.setItem('dhikr-saved-customs', JSON.stringify(newList))
        setCustomLabel('')
        setCustomTarget(0)
        haptic()

        // Select the newly saved one
        const newIdx = DHIKR_OPTIONS.length - 1 + savedCustoms.length
        handleSelectDhikr(newIdx)
    }

    const removeSaved = (e, id) => {
        e.stopPropagation()
        const newList = savedCustoms.filter(c => c.id !== id)
        setSavedCustoms(newList)
        localStorage.setItem('dhikr-saved-customs', JSON.stringify(newList))
        if (selected >= allOptions.length - 1) setSelected(0)
    }

    const progress = Math.min((currentCount / target) * 100, 100)

    // Vibrant colors for maximum visibility in Light Mode (Electric Yellow)
    const ringColor = isLight ? '#FACC15' : t(theme, 'accent')
    const trackColor = isLight ? '#D4CCA4' : t(theme, 'surface-2')

    return (
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-8 lg:gap-16 py-4 w-full max-w-6xl mx-auto px-6">

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
                                className="group relative flex items-center justify-center py-6 px-4 transition-all duration-300 active:scale-95"
                            >
                                <div
                                    className={`absolute inset-0 rounded-[1.25rem] transition-all duration-500 ${isActive ? 'opacity-100 shadow-xl scale-100' : 'opacity-0 scale-95'}`}
                                    style={{
                                        background: isActive ? (isLight ? '#334155' : '#4b5563') : t(theme, 'text-primary'),
                                        boxShadow: isActive ? '0 12px 30px rgba(0,0,0,0.2)' : 'none'
                                    }}
                                />
                                <div className="flex flex-col items-center gap-1.5 relative">
                                    <span
                                        className="text-[22px] transition-all duration-300 leading-tight pt-0.5"
                                        style={{
                                            color: isActive ? '#ffffff' : t(theme, 'text-primary'),
                                            fontFamily: 'var(--font-serif-arabic)',
                                            fontWeight: isActive ? 600 : 500
                                        }}
                                    >
                                        {opt.label}
                                    </span>
                                    <span
                                        className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60 transition-colors"
                                        style={{ color: isActive ? '#ffffff' : t(theme, 'text-muted') }}
                                    >
                                        {opt.text}
                                    </span>
                                </div>
                            </button>
                        )
                    })}

                    {/* Saved Items in same grid */}
                    {savedCustoms.map((opt, idx) => {
                        const realIndex = DHIKR_OPTIONS.length - 1 + idx
                        const isActive = selected === realIndex
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleSelectDhikr(realIndex)}
                                className="group relative flex items-center justify-center py-6 px-4 transition-all duration-300 active:scale-95 border rounded-[1.25rem]"
                                style={{
                                    borderColor: isActive ? (isLight ? '#334155' : '#4b5563') : t(theme, 'border')
                                }}
                            >
                                <div
                                    className={`absolute inset-0 rounded-[1.25rem] transition-all duration-500 ${isActive ? 'opacity-100 shadow-xl scale-100' : 'opacity-0 scale-95'}`}
                                    style={{
                                        background: isActive ? (isLight ? '#334155' : '#4b5563') : 'transparent',
                                        boxShadow: isActive ? '0 12px 30px rgba(0,0,0,0.2)' : 'none'
                                    }}
                                />
                                <div className="flex flex-col items-center gap-1.5 relative w-full">
                                    <span
                                        className="text-[15px] font-bold tracking-tight transition-all duration-300 text-center"
                                        style={{ color: isActive ? '#ffffff' : t(theme, 'text-primary') }}
                                    >
                                        {opt.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-[10px] font-bold opacity-60 transition-colors"
                                            style={{ color: isActive ? '#ffffff' : t(theme, 'text-muted') }}
                                        >
                                            Goal: {opt.target}
                                        </span>

                                        <div
                                            onClick={(e) => removeSaved(e, opt.id)}
                                            className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-black/20 hover:bg-black/30 text-white' : 'opacity-40 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 text-muted'}`}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6L6 18M6 6l12 12"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })}

                    {/* Custom Counter Trigger */}
                    <button
                        onClick={() => {
                            setCustomLabel('')
                            setCustomTarget(0)
                            setIsCustomModalOpen(true)
                        }}
                        className="group flex flex-col items-center justify-center py-6 px-4 transition-all duration-300 active:scale-95"
                    >
                        <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-80 transition-opacity">
                            <span className="text-[12px] font-black uppercase tracking-[0.3em]" style={{ color: t(theme, 'text-primary') }}>
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

                {/* Custom Dhikr Reveal Form (Drops down to bottom) */}
                {isCustomModalOpen && (
                    <div className="mt-4 p-8 rounded-[2rem] shadow-xl animate-fade-in-up border group relative overflow-hidden"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                            boxShadow: isLight ? '0 15px 40px rgba(0,0,0,0.06)' : '0 20px 50px rgba(0,0,0,0.3)'
                        }}>
                        {/* Decorative Gradient Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                            style={{ background: `radial-gradient(circle at top right, ${t(theme, 'accent')}, transparent)` }} />

                        <div className="flex items-center justify-between mb-8 relative">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-medium" style={{ color: t(theme, 'text-primary'), fontFamily: 'var(--font-serif-body)' }}>Custom Counter</h3>
                            </div>
                            <button
                                onClick={() => setIsCustomModalOpen(false)}
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
                                        placeholder="7, 33, 100"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    saveCustom()
                                    setIsCustomModalOpen(false)
                                }}
                                disabled={!customLabel.trim() || customTarget <= 0}
                                className="w-full py-4 md:py-5 rounded-[1.25rem] text-[16px] font-bold transition-all active:scale-95 disabled:opacity-20 shadow-xl mt-2"
                                style={{
                                    background: t(theme, 'text-primary'),
                                    color: theme === 'dark' ? '#000000' : '#ffffff'
                                }}
                            >
                                Initialize Counter
                            </button>
                        </div>
                    </div>
                )}

                <div className="pt-2 h-20 mb-2">
                    <p
                        className="text-[42px] font-light italic tracking-tight leading-tight opacity-50"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--font-serif-body)'
                        }}
                    >
                        {displayText}
                    </p>
                </div>
            </div>
            {/* Right Column: Interaction Environment */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <button
                    onClick={handleTap}
                    disabled={currentCount >= target && target > 0}
                    className="relative w-80 h-80 md:w-[32rem] md:h-[32rem] flex items-center justify-center rounded-full transition-all duration-300 active:enabled:scale-[0.95] group overflow-hidden"
                    style={{
                        background: t(theme, 'surface-1'),
                        boxShadow: theme === 'dark'
                            ? '0 40px 100px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.02)'
                            : '0 30px 60px rgba(0,0,0,0.06), inset 0 2px 10px rgba(255,255,255,1)',
                        border: `1px solid ${t(theme, 'border')}`,
                        cursor: (currentCount >= target && target > 0) ? 'default' : 'pointer'
                    }}
                    aria-label="Tap to count"
                >
                    {/* Architectural Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        {/* Background track - High visibility in Light Mode */}
                        <circle
                            cx="50%" cy="50%" r="48%"
                            fill="none"
                            stroke={trackColor}
                            strokeWidth={isLight ? "10" : "2"}
                            className={isLight ? "opacity-100" : "opacity-20"}
                        />
                        {/* Interactive Progress Stroke - Vibrant Yellow for Light Mode */}
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
        </div>
    )
}
