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
                background: isDark ? t(theme, 'surface-1') : '#ffffff',
                border: isDark ? `1px solid ${t(theme, 'border')}` : '1px solid #e2e8f0',
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
                    color: isDark ? t(theme, 'text-primary') : '#334155',
                    fontFamily: 'var(--font-serif-body)',
                    opacity: 0.7
                }}
            >
                Built by
            </span>
            <div className="w-7 h-7 rounded-full overflow-hidden p-[1px] relative z-10" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
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
