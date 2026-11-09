import { useNavigate } from 'react-router-dom'
import { IconChevronLeft } from './Icons'
import { t } from '../utils/theme'
import { useSettings } from '../context/SettingsContext'

export default function PageHeader({
    title,
    subtitle,
    showSubtitle = false, // Clean native app default: no subtexts under headings
    onBack,
    showBack = true,
    sticky = true,
    padding = "px-6 pt-8 pb-3",
    subtitleCase = "title",
    titleSize = "text-2xl sm:text-[28px]",
    titleWeight = 700,
    titleSerif = false,
    titleItalic = false,
    rightElement = null
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
                paddingTop: `calc(env(safe-area-inset-top, 0px) + ${padding.includes('pt-16') ? '1.5rem' : padding.includes('pt-10') ? '1rem' : '0.5rem'})`,
            }}
        >
            <div className="flex items-center gap-3.5 sm:gap-4 animate-slide-down">
                {showBack && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="w-10 h-10 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-xs group relative"
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
                        <IconChevronLeft size={20} className="relative z-10 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <h1
                        className={`${titleSize} font-bold tracking-tight leading-tight ${titleItalic ? 'italic' : ''}`}
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: titleSerif ? 'var(--font-serif-heading)' : 'inherit',
                            fontWeight: titleWeight || 700
                        }}
                    >
                        {title}
                    </h1>
                    {showSubtitle && subtitle && (
                        <p
                            className="text-xs sm:text-[13px] font-medium mt-0.5 leading-snug"
                            style={{ color: t(theme, 'text-secondary') }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
                {rightElement && (
                    <div className="flex-shrink-0">
                        {rightElement}
                    </div>
                )}
            </div>
        </header>
    )
}
