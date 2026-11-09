import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconHands,
    IconBook,
    IconStar,
    IconNinetyNine,
    IconFlower,
    IconCrescent,
    IconUser,
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

    // ── Curated Groups linking directly to corresponding main dua experiences ──
    const GROUPS = [
        {
            title: 'Prophetic & Daily Supplications',
            items: [
                {
                    id: 'duas',
                    title: 'Dua',
                    subtitle: 'Spiritual State, Daily Duas and Life Events',
                    badge: 'Supplications',
                    icon: IconHands,
                    action: () => navigate('/library/general'),
                },
                {
                    id: 'daily',
                    title: 'Daily Guidance',
                    subtitle: 'Morning & evening adhkar, solah & remembrance',
                    badge: 'Adhkar',
                    icon: IconBook,
                    action: () => navigate('/daily'),
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
            title: 'Devotion',
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
            title: 'Personal',
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
            className="pb-36 md:pb-20 flex flex-col gap-5 max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
        >
            {/* ── Modern App Masthead ── */}
            <PageHeader
                title="Dhikr & Dua"
                showBack={false}
                padding="px-0 pt-2 pb-1"
                sticky={false}
            />

            {/* ── Curated Grouped Inset Sections (Single-col mobile, 2-col desktop) ── */}
            <main className="flex flex-col lg:grid lg:grid-cols-2 gap-6 animate-fade-in mt-1 items-start">
                {GROUPS.map((group, gIdx) => (
                    <section key={gIdx} className={gIdx === 2 ? 'lg:col-span-2' : ''}>
                        {/* Section Header */}
                        <h2
                            className="text-[11px] font-bold uppercase tracking-[0.16em] px-2 mb-2.5 select-none"
                            style={{ color: t(theme, 'text-secondary') }}
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
                                                    className="text-[12px] font-normal truncate leading-tight mt-0.5"
                                                    style={{ color: t(theme, 'text-secondary') }}
                                                >
                                                    {cat.subtitle}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right: Badge Pill */}
                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                            <span
                                                className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md leading-none transition-colors"
                                                style={{
                                                    background: t(theme, 'surface-2'),
                                                    color: t(theme, 'accent'),
                                                    border: `1px solid ${t(theme, 'border')}`,
                                                }}
                                            >
                                                {cat.badge}
                                            </span>
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
