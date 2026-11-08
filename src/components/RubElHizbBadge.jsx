import { t } from '../utils/theme'

/**
 * RubElHizbBadge (۞)
 *
 * Sacred 8-pointed Islamic Star Medallion (Rub el Hizb / ۞)
 * Crafted with mathematical precision for authentic Qur'anic typography:
 * - Mathematical Octagram {8/2} polygon with smooth stroke-linejoin="round"
 * - Concentric manuscript inner roundel with delicate dashed hairline ring
 * - Dynamic optical sizing & tracking for 1-, 2-, and 3-digit chapter/verse numbers
 * - Full theme fidelity (cream, light, dark mode) and active reading state support
 */
export function RubElHizbBadge({
    number,
    size = 34,
    theme,
    isSelected = false,
    className = '',
    style = {},
}) {
    const isDark = theme === 'dark'
    const num = Number(number)
    const isThreeDigit = !isNaN(num) && num >= 100

    // High contrast color tuning
    const strokeColor = t(theme, 'accent')
    const fillColor = isSelected
        ? t(theme, 'accent')
        : t(theme, 'accent-soft')
    const textColor = isSelected
        ? (isDark ? '#0c0f14' : '#ffffff')
        : t(theme, 'accent')
    const ringColor = isSelected
        ? (isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.45)')
        : t(theme, 'accent')

    return (
        <div
            className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
            style={{
                width: size,
                height: size,
                minWidth: size,
                minHeight: size,
                ...style,
            }}
            aria-label={`Number ${number}`}
        >
            <svg
                viewBox="0 0 36 36"
                className="w-full h-full transition-transform duration-200 group-hover:scale-105"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Mathematical Rub el Hizb 8-pointed Star (۞) */}
                <polygon
                    points="18,2.5 22.54,7.04 28.96,7.04 28.96,13.46 33.5,18 28.96,22.54 28.96,28.96 22.54,28.96 18,33.5 13.46,28.96 7.04,28.96 7.04,22.54 2.5,18 7.04,13.46 7.04,7.04 13.46,7.04"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Delicate Manuscript Inner Ring (Daira) */}
                <circle
                    cx="18"
                    cy="18"
                    r="9.5"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="0.75"
                    strokeDasharray="2 1.5"
                    opacity={isSelected ? 0.6 : 0.45}
                />
            </svg>

            {/* Optically Centered Numeral */}
            <span
                className="absolute inset-0 flex items-center justify-center font-bold leading-none"
                style={{
                    color: textColor,
                    fontFamily: 'var(--font-serif-body)',
                    fontSize: isThreeDigit
                        ? `calc(${size}px * 0.28)`
                        : `calc(${size}px * 0.35)`,
                    letterSpacing: isThreeDigit ? '-0.04em' : '-0.01em',
                    paddingTop: '1px',
                }}
            >
                {number}
            </span>
        </div>
    )
}

