import { useNavigate } from 'react-router-dom'
import { IconChevronLeft } from './Icons'
import { t } from '../utils/theme'
import { useSettings } from '../context/SettingsContext'

export default function PageHeader({
    title,
    subtitle,
    onBack,
    showBack = true,
    sticky = true,
    padding = "px-6 pt-16 pb-8",
    subtitleCase = "uppercase",
    titleSize = "text-3xl",
    titleWeight,
    titleSerif = false
}) {
    const navigate = useNavigate()
    const { theme } = useSettings()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            navigate(-1)
        }
    }

    return (
        <header
            className={`${padding} ${sticky ? 'sticky top-0 z-30' : ''}`}
            style={{
                background: t(theme, 'surface-0'),
                paddingTop: `calc(env(safe-area-inset-top, 0px) + ${padding.includes('pt-16') ? '1.5rem' : '1rem'})`,
            }}
        >
            <div className={`flex ${subtitle ? 'items-start' : 'items-center'} gap-5 animate-slide-down`}>
                {showBack && (
                    <button
                        onClick={handleBack}
                        className="p-2.5 -ml-2 rounded-2xl transition-all duration-300 active:scale-90 flex-shrink-0 group relative"
                        style={{
                            background: t(theme, 'surface-1'),
                            color: t(theme, 'accent'),
                            border: `1px solid ${t(theme, 'border')}`
                        }}
                        aria-label="Go back"
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"
                            style={{ background: t(theme, 'accent') }}
                        />
                        <IconChevronLeft size={22} className="relative z-10 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <h1
                        className={`${titleSize} tracking-tight leading-tight ${titleSerif ? 'italic' : ''}`}
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: titleSerif ? 'var(--font-serif-heading)' : 'inherit',
                            fontWeight: titleWeight || (titleSerif ? 400 : 900)
                        }}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p
                            className={`text-[12px] ${subtitleCase === 'uppercase' ? 'font-bold uppercase tracking-[0.15em]' : 'tracking-wide'} opacity-40 mt-1.5 leading-tight`}
                            style={{ color: t(theme, 'text-muted') }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </header>
    )
}
