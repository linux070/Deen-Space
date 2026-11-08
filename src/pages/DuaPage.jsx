import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconSun,
    IconHeart,
    IconCompass,
    IconBook,
    IconStar,
    IconNinetyNine,
    IconFlower,
    IconCrescent,
    IconUser,
    IconChevronRight,
} from '../components/Icons'
import PageHeader from '../components/PageHeader'

export default function DuaPage() {
    const { theme } = useSettings()
    const navigate = useNavigate()
    const isDark = theme === 'dark'

    // Read custom prayers count
    const customCount = useMemo(() => {
        try {
            const list = JSON.parse(localStorage.getItem('user-custom-prayers') || '[]')
            return Array.isArray(list) ? list.length : 0
        } catch {
            return 0
        }
    }, [])

    // ── 3 Curated Groups linking directly to corresponding main duas (No intermediate Image 2 sub-duas screen) ──
    const GROUPS = [
        {
            title: 'Prophetic & Daily Supplications:',
            items: [
                {
                    id: 'daily-duas',
                    title: 'Daily Duas',
                    subtitle: 'Prophetic traditions for morning, meals, home & living',
                    badge: 'Daily',
                    icon: IconSun,
                    action: () => navigate('/library/general'),
                },
                {
                    id: 'emotions',
                    title: 'Spiritual State',
                    subtitle: 'Supplications for anxiety, sorrow, gratitude & patience',
                    badge: 'Emotions',
                    icon: IconHeart,
                    action: () => navigate('/library/emotions'),
                },
                {
                    id: 'situational',
                    title: 'Life Events',
                    subtitle: 'Supplications for travel, illness, protection & milestones',
                    badge: 'Situations',
                    icon: IconCompass,
                    action: () => navigate('/library/situational'),
                },
                {
                    id: 'daily',
                    title: 'Daily Guidance',
                    subtitle: 'Morning & evening adhkar, solah & remembrance',
                    badge: 'Adhkar',
                    icon: IconBook,
                    action: () => {
                        const saved = localStorage.getItem('last-daily-category')
                        navigate(saved ? `/daily/${saved}` : '/daily')
                    },
                },
                {
                    id: 'robbana',
                    title: '40 Robbana',
                    subtitle: 'Direct Quranic prayers of the Prophets',
                    badge: '40 Verses',
                    icon: IconStar,
                    action: () => navigate('/library/robbana'),
                },
            ],
        },
        {
            title: 'Devotion :',
            items: [
                {
                    id: 'names',
                    title: 'Asma-ul-Husna',
                    subtitle: 'The 99 Beautiful Names & attributes of Allah',
                    badge: '99 Names',
                    icon: IconNinetyNine,
                    action: () => navigate('/praise'),
                },
                {
                    id: 'salawat',
                    title: 'Salawat',
                    subtitle: 'Prophetic blessings upon Prophet Muhammad ﷺ',
                    badge: 'Blessings',
                    icon: IconFlower,
                    action: () => navigate('/library/salawat'),
                },
                {
                    id: 'ramadan',
                    title: 'Ramadan Special',
                    subtitle: 'Supplications for fasting, suhoor & Laylat al-Qadr',
                    badge: 'Fasting',
                    icon: IconCrescent,
                    action: () => navigate('/library/ramadan'),
                },
            ],
        },
        {
            title: 'Personal :',
            items: [
                {
                    id: 'personal',
                    title: 'Personal Prayers',
                    subtitle: 'Your private offline supplications & intimate notes',
                    badge: customCount > 0 ? `${customCount} Saved` : 'Private',
                    icon: IconUser,
                    action: () => navigate('/library/custom-prayers'),
                },
            ],
        },
    ]

    return (
        <div
            className="pb-36 flex flex-col gap-5 max-w-xl md:max-w-2xl mx-auto px-4 sm:px-6"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
        >
            {/* ── Editorial Header ── */}
            <header className="flex flex-col gap-1 animate-fade-in pt-1">
                <h1
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--font-serif-heading)',
                        fontSize: 'clamp(1.85rem, 5.5vw, 2.75rem)',
                        fontWeight: 400,
                        lineHeight: 1.15,
                        letterSpacing: '-0.025em',
                    }}
                >
                    Dhikr & Dua
                </h1>
                <p
                    className="text-xs sm:text-sm opacity-60 font-medium"
                    style={{ color: t(theme, 'text-muted') }}
                >
                    Collections of Supplication
                </p>
            </header>

            {/* ── Curated Grouped Inset Sections (No Hero Card) ── */}
            <main className="flex flex-col gap-6 animate-fade-in mt-1">
                {GROUPS.map((group, gIdx) => (
                    <section key={gIdx}>
                        {/* Section Header */}
                        <h2
                            className="text-[12px] font-bold uppercase tracking-[0.18em] px-2 mb-2.5 select-none opacity-50"
                            style={{ color: t(theme, 'text-muted') }}
                        >
                            {group.title}
                        </h2>

                        {/* Continuous Inset Container with Hairline Dividers */}
                        <div
                            className="rounded-2xl border overflow-hidden transition-all duration-200"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                                boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.015)',
                            }}
                        >
                            {group.items.map((cat, idx) => {
                                const Icon = cat.icon
                                const isLast = idx === group.items.length - 1

                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={cat.action}
                                        className="group w-full flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.025] active:bg-black/[0.04] cursor-pointer"
                                        style={{
                                            borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                        }}
                                    >
                                        {/* Left: Icon Emblem + Titles */}
                                        <div className="flex items-center gap-3.5 min-w-0 pr-3 flex-1">
                                            <div
                                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 shadow-xs"
                                                style={{
                                                    background: t(theme, 'accent-soft'),
                                                    color: t(theme, 'accent'),
                                                    border: `1px solid ${t(theme, 'border')}`,
                                                }}
                                            >
                                                <Icon size={19} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3
                                                        className="text-[14px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                        style={{ color: t(theme, 'text-primary') }}
                                                    >
                                                        {cat.title}
                                                    </h3>
                                                </div>
                                                <p
                                                    className="text-[12px] opacity-60 truncate leading-tight mt-0.5"
                                                    style={{ color: t(theme, 'text-muted') }}
                                                >
                                                    {cat.subtitle}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Badge Pill + Trailing Chevron */}
                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                            <span
                                                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md leading-none"
                                                style={{
                                                    background: t(theme, 'surface-2'),
                                                    color: t(theme, 'accent'),
                                                    border: `1px solid ${t(theme, 'border')}`,
                                                }}
                                            >
                                                {cat.badge}
                                            </span>

                                            <IconChevronRight
                                                size={15}
                                                className="opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                                                style={{ color: t(theme, 'text-primary') }}
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    )
}
