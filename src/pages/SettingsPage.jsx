import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings, AVAILABLE_SCRIPTS } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import {
    IconSun,
    IconMoon,
    IconScroll,
    IconMinus,
    IconPlus,
    IconHeart,
    IconBookmark,
    IconChevronRight,
} from '../components/Icons'
import { t } from '../utils/theme'
import PageHeader from '../components/PageHeader'
import BuiltByBadge from '../components/BuiltByBadge'

/**
 * Modern High-End PWA Theme Preview Selector
 * Features realistic miniature canvas window previews for Dark, Cream, and Light modes.
 * Clean, border-indicated active states without checkmarks.
 * Cream theme represented by authentic antique parchment scroll (IconScroll).
 */
function ModernThemeSelector({ currentTheme, onSelect, theme }) {
    const isDark = theme === 'dark'

    const themes = [
        {
            id: 'dark',
            label: 'Dark',
            icon: IconMoon,
            preview: {
                bg: '#0c0f14',
                surface: '#161a22',
                border: '#2a333f',
                accent: '#c9a84c',
                line: '#3a4454',
            }
        },
        {
            id: 'cream',
            label: 'Cream',
            icon: IconScroll,
            preview: {
                bg: '#fbf8ef',
                surface: '#f3efdf',
                border: '#dcd4b8',
                accent: '#8a6d1b',
                line: '#b8ad92',
            }
        },
        {
            id: 'light',
            label: 'Light',
            icon: IconSun,
            preview: {
                bg: '#ffffff',
                surface: '#f8fafc',
                border: '#e2e8f0',
                accent: '#926c15',
                line: '#cbd5e1',
            }
        }
    ]

    return (
        <div className="p-3.5 sm:p-5">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {themes.map(({ id, label, icon: Icon, preview }) => {
                    const isActive = currentTheme === id

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onSelect(id)}
                            className="group flex flex-col items-center gap-2 p-2 sm:p-2.5 rounded-2xl text-left transition-all duration-200 active:scale-[0.97] outline-none cursor-pointer"
                            style={{
                                background: isActive ? t(theme, 'surface-2') : t(theme, 'surface-1'),
                                border: isActive ? `2px solid ${t(theme, 'accent')}` : `1px solid ${t(theme, 'border')}`,
                                boxShadow: isActive ? `0 4px 18px ${t(theme, 'accent-glow')}` : 'none',
                            }}
                        >
                            {/* Miniature Canvas Preview Window */}
                            <div
                                className="w-full aspect-[4/3] rounded-xl overflow-hidden p-2 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]"
                                style={{
                                    background: preview.bg,
                                    border: `1px solid ${preview.border}`,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}
                            >
                                {/* Mini Window Titlebar (Clean Header Dots) */}
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: preview.accent }} />
                                    <div className="w-1 h-1 rounded-full opacity-40" style={{ background: preview.line }} />
                                    <div className="w-1 h-1 rounded-full opacity-20" style={{ background: preview.line }} />
                                </div>

                                {/* Mini Surface Card */}
                                <div
                                    className="w-full rounded-lg p-1.5 flex flex-col gap-1"
                                    style={{
                                        background: preview.surface,
                                        border: `1px solid ${preview.border}`,
                                    }}
                                >
                                    <div className="w-2/3 h-1.5 rounded-full" style={{ background: preview.accent, opacity: 0.9 }} />
                                    <div className="w-full h-1 rounded-full" style={{ background: preview.line, opacity: 0.45 }} />
                                    <div className="w-4/5 h-1 rounded-full" style={{ background: preview.line, opacity: 0.3 }} />
                                </div>
                            </div>

                            {/* Label & Icon with Active Indicator */}
                            <div className="flex items-center gap-1.5 py-0.5">
                                <Icon size={14} style={{ color: isActive ? t(theme, 'accent') : t(theme, 'text-muted') }} />
                                <span
                                    className="text-xs font-bold tracking-tight"
                                    style={{
                                        color: isActive ? t(theme, 'text-primary') : t(theme, 'text-muted'),
                                    }}
                                >
                                    {label}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Modern High-Profile Script Style Dropdown
 * Compact, accessible popover picker showing script names with active state.
 */
function ModernScriptDropdown({ script, onSelect, theme }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const isDark = theme === 'dark'

    const currentScriptObj = AVAILABLE_SCRIPTS.find(s => s.id === script) || AVAILABLE_SCRIPTS[0]

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('pointerdown', handleClickOutside)
            return () => document.removeEventListener('pointerdown', handleClickOutside)
        }
    }, [isOpen])

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Pill Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 cursor-pointer shadow-xs hover:border-amber-500/50"
                style={{
                    background: t(theme, 'surface-2'),
                    borderColor: isOpen ? t(theme, 'accent') : t(theme, 'border'),
                    color: t(theme, 'text-primary'),
                }}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span>{currentScriptObj.name}</span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 opacity-50 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: t(theme, 'text-primary') }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    role="listbox"
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl border p-1.5 shadow-xl z-50 animate-fade-in flex flex-col gap-1 backdrop-blur-xl"
                    style={{
                        background: t(theme, 'surface-1'),
                        borderColor: t(theme, 'border'),
                        boxShadow: isDark
                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
                            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    {AVAILABLE_SCRIPTS.map((item) => {
                        const isSelected = script === item.id
                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onSelect(item.id)
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all active:scale-[0.98] cursor-pointer"
                                style={{
                                    background: isSelected ? t(theme, 'accent-soft') : 'transparent',
                                    color: isSelected ? t(theme, 'accent') : t(theme, 'text-primary'),
                                    fontWeight: isSelected ? 600 : 500,
                                }}
                            >
                                <span>{item.name}</span>
                                {isSelected && (
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ color: t(theme, 'accent') }}
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function Toggle({ checked, onChange, theme }) {
    const isDark = theme === 'dark'
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="relative w-[48px] h-[28px] rounded-full flex-shrink-0 transition-colors duration-200 outline-none"
            style={{
                background: checked ? t(theme, 'accent') : t(theme, 'surface-3'),
                border: isDark ? 'none' : `1px solid ${checked ? 'transparent' : t(theme, 'border')}`,
            }}
        >
            <span
                className="absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full transition-transform duration-200"
                style={{
                    background: isDark ? '#0c0f14' : '#ffffff',
                    transform: checked ? 'translateX(20px)' : 'translateX(0)',
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.12)',
                }}
            />
        </button>
    )
}

function SettingRow({ label, description, children, theme, noBorder = false, onClick }) {
    const Component = onClick ? 'button' : 'div'
    return (
        <Component
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`w-full flex items-center justify-between gap-4 px-5 py-4 transition-colors text-left ${
                onClick
                    ? 'group cursor-pointer hover:bg-black/[0.025] dark:hover:bg-white/[0.025] active:scale-[0.995]'
                    : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.015]'
            }`}
            style={{
                borderBottom: noBorder ? 'none' : `1px solid ${t(theme, 'border')}`,
            }}
        >
            <div className="flex-1 min-w-0 pr-2">
                <p
                    className="text-[14px] font-semibold tracking-tight leading-tight"
                    style={{ color: t(theme, 'text-primary') }}
                >
                    {label}
                </p>
                {description && (
                    <p
                        className="text-[11px] font-medium mt-0.5 opacity-60 leading-tight"
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        {description}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0">
                {children}
            </div>
        </Component>
    )
}

function SectionHeader({ title, theme }) {
    return (
        <h2
            className="px-6 text-[11px] font-bold uppercase tracking-[0.2em] mb-2 opacity-40 select-none"
            style={{ color: t(theme, 'text-muted') }}
        >
            {title}
        </h2>
    )
}

function SectionCard({ children, theme }) {
    return (
        <div
            className="mx-4 sm:mx-6 rounded-2xl overflow-hidden transition-all duration-200"
            style={{
                background: t(theme, 'surface-1'),
                border: `1px solid ${t(theme, 'border')}`,
                boxShadow: theme === 'dark' ? 'none' : '0 2px 10px rgba(0,0,0,0.02)',
            }}
        >
            {children}
        </div>
    )
}

export default function SettingsPage() {
    const navigate = useNavigate()
    const { favorites = [] } = useFavorites()
    const settings = useSettings()
    const { theme, script, arabicSize, showTranslation, showTransliteration, update } = settings
    const isDark = theme === 'dark'

    return (
        <div className="pb-36 max-w-xl md:max-w-3xl mx-auto min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <PageHeader
                title="Settings"
                subtitle="Preferences & display"
                showBack={false}
                titleSerif={false}
                titleWeight={400}
                padding="px-6 pt-10 pb-6"
                subtitleCase="title"
            />

            <main className="flex flex-col gap-7">
                {/* ── 1. Appearance ── */}
                <section>
                    <SectionHeader title="Appearance" theme={theme} />
                    <SectionCard theme={theme}>
                        <ModernThemeSelector
                            currentTheme={theme}
                            onSelect={(id) => update('theme', id)}
                            theme={theme}
                        />
                    </SectionCard>
                </section>

                {/* ── 2. Reading & Script ── */}
                <section>
                    <SectionHeader title="Reading & Script" theme={theme} />
                    <SectionCard theme={theme}>
                        <SettingRow
                            label="Arabic Script Style"
                            description="Select the calligraphy font style for Quranic text"
                            theme={theme}
                        >
                            <ModernScriptDropdown
                                script={script}
                                onSelect={(id) => update('script', id)}
                                theme={theme}
                            />
                        </SettingRow>

                        <SettingRow label="Arabic Text Size" description="Scale verse and prayer text across the app" theme={theme} noBorder>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => update('arabicSize', Math.max(1.25, arabicSize - 0.25))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 transition-transform cursor-pointer"
                                        style={{
                                            background: t(theme, 'surface-2'),
                                            color: t(theme, 'text-primary'),
                                            border: `1px solid ${t(theme, 'border')}`,
                                        }}
                                        aria-label="Make Arabic text smaller"
                                        title="Make Arabic text smaller"
                                    >
                                        <IconMinus size={14} />
                                    </button>
                                    <div className="flex flex-col items-center gap-1">
                                        <span
                                            className="text-[11px] font-bold tabular-nums tracking-tight opacity-75"
                                            style={{ color: t(theme, 'text-primary') }}
                                        >
                                            {arabicSize.toFixed(2)} rem
                                        </span>
                                        <div
                                            className="w-16 h-1 rounded-full overflow-hidden"
                                            style={{ background: t(theme, 'surface-3') }}
                                        >
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${((arabicSize - 1.25) / 1.75) * 100}%`,
                                                    background: t(theme, 'accent'),
                                                    transition: 'width 0.3s ease',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => update('arabicSize', Math.min(3, arabicSize + 0.25))}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90 transition-transform cursor-pointer"
                                        style={{
                                            background: t(theme, 'surface-2'),
                                            color: t(theme, 'text-primary'),
                                            border: `1px solid ${t(theme, 'border')}`,
                                        }}
                                        aria-label="Make Arabic text larger"
                                        title="Make Arabic text larger"
                                    >
                                        <IconPlus size={14} />
                                    </button>
                                </div>
                            </SettingRow>
                    </SectionCard>
                </section>

                {/* ── 3. Display Preferences ── */}
                <section>
                    <SectionHeader title="Display Preferences" theme={theme} />
                    <SectionCard theme={theme}>
                        <SettingRow label="English Translation" description="Show line-by-line English meanings below verses" theme={theme}>
                            <Toggle checked={showTranslation} onChange={v => update('showTranslation', v)} theme={theme} />
                        </SettingRow>

                        <SettingRow label="Pronunciation Guide" description="Show phonetic English spelling to help recitation" theme={theme}>
                            <Toggle checked={showTransliteration} onChange={v => update('showTransliteration', v)} theme={theme} />
                        </SettingRow>

                        <SettingRow
                            label="Saved Bookmarks"
                            description={favorites.length > 0 ? `${favorites.length} saved verse${favorites.length > 1 ? 's' : ''} & dua${favorites.length > 1 ? 's' : ''}` : 'No saved bookmarks yet'}
                            theme={theme}
                            onClick={() => navigate('/favorites')}
                            noBorder
                        >
                            <div
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 group-hover:border-amber-500/50 group-hover:bg-amber-500/5"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    borderColor: t(theme, 'border'),
                                    color: t(theme, 'text-primary'),
                                }}
                            >
                                <span>View all</span>
                                <IconChevronRight
                                    size={13}
                                    className="opacity-40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                                />
                            </div>
                        </SettingRow>
                    </SectionCard>
                </section>

                {/* ── 4. Preview ── */}
                <section>
                    <SectionHeader title="Preview" theme={theme} />
                    <div
                        className="mx-4 sm:mx-6 rounded-2xl overflow-hidden p-5 sm:p-6 transition-all duration-200"
                        style={{
                            background: t(theme, 'surface-1'),
                            border: `1px solid ${t(theme, 'border')}`,
                            boxShadow: theme === 'dark' ? 'none' : '0 2px 10px rgba(0,0,0,0.02)',
                        }}
                    >
                        <p
                            className="text-right leading-[var(--arabic-line-height)] mb-4"
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
                            className="h-px w-full mb-3.5"
                            style={{ background: t(theme, 'border'), opacity: 0.5 }}
                        />

                        <div className="flex flex-col gap-1.5">
                            {showTransliteration && (
                                <p
                                    className="text-[13px] italic font-medium leading-relaxed"
                                    style={{
                                        color: t(theme, 'accent'),
                                        fontFamily: 'var(--font-serif-body)',
                                    }}
                                >
                                    Bismillahir-Rahmanir-Raheem
                                </p>
                            )}
                            {showTranslation && (
                                <p
                                    className="text-[13px] font-medium leading-relaxed opacity-85"
                                    style={{
                                        color: t(theme, 'text-secondary'),
                                        fontFamily: 'var(--font-sans)',
                                    }}
                                >
                                    In The Name Of Allah, The Most Gracious, The Most Merciful.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── 5. App Info ── */}
                <section>
                    <SectionHeader title="App Info" theme={theme} />
                    <SectionCard theme={theme}>
                        <SettingRow label="App Version" description="Installed and ready for offline use" theme={theme} noBorder>
                            <span
                                className="text-[11px] font-bold tracking-wide opacity-45 px-2 py-0.5 rounded-md"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                v1.3.0
                            </span>
                        </SettingRow>
                    </SectionCard>
                </section>

                {/* ── Footer ── */}
                <div className="px-6 pt-8 pb-12 flex flex-col items-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <p
                        className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-40"
                        style={{ color: t(theme, 'text-muted') }}
                    >
                        Built for Offline Reflection
                    </p>

                    <div className="mt-2">
                        <BuiltByBadge theme={theme} />
                    </div>
                </div>
            </main>
        </div>
    )
}
