import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'

/**
 * Modern High-Grade WebApp Intro / Launch Splash Screen
 *
 * Sequence:
 * 1. The crescent fades in (t = 150ms)
 * 2. The mosque and Qur'an symbol softly scales into view (t = 1100ms)
 * 3. A subtle golden glow appears (t = 2100ms)
 * 4. The Deen Space name fades in underneath (t = 2900ms)
 * 5. Full emblem contemplation window (~1.7s)
 * 6. The intro transitions smoothly into the homepage (t = 4600ms)
 */
export default function IntroSplash({ onComplete }) {
    const { theme } = useSettings()
    const isDark = theme === 'dark'

    // Step state: 0 = start, 1 = crescent, 2 = symbol, 3 = glow, 4 = title, 5 = transitioning out
    const [step, setStep] = useState(0)
    const completedRef = useRef(false)
    const timersRef = useRef([])

    const clearAllTimers = () => {
        timersRef.current.forEach(clearTimeout)
        timersRef.current = []
    }

    const finishIntro = () => {
        if (completedRef.current) return
        completedRef.current = true
        clearAllTimers()
        setStep(5) // Start smooth cinematic crossfade

        setTimeout(() => {
            if (onComplete) onComplete()
        }, 750)
    }

    // Lock body scroll and guarantee top position while intro plays
    useEffect(() => {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.scrollTo(0, 0)

        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [])

    // Sequence Choreography with deliberate, contemplative pacing
    useEffect(() => {
        // 1. Crescent fades in (t = 150ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 1 ? 1 : s)), 150))

        // 2. Mosque & Qur'an symbol softly scales into view (t = 1100ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 2 ? 2 : s)), 1100))

        // 3. Subtle golden glow appears (t = 2100ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 3 ? 3 : s)), 2100))

        // 4. Deen Space name fades in underneath (t = 2900ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 4 ? 4 : s)), 2900))

        // 5. Intro transitions smoothly into the homepage (t = 4600ms)
        timersRef.current.push(setTimeout(() => {
            finishIntro()
        }, 4600))

        return () => {
            clearAllTimers()
        }
    }, [])

    return (
        <div
            onClick={finishIntro}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') finishIntro()
            }}
            aria-label="Deen Space Intro. Tap anywhere to enter."
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
            style={{
                background: t(theme, 'surface-0'),
                opacity: step >= 5 ? 0 : 1,
                transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: step >= 5 ? 'none' : 'auto',
            }}
        >
            {/* Step 3: Subtle Golden Ambient Background Glow */}
            <div
                className="absolute w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full pointer-events-none transition-all duration-1200 ease-out"
                style={{
                    background: isDark
                        ? `radial-gradient(circle, ${t(theme, 'accent')}38 0%, ${t(theme, 'accent')}10 45%, transparent 72%)`
                        : `radial-gradient(circle, ${t(theme, 'accent')}28 0%, ${t(theme, 'accent')}0a 45%, transparent 72%)`,
                    opacity: step >= 3 && step < 5 ? 1 : 0,
                    transform: step >= 3 ? 'scale(1.28)' : 'scale(0.65)',
                    filter: 'blur(22px)',
                }}
            />

            {/* Central Brand Composition: Smoothly expands and dissolves upward on step 5 */}
            <div
                className="relative flex flex-col items-center z-10 transition-all duration-700 ease-out"
                style={{
                    transform: step >= 5 ? 'scale(1.06) translateY(-8px)' : 'scale(1) translateY(0)',
                    opacity: step >= 5 ? 0 : 1,
                    transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1), opacity 550ms ease-in',
                }}
            >
                {/* Emblem Canvas: Strictly locks to exact 750:909 aspect ratio */}
                <div
                    className="relative w-32 sm:w-40 aspect-[750/909] transition-all duration-800 ease-out"
                    style={{
                        filter: step >= 3
                            ? isDark
                                ? `drop-shadow(0 8px 24px ${t(theme, 'accent')}55) drop-shadow(0 2px 6px rgba(0,0,0,0.4))`
                                : `drop-shadow(0 8px 24px ${t(theme, 'accent')}35) drop-shadow(0 2px 4px rgba(0,0,0,0.06))`
                            : 'none',
                    }}
                >
                    {/* Step 2: Mosque and Qur'an Symbol (scales and fades softly into view) */}
                    <img
                        src="/deen-space-symbol.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        style={{
                            opacity: step >= 2 ? 1 : 0,
                            transform: step >= 2 ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(16px)',
                            transition: 'opacity 900ms cubic-bezier(0.16, 1, 0.3, 1), transform 900ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    />

                    {/* Step 1: The Crescent Moon (fades in gracefully from top) */}
                    <img
                        src="/deen-space-crescent.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        style={{
                            opacity: step >= 1 ? 1 : 0,
                            transform: step >= 1 ? 'translateY(0) scale(1)' : 'translateY(-18px) scale(0.93)',
                            transition: 'opacity 850ms cubic-bezier(0.16, 1, 0.3, 1), transform 850ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    />
                </div>

                {/* Step 4: Deen Space Name Fades in Underneath */}
                <div
                    className="flex flex-col items-center text-center mt-6 transition-all duration-800 ease-out"
                    style={{
                        opacity: step >= 4 ? 1 : 0,
                        transform: step >= 4 ? 'translateY(0)' : 'translateY(14px)',
                        transition: 'opacity 800ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                >
                    <h1
                        className="text-2xl sm:text-[28px] font-normal tracking-tight"
                        style={{
                            fontFamily: 'var(--font-serif-heading)',
                            color: t(theme, 'text-primary'),
                        }}
                    >
                        Deen Space
                    </h1>
                </div>
            </div>
        </div>
    )
}
