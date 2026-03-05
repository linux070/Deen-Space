import { useState, useEffect, useCallback } from 'react'
import { t } from '../utils/theme'
import { useSettings } from '../context/SettingsContext'
import { IconRefresh } from './Icons'

export default function MiniTasbih({ target = 33, count = 0, onCountChange }) {
    const { theme } = useSettings()
    const [isVisible, setIsVisible] = useState(false)

    // Show with a slight delay for entry animation
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300)
        return () => clearTimeout(timer)
    }, [])

    const handleTap = useCallback((e) => {
        e.stopPropagation()
        if (count < target || target === 0) {
            if (navigator.vibrate) navigator.vibrate(10)
            onCountChange(count + 1)
        } else {
            if (navigator.vibrate) navigator.vibrate([20, 30, 20])
        }
    }, [count, target, onCountChange])

    const handleReset = useCallback((e) => {
        e.stopPropagation()
        if (navigator.vibrate) navigator.vibrate(20)
        onCountChange(0)
    }, [onCountChange])

    const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0
    const isDark = theme === 'dark'

    return (
        <div
            className={`fixed bottom-12 right-6 z-[110] flex flex-col items-center gap-4 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
        >
            {/* Reset Button (Small, floating above) */}
            {count > 0 && (
                <button
                    onClick={handleReset}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-xl animate-fade-in group"
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        color: t(theme, 'text-primary'),
                        border: `1px solid ${t(theme, 'border')}`
                    }}
                >
                    <IconRefresh size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
            )}

            {/* Main Tasbih Circle */}
            <button
                onClick={handleTap}
                className="relative w-14 h-14 rounded-[1.65rem] flex items-center justify-center transition-all active:scale-[0.8] hover:scale-105 shadow-2xl group overflow-visible"
                style={{
                    background: isDark ? 'rgba(30, 36, 45, 0.85)' : 'rgba(236, 230, 208, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `1.5px solid ${t(theme, 'border')}`,
                    boxShadow: isDark
                        ? '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)'
                        : '0 15px 35px rgba(138, 109, 27, 0.1), inset 0 1px 1px rgba(255,255,255,1)'
                }}
            >
                {/* Progress Ring */}
                <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] transform -rotate-90">
                    <circle
                        cx="50%" cy="50%" r="38%"
                        fill="none"
                        stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}
                        strokeWidth="3.5"
                    />
                    <circle
                        cx="50%" cy="50%" r="38%"
                        fill="none"
                        stroke={t(theme, 'accent')}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="100%"
                        strokeDashoffset={`${100 - progress}%`}
                        className="transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)"
                        style={{ filter: `drop-shadow(0 0 6px ${t(theme, 'accent')}44)` }}
                    />
                </svg>

                <div className="relative flex flex-col items-center leading-none">
                    <span className="text-[17px] font-black tabular-nums tracking-tighter" style={{ color: t(theme, 'text-primary') }}>
                        {count}
                    </span>
                    <span className="text-[7px] font-black opacity-30 uppercase tracking-tighter mt-0.5" style={{ color: t(theme, 'text-muted') }}>
                        /{target || 100}
                    </span>
                </div>
            </button>
        </div>
    )
}
