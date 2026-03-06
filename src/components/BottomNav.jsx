import { NavLink, useLocation } from 'react-router-dom'
import { IconGrid, IconHands, IconHeart, IconSettings, IconTasbih } from './Icons'
import { useSettings } from '../context/SettingsContext'
import { t, navGradient } from '../utils/theme'

export default function BottomNav() {
    const { theme, lastDuaPath } = useSettings()
    const { pathname } = useLocation()

    const links = [
        { to: '/', icon: IconGrid, label: 'Home' },
        { to: lastDuaPath || '/dua', icon: IconHands, label: 'Dua', subpaths: ['/library', '/praise', '/daily'] },
        { to: '/tasbih', icon: IconTasbih, label: 'Tasbih' },
        { to: '/favorites', icon: IconHeart, label: 'Favourite' },
        { to: '/settings', icon: IconSettings, label: 'Settings' },
    ]

    return (
        <nav
            id="bottom-nav"
            className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe-offset-2"
            style={{
                background: navGradient(theme),
                borderTop: `1px solid ${t(theme, 'border')}`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)',
                paddingTop: '0.5rem'
            }}
        >
            <div className="flex items-center justify-around max-w-lg mx-auto">
                {links.map(({ to, icon: Icon, label, subpaths }) => {
                    const isActive = pathname === to || (subpaths?.some(p => pathname.startsWith(p)))

                    return (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className="flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all duration-200 active:scale-95"
                            style={{
                                color: isActive ? t(theme, 'accent') : t(theme, 'text-muted'),
                                background: isActive
                                    ? (theme === 'light' ? 'rgba(138, 109, 27, 0.12)' : t(theme, 'accent-soft'))
                                    : 'transparent',
                            }}
                        >
                            <Icon size={24} className="transition-all duration-200" style={{ opacity: isActive ? 1 : 0.5 }} />
                            <span className={`text-[11px] tracking-tight leading-none transition-all duration-200 ${isActive ? 'font-black opacity-100' : 'font-medium opacity-50'}`}>
                                {label}
                            </span>
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}

