import { useSettings } from '../context/SettingsContext'
import { IconSun, IconMoon, IconMinus, IconPlus } from '../components/Icons'
import { t } from '../utils/theme'
import PageHeader from '../components/PageHeader'
import BuiltByBadge from '../components/BuiltByBadge'

function Toggle({ checked, onChange, theme }) {
    const isDark = theme === 'dark'
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="relative w-[52px] h-[30px] rounded-full flex-shrink-0 group"
            style={{
                background: checked
                    ? (isDark ? '#c9a84c' : '#8a6d1b')
                    : (isDark ? t(theme, 'surface-3') : '#c8bfa5'),
                border: isDark ? 'none' : `1px solid ${checked ? 'transparent' : '#b8ad92'}`,
            }}
        >
            <span
                className="absolute top-[3px] left-[3px] w-6 h-6 rounded-full"
                style={{
                    background: isDark ? '#0c0f14' : '#ffffff',
                    transform: checked ? 'translateX(22px)' : 'translateX(0)',
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 6px rgba(0,0,0,0.2)',
                }}
            />
        </button>
    )
}

function SettingRow({ label, description, children, theme, noBorder = false }) {
    return (
        <div
            className="flex items-center justify-between gap-4 px-5 py-4"
            style={{
                borderBottom: noBorder ? 'none' : `1px solid ${t(theme, 'border')}`,
                opacity: 1
            }}
        >
            <div className="flex-1 min-w-0">
                <p
                    className="text-[14px] font-semibold tracking-tight"
                    style={{ color: t(theme, 'text-primary') }}
                >
                    {label}
                </p>
                {description && (
                    <p
                        className="text-[11px] font-medium mt-0.5 opacity-50"
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    )
}

function SectionHeader({ title, theme }) {
    return (
        <h2
            className="px-6 text-[11px] font-black uppercase tracking-[0.2em] mb-3 opacity-35"
            style={{ color: t(theme, 'text-muted') }}
        >
            {title}
        </h2>
    )
}

function SectionCard({ children, theme }) {
    const isDark = theme === 'dark'
    return (
        <div
            className="mx-6 rounded-[1.75rem] overflow-hidden"
            style={{
                background: t(theme, 'surface-1'),
                border: `1px solid ${t(theme, 'border')}`,
                boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.02)',
            }}
        >
            {children}
        </div>
    )
}

export default function SettingsPage() {
    const settings = useSettings()
    const { theme, script, arabicSize, showTranslation, showTransliteration, update, toggleTheme } = settings
    const isDark = theme === 'dark'

    return (
        <div className="pb-32 max-w-xl md:max-w-6xl mx-auto min-h-screen">
            <PageHeader
                title="Settings"
                subtitle="Personalize Your Spiritual Experience"
                showBack={false}
                titleSerif={false}
                titleWeight={400}
                padding="px-6 pt-16 pb-12"
                subtitleCase="title"
            />

            <main className="flex flex-col gap-8">
                {/* ── Appearance ── */}
                <section>
                    <SectionHeader title="Appearance" theme={theme} />
                    <SectionCard theme={theme}>
                        <SettingRow
                            label="Theme Mode"
                            description="Select your preferred appearance"
                            theme={theme}
                            noBorder
                        >
                            <div className="flex items-center gap-1.5 p-1 rounded-2xl" style={{ background: t(theme, 'surface-2') }}>
                                <button
                                    onClick={() => update('theme', 'dark')}
                                    className="px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2"
                                    style={{
                                        background: isDark ? '#c9a84c' : 'transparent',
                                        color: isDark ? '#ffffff' : t(theme, 'text-muted'),
                                    }}
                                >
                                    <IconMoon size={14} />
                                    Dark
                                </button>
                                <button
                                    onClick={() => update('theme', 'light')}
                                    className="px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2"
                                    style={{
                                        background: !isDark ? '#8a6d1b' : 'transparent',
                                        color: !isDark ? '#ffffff' : t(theme, 'text-muted'),
                                    }}
                                >
                                    <IconSun size={14} />
                                    Light
                                </button>
                            </div>
                        </SettingRow>
                    </SectionCard>
                </section>

                {/* ── Typography ── */}
                <section>
                    <SectionHeader title="Typography" theme={theme} />
                    <SectionCard theme={theme}>
                        <SettingRow label="Arabic Script Style" description="Select preferred calligraphy" theme={theme}>
                            <div className="flex items-center gap-1.5 p-1 rounded-2xl" style={{ background: t(theme, 'surface-2') }}>
                                {['uthmani', 'indopak'].map(s => {
                                    const isActive = script === s
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => update('script', s)}
                                            className="px-4 py-2 rounded-xl text-[11px] font-bold"
                                            style={{
                                                background: isActive
                                                    ? (isDark ? '#c9a84c' : '#8a6d1b')
                                                    : 'transparent',
                                                color: isActive ? '#ffffff' : t(theme, 'text-muted'),
                                            }}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    )
                                })}
                            </div>
                        </SettingRow>

                        <SettingRow label="Arabic Font Size" theme={theme} noBorder>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => update('arabicSize', Math.max(1.25, arabicSize - 0.25))}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90"
                                    style={{
                                        background: t(theme, 'surface-2'),
                                        color: t(theme, 'text-primary'),
                                        transition: 'transform 0.2s ease'
                                    }}
                                    aria-label="Decrease font size"
                                >
                                    <IconMinus size={14} />
                                </button>
                                <div className="flex flex-col items-center gap-1.5">
                                    <span
                                        className="text-[11px] font-bold tabular-nums tracking-tight"
                                        style={{ color: t(theme, 'text-primary'), opacity: 0.6 }}
                                    >
                                        {arabicSize.toFixed(2)}
                                    </span>
                                    <div
                                        className="w-16 h-1 rounded-full overflow-hidden"
                                        style={{ background: t(theme, 'surface-3') }}
                                    >
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${((arabicSize - 1.25) / 1.75) * 100}%`,
                                                background: isDark ? '#c9a84c' : '#8a6d1b',
                                                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => update('arabicSize', Math.min(3, arabicSize + 0.25))}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90"
                                    style={{
                                        background: t(theme, 'surface-2'),
                                        color: t(theme, 'text-primary'),
                                        transition: 'transform 0.2s ease'
                                    }}
                                    aria-label="Increase font size"
                                >
                                    <IconPlus size={14} />
                                </button>
                            </div>
                        </SettingRow>
                    </SectionCard>
                </section>

                {/* ── Display ── */}
                <section>
                    <SectionHeader title="Display" theme={theme} />
                    <SectionCard theme={theme}>
                        <SettingRow label="Show Translation" description="Meaning of the supplication" theme={theme}>
                            <Toggle checked={showTranslation} onChange={v => update('showTranslation', v)} theme={theme} />
                        </SettingRow>

                        <SettingRow label="Show Transliteration" description="Phonetic pronunciation guide" theme={theme} noBorder>
                            <Toggle checked={showTransliteration} onChange={v => update('showTransliteration', v)} theme={theme} />
                        </SettingRow>
                    </SectionCard>
                </section>

                {/* ── General ── */}
                <section>
                    <SectionHeader title="General" theme={theme} />
                    <SectionCard theme={theme}>
                        <SettingRow label="App Version" description="Current installation" theme={theme} noBorder>
                            <span
                                className="text-[11px] font-bold tracking-wide opacity-35"
                                style={{ color: t(theme, 'text-primary') }}
                            >
                                v1.0.0
                            </span>
                        </SettingRow>
                    </SectionCard>
                </section>

                {/* ── Preview ── */}
                <section>
                    <SectionHeader title="Preview" theme={theme} />
                    <div
                        className="mx-6 rounded-[1.75rem] overflow-hidden"
                        style={{
                            background: t(theme, 'surface-1'),
                            border: `1px solid ${t(theme, 'border')}`,
                            boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.02)',
                        }}
                    >
                        <div className="p-6">
                            <p
                                className="text-right leading-[var(--arabic-line-height)] mb-5"
                                style={{
                                    fontFamily: 'var(--script-font)',
                                    fontSize: 'var(--arabic-size)',
                                    color: t(theme, 'text-primary'),
                                    direction: 'rtl',
                                    textRendering: 'optimizeLegibility',
                                    fontWeight: 500
                                }}
                            >
                                بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ
                            </p>

                            <div
                                className="h-px w-full mb-4"
                                style={{ background: t(theme, 'border'), opacity: 0.5 }}
                            />

                            <div className="flex flex-col gap-2">
                                {showTransliteration && (
                                    <p
                                        className="text-[13px] italic font-medium leading-relaxed"
                                        style={{
                                            color: t(theme, 'text-secondary'),
                                            fontFamily: 'var(--font-serif-body)',
                                            opacity: 0.85
                                        }}
                                    >
                                        Bismillahir-Rahmanir-Raheem
                                    </p>
                                )}
                                {showTranslation && (
                                    <p
                                        className="text-[13px] italic font-medium leading-relaxed"
                                        style={{
                                            color: t(theme, 'text-secondary'),
                                            fontFamily: 'var(--font-serif-body)',
                                            opacity: 0.85
                                        }}
                                    >
                                        In The Name Of Allah, The Most Gracious, The Most Merciful.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <div className="px-6 pt-8 pb-12 flex flex-col items-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <p
                        className="text-[11px] font-black uppercase tracking-[0.2em] opacity-35"
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        AVAILABLE OFFLINE
                    </p>

                    <div className="mt-2">
                        <BuiltByBadge theme={theme} />
                    </div>
                </div>
            </main>
        </div>
    )
}
