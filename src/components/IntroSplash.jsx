import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'

/**
 * Modern High-Grade WebApp Intro / Launch Splash Screen
 *
 * Sequence:
 * 1. The crescent fades in.
 * 2. The mosque and Qur'an symbol softly scales into view.
 * 3. A subtle golden glow appears.
 * 4. The Deen Space name fades in underneath.
 * 5. The intro transitions smoothly into the homepage.
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
        }, 650)
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

    // Sequence Choreography
    useEffect(() => {
        // 1. Crescent fades in (t = 80ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 1 ? 1 : s)), 80))

        // 2. Mosque & Qur'an symbol softly scales into view (t = 700ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 2 ? 2 : s)), 700))

        // 3. Subtle golden glow appears (t = 1350ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 3 ? 3 : s)), 1350))

        // 4. Deen Space name fades in underneath (t = 1900ms)
        timersRef.current.push(setTimeout(() => setStep(s => (s < 4 ? 4 : s)), 1900))

        // 5. Intro transitions smoothly into the homepage (t = 2850ms)
        timersRef.current.push(setTimeout(() => {
            finishIntro()
        }, 2850))

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
                transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: step >= 5 ? 'none' : 'auto',
            }}
        >
            {/* Step 3: Subtle Golden Ambient Background Glow */}
            <div
                className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full pointer-events-none transition-all duration-1000 ease-out"
                style={{
                    background: isDark
                        ? `radial-gradient(circle, ${t(theme, 'accent')}35 0%, ${t(theme, 'accent')}0f 45%, transparent 72%)`
                        : `radial-gradient(circle, ${t(theme, 'accent')}25 0%, ${t(theme, 'accent')}08 45%, transparent 72%)`,
                    opacity: step >= 3 && step < 5 ? 1 : 0,
                    transform: step >= 3 ? 'scale(1.25)' : 'scale(0.65)',
                    filter: 'blur(20px)',
                }}
            />

            {/* Central Brand Composition: Smoothly expands and dissolves upward on step 5 */}
            <div
                className="relative flex flex-col items-center z-10 transition-all duration-600 ease-out"
                style={{
                    transform: step >= 5 ? 'scale(1.06) translateY(-8px)' : 'scale(1) translateY(0)',
                    opacity: step >= 5 ? 0 : 1,
                    transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms ease-in',
                }}
            >
                {/* Emblem Canvas: Strictly locks to exact 750:909 aspect ratio */}
                <div
                    className="relative w-28 sm:w-36 aspect-[750/909] transition-all duration-700 ease-out"
                    style={{
                        filter: step >= 3
                            ? isDark
                                ? `drop-shadow(0 6px 20px ${t(theme, 'accent')}50) drop-shadow(0 2px 6px rgba(0,0,0,0.4))`
                                : `drop-shadow(0 6px 20px ${t(theme, 'accent')}30) drop-shadow(0 2px 4px rgba(0,0,0,0.06))`
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
                            transform: step >= 2 ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(14px)',
                            transition: 'opacity 750ms cubic-bezier(0.16, 1, 0.3, 1), transform 750ms cubic-bezier(0.16, 1, 0.3, 1)',
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
                            transform: step >= 1 ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.94)',
                            transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                    />
                </div>

                {/* Step 4: Deen Space Name Fades in Underneath */}
                <div
                    className="flex flex-col items-center text-center mt-5 sm:mt-6 transition-all duration-700 ease-out"
                    style={{
                        opacity: step >= 4 ? 1 : 0,
                        transform: step >= 4 ? 'translateY(0)' : 'translateY(12px)',
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
