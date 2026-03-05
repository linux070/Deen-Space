/**
 * Returns the correct CSS variable value based on the current theme.
 * Usage: t(theme, 'surface-0') → var(--color-surface-0) | var(--color-l-surface-0)
 */
export function t(theme, token) {
    if (theme === 'light') return `var(--color-l-${token})`
    return `var(--color-${token})`
}

/** Check if the theme has a dark background */
export function isDarkBg(theme) {
    return theme === 'dark'
}

/** Get the appropriate background gradient for sticky headers */
export function headerGradient(theme) {
    if (theme === 'light') return 'linear-gradient(to bottom, rgba(255,255,255,1) 70%, rgba(255,255,255,0))'
    return 'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0))'
}

/** Get nav background gradient */
export function navGradient(theme) {
    if (theme === 'light') return 'linear-gradient(to top, rgba(255,255,255,0.98) 60%, rgba(255,255,255,0.88))'
    return 'linear-gradient(to top, rgba(0,0,0,0.98) 60%, rgba(0,0,0,0.88))'
}
