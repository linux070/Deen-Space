import { useState, useEffect, useCallback, useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import { IconUpdate, IconX } from './Icons'

// Injected by Vite at build time
const LOCAL_BUILD_TIME = typeof __APP_BUILD_TIME__ !== 'undefined' ? Number(__APP_BUILD_TIME__) : 0
const LOCAL_APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? String(__APP_VERSION__) : '1.3.0'

/**
 * UpdatePrompt
 *
 * Commercial PWA Grade Architecture (inspired by Twitter Lite, Lagos Life, Linear):
 * - Dual-Engine Update Detection:
 *     Engine A: Live Build Beacon (`/version.json`) micro-check with zero caching.
 *     Engine B: Workbox Service Worker bytecode lifecycle (`needRefresh` + `SKIP_WAITING`).
 * - Universal Wakeup Triggers:
 *     1. 'online' event: Fires immediately when mobile data / Wi-Fi is toggled on.
 *     2. 'pageshow' event: Fires when iOS WebKit container unfreezes from memory.
 *     3. 'visibilitychange' event: Fires on app unlock or tab switch.
 *     4. Initial app mount check + periodic 5-minute background polling.
 * - Single-Tap Instant Upgrade:
 *     Flushes stale caches and applies new version in < 1s without re-adding to home screen.
 */
export default function UpdatePrompt() {
    const { theme } = useSettings()
    const isDark = theme === 'dark'
    const [hasUpdate, setHasUpdate] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const swRegistrationRef = useRef(null)
    const lastCheckRef = useRef(0)

    // ── Workbox Service Worker Hook ──
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, registration) {
            swRegistrationRef.current = registration
        },
        onRegisterError(error) {
            console.debug('[SW] Registration error:', error)
        },
    })

    // Sync Workbox needRefresh with hasUpdate
    useEffect(() => {
        if (needRefresh) {
            setHasUpdate(true)
        }
    }, [needRefresh])

    // ── Micro-Fetch Build Beacon (/version.json) ──
    const checkVersionBeacon = useCallback(async () => {
        // Prevent duplicate checks within 5 seconds
        const now = Date.now()
        if (now - lastCheckRef.current < 5000) return
        lastCheckRef.current = now

        if (!navigator.onLine) return

        try {
            // Trigger parallel Service Worker check
            if (swRegistrationRef.current) {
                swRegistrationRef.current.update().catch(() => {})
            }

            // Fetch live version beacon from server with cache-busting
            const response = await fetch(`/version.json?t=${now}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
            })

            if (!response.ok) return

            const serverMeta = await response.json()
            if (!serverMeta) return

            const serverTime = Number(serverMeta.builtAt || 0)
            const serverVer = String(serverMeta.version || '')

            // If server has a newer build timestamp or different version
            if (serverTime > LOCAL_BUILD_TIME || (serverVer && serverVer !== LOCAL_APP_VERSION)) {
                setHasUpdate(true)
            }
        } catch {
            // Network failure or offline — silent fallback
        }
    }, [])

    // ── Bind Universal Wakeup Triggers ──
    useEffect(() => {
        // 1. Initial check on mount
        checkVersionBeacon()

        // 2. Data turned ON (mobile data or Wi-Fi connected)
        const handleOnline = () => {
            checkVersionBeacon()
        }

        // 3. iOS standalone WebKit container unfreeze
        const handlePageShow = () => {
            checkVersionBeacon()
        }

        // 4. App unlocked or switched back into foreground
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkVersionBeacon()
            }
        }

        // 5. Window focus
        const handleFocus = () => {
            checkVersionBeacon()
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('pageshow', handlePageShow)
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)

        // 6. Periodic background check every 5 minutes while active
        const interval = setInterval(() => {
            checkVersionBeacon()
        }, 5 * 60 * 1000)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('pageshow', handlePageShow)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
            clearInterval(interval)
        }
    }, [checkVersionBeacon])

    // ── Single-Tap Clean Upgrade ──
    const handleUpdate = async () => {
        setIsUpdating(true)
        try {
            // 1. Clear old cache buckets so fresh assets load immediately
            if ('caches' in window) {
                try {
                    const cacheKeys = await caches.keys()
                    await Promise.all(cacheKeys.map(key => caches.delete(key)))
                } catch {}
            }

            // 2. Tell waiting SW to activate
            if (updateServiceWorker) {
                await updateServiceWorker(true)
            }
        } catch {
            // Fallback hard reload
        }

        // 3. Reload with cache-busting param
        const targetUrl = new URL(window.location.href)
        targetUrl.searchParams.set('reload', Date.now().toString())
        window.location.replace(targetUrl.toString())
    }

    if (!hasUpdate || dismissed) {
        return null
    }

    return (
        <aside
            role="alert"
            aria-live="polite"
            className="fixed left-3 right-3 sm:left-auto sm:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] sm:bottom-24 max-w-sm sm:max-w-md z-[60] animate-modal-slide-up"
        >
            <div
                className="relative flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border shadow-xl backdrop-blur-xl transition-all"
                style={{
                    background: isDark ? 'rgba(18, 22, 28, 0.95)' : 'rgba(255, 255, 255, 0.97)',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.30)',
                    boxShadow: isDark
                        ? '0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 0 16px rgba(245, 158, 11, 0.12)'
                        : '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 0 16px rgba(217, 119, 6, 0.08)',
                }}
            >
                {/* Left: Clean Precision Update Emblem */}
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform shadow-xs"
                    style={{
                        background: t(theme, 'accent-soft'),
                        color: t(theme, 'accent'),
                        border: `1px solid ${t(theme, 'border')}`,
                    }}
                >
                    <IconUpdate size={16} />
                </div>

                {/* Center: Clean Title */}
                <div className="flex-1 min-w-0 pr-1">
                    <h4
                        className="text-[13px] sm:text-[14px] font-semibold tracking-tight leading-none truncate"
                        style={{ color: t(theme, 'text-primary') }}
                    >
                        Update Available
                    </h4>
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
                            <span>Update Now</span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setDismissed(true)
                            setNeedRefresh(false)
                        }}
                        aria-label="Dismiss update"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        <IconX size={14} />
                    </button>
                </div>
            </div>
        </aside>
    )
}
