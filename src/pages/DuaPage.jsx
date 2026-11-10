import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconHands,
    IconBook,
    IconQuran,
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

    // ── Curated Groups linking directly to corresponding main dua experiences ──
    const GROUPS = [
        {
            title: 'Prophetic & Daily Supplications',
            items: [
                {
                    id: 'duas',
                    title: 'Dua Library',
                    subtitle: 'Daily supplications & life events',
                    badge: '120+ Duas',
                    icon: IconHands,
                    action: () => navigate('/library/general'),
                },
                {
                    id: 'daily',
                    title: 'Daily Guidance',
                    subtitle: 'Morning & evening adhkar, solah & dhikr',
                    badge: 'Daily',
                    icon: IconBook,
                    action: () => navigate('/daily'),
                },
                {
                    id: 'robbana',
                    title: '40 Robbana',
                    subtitle: 'Quranic prayers of the Prophets',
                    badge: '40 Verses',
                    icon: IconQuran,
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
                    subtitle: 'The 99 Beautiful Names & Attributes',
                    badge: '99 Names',
                    icon: IconNinetyNine,
                    action: () => navigate('/praise'),
                },
                {
                    id: 'salawat',
                    title: 'Salawat',
                    subtitle: 'Blessings upon the Prophet ﷺ',
                    badge: 'Blessings',
                    icon: IconFlower,
                    action: () => navigate('/library/salawat'),
                },
                {
                    id: 'ramadan',
                    title: 'Ramadan Special',
                    subtitle: 'Supplications for fasting & Laylat al-Qadr',
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
                    subtitle: 'Your private offline supplications & notes',
                    badge: customCount > 0 ? `${customCount} Saved` : 'Private',
                    icon: IconUser,
                    action: () => navigate('/library/custom-prayers'),
                },
            ],
        },
    ]

    return (
        <div
            className="pb-36 md:pb-20 flex flex-col gap-4 sm:gap-5 max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-3.5 sm:px-6"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
        >
            {/* ── Modern App Masthead ── */}
            <PageHeader
                title="Dhikr & Dua"
                showBack={false}
                padding="px-0.5 pt-1 pb-1"
                sticky={false}
            />

            {/* ── Curated Grouped Inset Sections (Single-col mobile, 2-col desktop) ── */}
            <main className="flex flex-col lg:grid lg:grid-cols-2 gap-5 sm:gap-6 animate-fade-in mt-0.5 items-start">
                {GROUPS.map((group, gIdx) => (
                    <section key={gIdx} className={`w-full ${gIdx === 2 ? 'lg:col-span-2' : ''}`}>
                        {/* Section Header */}
                        <h2
                            className="text-[11px] font-bold uppercase tracking-[0.16em] px-2 mb-2 select-none"
                            style={{ color: t(theme, 'text-secondary') }}
                        >
                            {group.title}
                        </h2>

                        {/* Continuous Inset Container with Hairline Dividers & Elevated Depth */}
                        <div
                            className="rounded-2xl border overflow-hidden transition-all duration-200"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                                boxShadow: isDark ? 'none' : '0 2px 14px rgba(0,0,0,0.025)',
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
                                        className="group w-full flex items-center justify-between gap-3 px-3.5 py-3.5 sm:px-5 sm:py-4 text-left transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02] active:bg-black/[0.04] active:scale-[0.995] cursor-pointer"
                                        style={{
                                            borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                        }}
                                    >
                                        {/* Left: Icon Squircle */}
                                        <div
                                            className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-105 shadow-xs"
                                            style={{
                                                background: t(theme, 'accent-soft'),
                                                color: t(theme, 'accent'),
                                                border: `1px solid ${t(theme, 'border')}`,
                                            }}
                                        >
                                            <Icon size={20} />
                                        </div>

                                        {/* Middle: Title with Inline Metadata Chip + Unrestricted Subtitle */}
                                        <div className="min-w-0 flex-1 flex flex-col justify-center pr-1">
                                            <div className="flex items-center gap-2">
                                                <h3
                                                    className="text-[14.5px] sm:text-[15px] font-semibold tracking-tight truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                    style={{ color: t(theme, 'text-primary') }}
                                                >
                                                    {cat.title}
                                                </h3>
                                                <span
                                                    className="text-[9.5px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-md leading-none whitespace-nowrap transition-colors flex-shrink-0"
                                                    style={{
                                                        background: t(theme, 'surface-2'),
                                                        color: t(theme, 'accent'),
                                                        border: `1px solid ${t(theme, 'border')}`,
                                                    }}
                                                >
                                                    {cat.badge}
                                                </span>
                                            </div>
                                            <p
                                                className="text-[12px] font-normal leading-normal mt-0.5 line-clamp-1 sm:line-clamp-none"
                                                style={{ color: t(theme, 'text-secondary') }}
                                            >
                                                {cat.subtitle}
                                            </p>
                                        </div>

                                        {/* Right: Clean, Unified Chevron Navigation Indicator */}
                                        <div className="flex items-center pl-1 flex-shrink-0">
                                            <IconChevronRight
                                                size={15}
                                                className="opacity-40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                                                style={{ color: t(theme, 'text-secondary') }}
                                            />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </section>
                ))}

                {/* ── Inspiring Contemplation Anchor Card (Balanced Bottom Fill) ── */}
                <div
                    className="w-full lg:col-span-2 mt-1 sm:mt-2 p-5 sm:p-6 rounded-2xl border text-center animate-fade-in relative overflow-hidden"
                    style={{
                        background: t(theme, 'surface-1'),
                        borderColor: t(theme, 'border'),
                        boxShadow: isDark ? 'none' : '0 2px 14px rgba(0,0,0,0.02)',
                    }}
                >
                    <p
                        className="text-base sm:text-lg leading-relaxed italic max-w-md mx-auto"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--font-serif-body)',
                        }}
                    >
                        &ldquo;And your Lord says: Call upon Me; I will respond to you.&rdquo;
                    </p>
                    <span
                        className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase mt-2.5 opacity-65"
                        style={{
                            color: t(theme, 'accent'),
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        Surah Ghafir 40:60
                    </span>
                </div>
            </main>
        </div>
    )
}
