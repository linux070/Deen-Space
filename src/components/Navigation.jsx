import { NavLink, useLocation, Link } from 'react-router-dom'
import {
    IconHugeHome,
    IconHugeDua,
    IconHugeQuran,
    IconHugeTasbih,
    IconHugeSettings,
    IconQuran,
    IconBookmark,
    IconSun,
    IconMoon,
    IconScroll,
} from './Icons'
import { useSettings } from '../context/SettingsContext'
import { t, navGradient } from '../utils/theme'

export default function Navigation() {
    const { theme, lastDuaPath, toggleTheme } = useSettings()
    const { pathname } = useLocation()

    // Desktop nav items: Home -> Qur'an -> Dua & Dhikr -> Tasbih -> Bookmarks
    const navItems = [
        { to: '/', icon: IconHugeHome, label: 'Home' },
        { to: '/quran', icon: IconHugeQuran, label: "Qur'an", subpaths: ['/quran'] },
        { to: lastDuaPath || '/dua', icon: IconHugeDua, label: 'Dua & Dhikr', subpaths: ['/library', '/praise', '/daily', '/dua'] },
        { to: '/tasbih', icon: IconHugeTasbih, label: 'Tasbih' },
        { to: '/favorites', icon: IconBookmark, label: 'Bookmarks', subpaths: ['/favorites', '/bookmarks'] },
    ]

    // Mobile dock nav items (5 primary tabs)
    const mobileNavItems = [
        { to: '/', icon: IconHugeHome, label: 'Home' },
        { to: lastDuaPath || '/dua', icon: IconHugeDua, label: 'Dua', subpaths: ['/library', '/praise', '/daily', '/dua'] },
        { to: '/quran', icon: IconHugeQuran, label: "Qur'an", subpaths: ['/quran'] },
        { to: '/tasbih', icon: IconHugeTasbih, label: 'Tasbih' },
        { to: '/settings', icon: IconHugeSettings, label: 'Settings', subpaths: ['/settings', '/favorites', '/bookmarks'] },
    ]

    const ThemeIcon = theme === 'dark' ? IconMoon : theme === 'cream' ? IconScroll : IconSun
    const themeLabel = theme === 'dark' ? 'Dark' : theme === 'cream' ? 'Sepia' : 'Light'

    return (
        <>
            {/* ───────────────────────────────────────────────────────────
                1. MODERN DESKTOP NAVBAR (Quran.com Style Header)
               ─────────────────────────────────────────────────────────── */}
            <header
                className="hidden md:block sticky top-0 z-40 w-full transition-all duration-300 border-b backdrop-blur-xl"
                style={{
                    background: t(theme, 'surface-0'),
                    borderColor: t(theme, 'border'),
                }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    {/* Brand Emblem & Title */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group transition-transform active:scale-95 flex-shrink-0"
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

                    {/* Desktop Horizontal Navigation Links */}
                    <nav className="flex items-center gap-1.5 flex-1 justify-center max-w-2xl">
                        {navItems.map(({ to, icon: Icon, label, subpaths }) => {
                            const isActive = pathname === to || (to !== '/' && subpaths?.some(p => pathname.startsWith(p)))

                            return (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={to === '/'}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 outline-none ${
                                        isActive
                                            ? 'shadow-xs font-bold'
                                            : 'opacity-65 hover:opacity-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                                    }`}
                                    style={{
                                        background: isActive ? t(theme, 'surface-2') : 'transparent',
                                        color: isActive ? t(theme, 'accent') : t(theme, 'text-primary'),
                                        border: isActive ? `1px solid ${t(theme, 'border')}` : '1px solid transparent',
                                    }}
                                >
                                    <Icon size={16} />
                                    <span>{label}</span>
                                </NavLink>
                            )
                        })}
                    </nav>

                    {/* Desktop Right Actions: Theme Toggle + Settings */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Quick Theme Toggle Pill */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 cursor-pointer hover:border-amber-500/50"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                                color: t(theme, 'text-primary'),
                            }}
                            title={`Switch theme (currently ${themeLabel})`}
                            aria-label={`Switch theme (currently ${themeLabel})`}
                        >
                            <ThemeIcon size={14} style={{ color: t(theme, 'accent') }} />
                            <span>{themeLabel}</span>
                        </button>

                        {/* Settings Link */}
                        <Link
                            to="/settings"
                            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                                pathname.startsWith('/settings')
                                    ? 'shadow-xs'
                                    : 'opacity-70 hover:opacity-100 hover:border-amber-500/50'
                            }`}
                            style={{
                                background: pathname.startsWith('/settings') ? t(theme, 'surface-2') : t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                                color: pathname.startsWith('/settings') ? t(theme, 'accent') : t(theme, 'text-primary'),
                            }}
                            title="Settings"
                            aria-label="Settings"
                        >
                            <IconHugeSettings size={18} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* ───────────────────────────────────────────────────────────
                2. MODERN PWA DOCK NAVBAR (Phone Screens Only: md:hidden)
               ─────────────────────────────────────────────────────────── */}
            <nav
                id="bottom-nav"
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
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
                    {mobileNavItems.map(({ to, icon: Icon, label, subpaths }) => {
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
