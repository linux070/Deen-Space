import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import { IconSparkles, IconX } from './Icons'

/**
 * UpdatePrompt
 *
 * Senior Engineering / High-Profile PWA Architecture:
 * - Detects background Service Worker updates on both iOS & Android standalone PWAs.
 * - Auto-checks for updates on visibilitychange (when resuming the app on iOS Safari WebClip).
 * - Periodically checks for updates every 60 minutes.
 * - Floats gracefully above the bottom navigation bar with Apple/Linear-grade glassmorphism.
 * - Single-tap seamless update via `updateServiceWorker(true)` without re-adding to home screen.
 */
export default function UpdatePrompt() {
    const { theme } = useSettings()
    const isDark = theme === 'dark'
    const [dismissed, setDismissed] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, registration) {
            if (!registration) return

            // 1. Check for update on visibility change (crucial for iOS standalone mode)
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible' && navigator.onLine) {
                    registration.update().catch(() => {})
                }
            }
            document.addEventListener('visibilitychange', handleVisibilityChange)

            // 2. Periodic background check every 60 minutes
            const interval = setInterval(() => {
                if (navigator.onLine) {
                    registration.update().catch(() => {})
                }
            }, 60 * 60 * 1000)

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange)
                clearInterval(interval)
            }
        },
        onRegisterError(error) {
            console.debug('Service Worker registration error:', error)
        },
    })

    const handleUpdate = async () => {
        setIsUpdating(true)
        try {
            await updateServiceWorker(true)
        } catch {
            // Fallback reload if SW update call fails
            window.location.reload()
        }
    }

    // Do not render if no refresh is needed or user dismissed this session
    if (!needRefresh || dismissed) {
        return null
    }

    return (
        <aside
            role="alert"
            aria-live="polite"
            className="fixed left-3 right-3 sm:left-auto sm:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] sm:bottom-24 max-w-sm sm:max-w-md z-[60] animate-modal-slide-up"
        >
            <div
                className="relative flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all"
                style={{
                    background: isDark ? 'rgba(18, 22, 28, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.35)',
                    boxShadow: isDark
                        ? '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.15)'
                        : '0 12px 36px rgba(0, 0, 0, 0.12), 0 0 20px rgba(217, 119, 6, 0.10)',
                }}
            >
                {/* Left: Glowing App Emblem with Live Indicator */}
                <div className="relative flex-shrink-0">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform"
                        style={{
                            background: t(theme, 'accent-soft'),
                            color: t(theme, 'accent'),
                            border: `1px solid ${t(theme, 'border')}`,
                        }}
                    >
                        <IconSparkles size={20} className="animate-pulse" />
                    </div>
                    {/* Live Amber Pulse Dot */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                    </span>
                </div>

                {/* Center: Contextual Copy */}
                <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                        <h4
                            className="text-[13px] sm:text-[14px] font-semibold tracking-tight leading-tight truncate"
                            style={{ color: t(theme, 'text-primary') }}
                        >
                            Update Available
                        </h4>
                    </div>
                    <p
                        className="text-[11px] sm:text-[12px] opacity-65 leading-tight truncate mt-0.5"
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        A new version of Deen Space is ready.
                    </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
                        style={{
                            background: t(theme, 'accent'),
                            color: isDark ? '#0c0f14' : '#ffffff',
                        }}
                    >
                        {isUpdating ? (
                            <>
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <span>Update</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setDismissed(true)
                            setNeedRefresh(false)
                        }}
                        aria-label="Dismiss update"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer ml-0.5"
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        <IconX size={15} />
                    </button>
                </div>
            </div>
        </aside>
    )
}
