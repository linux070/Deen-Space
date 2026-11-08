import { NavLink, useLocation, Link } from 'react-router-dom'
import {
    IconHugeHome,
    IconHugeDua,
    IconHugeQuran,
    IconHugeTasbih,
    IconHugeSettings,
    IconQuran,
} from './Icons'
import { useSettings } from '../context/SettingsContext'
import { t, navGradient } from '../utils/theme'

export default function Navigation() {
    const { theme, lastDuaPath } = useSettings()
    const { pathname } = useLocation()

    // 5 primary tabs with modern Hugeicons stroke icons: Home -> Dua -> Qur'an -> Tasbih -> Settings
    const navItems = [
        { to: '/', icon: IconHugeHome, label: 'Home' },
        { to: lastDuaPath || '/dua', icon: IconHugeDua, label: 'Dua', subpaths: ['/library', '/praise', '/daily', '/dua'] },
        { to: '/quran', icon: IconHugeQuran, label: "Qur'an", subpaths: ['/quran'] },
        { to: '/tasbih', icon: IconHugeTasbih, label: 'Tasbih' },
        { to: '/settings', icon: IconHugeSettings, label: 'Settings', subpaths: ['/settings', '/favorites', '/bookmarks'] },
    ]

    return (
        <>
            {/* ───────────────────────────────────────────────────────────
                1. MODERN DESKTOP HEADER (Clean Minimalist Branding)
               ─────────────────────────────────────────────────────────── */}
            <header
                className="hidden md:block sticky top-0 z-40 w-full transition-all duration-300 border-b backdrop-blur-xl"
                style={{
                    background: t(theme, 'surface-0'),
                    borderColor: t(theme, 'border'),
                }}
            >
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
                    {/* Brand Emblem & Title */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group transition-transform active:scale-95"
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm"
                            style={{
                                background: t(theme, 'accent-soft'),
                                color: t(theme, 'accent'),
                                border: `1px solid ${t(theme, 'border')}`,
                            }}
                        >
                            <IconQuran size={19} />
                        </div>
                        <span
                            className="text-lg font-bold tracking-tight transition-colors group-hover:text-amber-500"
                            style={{
                                color: t(theme, 'text-primary'),
                                fontFamily: 'var(--font-serif-heading)',
                            }}
                        >
                            Deen Space
                        </span>
                    </Link>
                </div>
            </header>

            {/* ───────────────────────────────────────────────────────────
                2. MODERN PWA DOCK NAVBAR (Fixed at bottom on desktop & mobile)
               ─────────────────────────────────────────────────────────── */}
            <nav
                id="bottom-nav"
                className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: navGradient(theme),
                    borderTop: `1px solid ${t(theme, 'border')}`,
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)',
                    paddingTop: '0.4rem',
                }}
            >
                <div className="flex items-center justify-around max-w-md mx-auto px-3">
                    {navItems.map(({ to, icon: Icon, label, subpaths }) => {
                        const isActive = pathname === to || (to !== '/' && subpaths?.some(p => pathname.startsWith(p)))

                        return (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                className="group relative flex flex-col items-center justify-center gap-1 py-1 px-3 sm:px-4 rounded-2xl transition-all duration-200 active:scale-90 min-w-[56px]"
                                style={{
                                    color: isActive ? t(theme, 'accent') : t(theme, 'text-muted'),
                                }}
                            >
                                {/* Active Indicator Glow Background */}
                                <div
                                    className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                                        isActive ? 'scale-100 shadow-sm' : 'scale-90 group-hover:scale-95'
                                    }`}
                                    style={{
                                        background: isActive ? t(theme, 'accent-soft') : 'transparent',
                                    }}
                                >
                                    <Icon
                                        size={19}
                                        className="transition-transform duration-200"
                                        style={{
                                            color: isActive ? t(theme, 'accent') : 'currentColor',
                                            opacity: isActive ? 1 : 0.6,
                                        }}
                                    />
                                </div>

                                <span
                                    className={`text-[10px] tracking-tight leading-none transition-all duration-200 ${
                                        isActive ? 'font-bold opacity-100' : 'font-medium opacity-55 group-hover:opacity-85'
                                    }`}
                                    style={{
                                        color: isActive ? t(theme, 'accent') : 'currentColor',
                                    }}
                                >
                                    {label}
                                </span>
                            </NavLink>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
