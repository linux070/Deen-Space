import { t } from '../utils/theme'

export default function ActionCard({ title, description, icon: Icon, onClick, theme, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={`group relative flex flex-col items-start p-6 rounded-[2.5rem] border border-transparent overflow-hidden h-44 w-full text-left transition-colors duration-200 hover:bg-white ${className}`}
            style={{
                background: t(theme, 'surface-1'),
                boxShadow: `0 8px 30px rgba(0,0,0,${theme === 'dark' ? '0.3' : '0.04'})`,
            }}
        >
            {/* Main Icon */}
            <div
                className="w-12 h-12 flex items-center justify-center rounded-2xl mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white"
                style={{ color: t(theme, 'accent') }}
            >
                <Icon size={24} />
            </div>

            {/* Label Content */}
            <h3
                className="text-sm sm:text-base font-bold tracking-tight flex-shrink-0 transition-colors duration-200 group-hover:text-gray-900"
                style={{ color: t(theme, 'text-primary') }}
            >
                {title}
            </h3>
            <p
                className="text-[10px] sm:text-[11px] font-medium mt-1.5 tracking-normal leading-relaxed transition-colors duration-200 group-hover:text-gray-500"
                style={{ color: t(theme, 'text-muted') }}
            >
                {description}
            </p>

            {/* Static Indicator */}
            <div
                className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full opacity-20"
                style={{ background: t(theme, 'accent') }}
            />
        </button>
    )
}
