import { useState, useEffect, useCallback } from 'react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'

export default function MiniTasbih({ count, target = 33, onCountChange, isVisible = true }) {
    const { theme } = useSettings()

    const handleTap = useCallback((e) => {
        e.stopPropagation()
        const next = count + 1
        onCountChange?.(next)

        // Haptic Feedback
        if (target > 0 && next % target === 0) {
            if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 80])
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
                gain.gain.setValueAtTime(0.08, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start()
                osc.stop(ctx.currentTime + 0.3)
            } catch (err) {}
        } else {
            if (navigator.vibrate) navigator.vibrate([20, 30, 20])
        }
    }, [count, target, onCountChange])

    const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0
    const isDark = theme === 'dark'
    const ringColor = t(theme, 'accent')
    const trackColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'

    return (
        <div
            className={`fixed bottom-28 right-6 z-[110] flex flex-col items-center gap-4 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
        >
            {/* Main Tasbih Circle */}
            <button
                onClick={handleTap}
                className="relative w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all active:scale-[0.85] hover:scale-105 shadow-2xl group overflow-visible select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    background: t(theme, 'surface-1'),
                    backdropFilter: 'blur(20px)',
                    border: `1.5px solid ${t(theme, 'border')}`,
                    boxShadow: isDark
                        ? '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)'
                        : '0 20px 45px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,1)'
                }}
            >
                {/* Progress Ring */}
                <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] transform -rotate-90 pointer-events-none">
                    <circle
                        cx="50%" cy="50%" r="38%"
                        fill="none"
                        stroke={trackColor}
                        strokeWidth="4.5"
                    />
                    <circle
                        cx="50%" cy="50%" r="38%"
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progress}
                        className="transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1)"
                        style={{ 
                            filter: `drop-shadow(0 0 8px ${t(theme, 'accent-glow')})`,
                            opacity: count === 0 ? 0.05 : 1
                        }}
                    />
                </svg>

                <div className="relative flex flex-col items-center leading-none mt-1 pointer-events-none">
                    <span 
                        className="text-[26px] font-black tabular-nums tracking-tighter" 
                        style={{ color: t(theme, 'text-primary') }}
                    >
                        {count}
                    </span>
                    <span 
                        className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1.5" 
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        /{target || 100}
                    </span>
                </div>
            </button>
        </div>
    )
}
