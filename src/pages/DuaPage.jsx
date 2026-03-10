import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import {
    IconHands,
    IconBook,
    IconNinetyNine,
    IconFlower,
    IconCrescent,
    IconUser,
    IconCompass,
    IconMosque
} from '../components/Icons'
import PageHeader from '../components/PageHeader'

export default function DuaPage() {
    const { theme } = useSettings()
    const navigate = useNavigate()

    const COLLECTIONS = [
        {
            id: 'library',
            title: 'Dua Library',
            subtitle: 'Explore Collections',
            icon: IconHands,
            action: () => navigate('/library')
        },
        {
            id: 'daily',
            title: 'Daily Guidance',
            subtitle: 'Morning & Evening',
            icon: IconBook,
            action: () => {
                const saved = localStorage.getItem('last-daily-category')
                navigate(saved ? `/daily/${saved}` : '/daily')
            }
        },
        {
            id: 'robbana',
            title: '40 Robbana',
            subtitle: 'Quranic Prayers',
            icon: IconCompass,
            action: () => navigate('/library/robbana')
        },
        {
            id: 'names',
            title: 'Asma-ul-Husna',
            subtitle: '99 Names of Allah',
            icon: IconNinetyNine,
            action: () => navigate('/praise')
        },
        {
            id: 'salawat',
            title: 'Salawat',
            subtitle: 'Prophetic Blessings',
            icon: IconFlower,
            action: () => navigate('/library/salawat')
        },
        {
            id: 'ramadan',
            title: 'Ramadan Special',
            subtitle: 'Spiritual Season',
            icon: IconCrescent,
            action: () => navigate('/library/ramadan')
        },
        {
            id: 'personal',
            title: 'Personal Prayers',
            subtitle: 'Private Collection',
            icon: IconUser,
            action: () => navigate('/library/custom-prayers')
        },
    ]

    return (
        <div className="pb-32 flex flex-col gap-6 max-w-xl md:max-w-6xl mx-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <PageHeader
                title="Dhikr & Dua"
                subtitle="Collections of Supplication"
                showBack={false}
                titleSerif={false}
                titleWeight={400}
                padding="px-6 pt-16 pb-12"
                subtitleCase="title"
            />

            <section className="animate-fade-in px-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {COLLECTIONS.map((cat, idx) => (
                        <QuickCard
                            key={cat.id}
                            title={cat.title}
                            subtitle={cat.subtitle}
                            icon={cat.icon}
                            onClick={cat.action}
                            theme={theme}
                            delay={`${idx * 100}ms`}
                        />
                    ))}
                </div>
            </section>

        </div>
    )
}

/* ────────────────────────────────────────────
   QuickCard — Synchronized with Home Page style
   ──────────────────────────────────────────── */
function QuickCard({ title, subtitle, icon, onClick, theme, delay }) {
    const IconComp = icon;
    const isDark = theme === 'dark'
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-start p-6 rounded-[2rem] overflow-hidden transition-all duration-300 text-left animate-fade-in"
            style={{
                background: t(theme, 'surface-1'),
                boxShadow: `0 4px 20px rgba(0,0,0,${isDark ? '0.2' : '0.03'})`,
                border: `1px solid ${t(theme, 'border')}`,
                minHeight: '10.5rem',
                animationDelay: delay
            }}
        >
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[2rem]"
                style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                }}
            />

            <div
                className="relative w-14 h-14 flex items-center justify-center rounded-full mb-5 transition-transform duration-500 group-hover:scale-110 overflow-hidden"
                style={{
                    background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                    boxShadow: isDark ? 'none' : '0 4px 15px rgba(0,0,0,0.06)',
                    color: t(theme, 'text-primary'),
                }}
            >
                <IconComp size={22} />
            </div>

            <h3 className="relative text-[15px] font-bold tracking-tight mb-0.5" style={{ color: t(theme, 'text-primary') }}>{title}</h3>
            <p className="relative text-[12px] font-medium tracking-tight opacity-70" style={{ color: t(theme, 'text-muted') }}>{subtitle}</p>
        </button>
    )
}

