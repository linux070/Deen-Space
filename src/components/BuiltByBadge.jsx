import { t } from '../utils/theme'

export default function BuiltByBadge({ theme }) {
    const isDark = theme === 'dark'

    return (
        <a
            href="https://x.com/linux_mode"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 group relative"
            style={{
                background: t(theme, 'surface-1'),
                border: `1px solid ${t(theme, 'border')}`,
                boxShadow: isDark
                    ? '0 4px 20px rgba(0,0,0,0.3)'
                    : '0 4px 12px rgba(0,0,0,0.03)',
                textDecoration: 'none',
                overflow: 'hidden'
            }}
        >
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                style={{ background: t(theme, 'accent') }}
            />

            <span
                className="text-[12px] font-bold tracking-[0.05em] transition-all duration-300"
                style={{
                    color: t(theme, 'text-secondary'),
                    fontFamily: 'var(--font-serif-body)',
                    opacity: 0.8
                }}
            >
                Built by
            </span>
            <div className="w-7 h-7 rounded-full overflow-hidden p-[1px] relative z-10" style={{ background: t(theme, 'surface-2') }}>
                <img
                    src="/linux_profile.png"
                    alt="linux_mode"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
                    }}
                />
            </div>
        </a>
    )
}
