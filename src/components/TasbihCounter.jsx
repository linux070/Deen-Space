import { useState, useCallback, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'

const DHIKR_OPTIONS = [
    { label: 'سُبْحَانَ اللَّهِ', text: 'SubhanAllah', target: 33 },
    { label: 'الْحَمْدُ لِلَّهِ', text: 'Alhamdulillah', target: 33 },
    { label: 'اللَّهُ أَكْبَرُ', text: 'Allahu Akbar', target: 34 },
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
        try { return parseInt(localStorage.getItem('dhikr-selected') || '0') } catch { return 0 }
    })

    const [customLabel, setCustomLabel] = useState(() => localStorage.getItem('dhikr-custom-label') || '')
    const [customTarget, setCustomTarget] = useState(() => {
        try { return parseInt(localStorage.getItem('dhikr-custom-target') || '100') } catch { return 100 }
    })

    // Store counts for all dhikrs in an object format
    const [counts, setCounts] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-all-counts')
            const parsed = saved ? JSON.parse(saved) : {}
            // Ensure all current indices are initialized
            DHIKR_OPTIONS.forEach((_, i) => {
                if (parsed[i] === undefined) parsed[i] = 0
            })
            return parsed
        } catch {
            return {}
        }
    })

    const [totalAll, setTotalAll] = useState(() => {
        try { return parseInt(localStorage.getItem('dhikr-total') || '0') } catch { return 0 }
    })

    const btnRef = useRef(null)
    const isCustom = DHIKR_OPTIONS[selected].isCustom
    const currentCount = counts[selected] || 0
    const target = isCustom ? customTarget : DHIKR_OPTIONS[selected].target
    const displayText = isCustom ? (customLabel || 'Custom Counter') : DHIKR_OPTIONS[selected].text

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

    const progress = Math.min((currentCount / target) * 100, 100)

    // Vibrant colors for maximum visibility in Light Mode (Electric Yellow)
    const ringColor = isLight ? '#FACC15' : t(theme, 'accent')
    const trackColor = isLight ? '#D4CCA4' : t(theme, 'surface-2')

    return (
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center gap-12 lg:gap-20 py-8 w-full max-w-6xl mx-auto px-6">

            {/* Selection Area */}
            <div className="w-full lg:w-[440px] flex flex-col gap-8 animate-fade-in text-left">
                {/* Dhikr selection system */}
                <div className="flex flex-col gap-6">
                    <p className="text-[12px] font-bold tracking-tight opacity-50 ml-1" style={{ color: t(theme, 'text-muted') }}>
                        Selection
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {DHIKR_OPTIONS.map((opt, i) => {
                            const isActive = selected === i
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelectDhikr(i)}
                                    className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 relative ${isActive ? 'scale-105 shadow-md' : 'opacity-60 hover:opacity-100'}`}
                                    style={{
                                        background: isActive
                                            ? (theme === 'dark' ? t(theme, 'accent') : t(theme, 'text-primary'))
                                            : t(theme, 'surface-1'),
                                        color: isActive
                                            ? (theme === 'dark' ? '#0c0f14' : '#ffffff')
                                            : t(theme, 'text-primary'),
                                        border: `1px solid ${isActive
                                            ? (theme === 'dark' ? t(theme, 'accent') : t(theme, 'text-primary'))
                                            : t(theme, 'border')
                                            }`,
                                    }}
                                >
                                    {opt.label}
                                </button>
                            )
                        })}
                    </div>

                    {isCustom && (
                        <div className="flex flex-col gap-5 p-6 rounded-3xl animate-fade-in shadow-xl" style={{
                            background: t(theme, 'surface-1'),
                            border: `1px solid ${t(theme, 'border')}`,
                            boxShadow: `0 20px 60px rgba(0,0,0,${theme === 'dark' ? '0.4' : '0.04'})`
                        }}>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-4 rounded-full" style={{ background: t(theme, 'accent') }} />
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-60">Custom Settings</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Dhikr Name</label>
                                    <input
                                        type="text"
                                        value={customLabel}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setCustomLabel(val)
                                            localStorage.setItem('dhikr-custom-label', val)
                                        }}
                                        className="bg-transparent border-b-2 py-2 outline-none text-lg font-light italic transition-all focus:border-accent"
                                        style={{ borderColor: t(theme, 'border'), color: t(theme, 'text-primary') }}
                                        placeholder="My Dhikr..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Goal</label>
                                    <input
                                        type="number"
                                        value={customTarget === 0 ? '' : customTarget}
                                        min="1"
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0
                                            setCustomTarget(val)
                                            localStorage.setItem('dhikr-custom-target', String(val))
                                        }}
                                        className="bg-transparent border-b-2 py-2 outline-none text-lg font-light transition-all focus:border-accent font-mono"
                                        style={{ borderColor: t(theme, 'border'), color: t(theme, 'text-primary') }}
                                        placeholder="Goal..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <h3
                            className="text-5xl font-light italic tracking-tight mb-2"
                            style={{
                                color: t(theme, 'text-primary'),
                                fontFamily: 'var(--font-serif-body)'
                            }}
                        >
                            {displayText}
                        </h3>
                    </div>
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
