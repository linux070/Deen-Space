/**
 * Design Token Dictionary for Deen Space
 * 3 Authentic, Handcrafted Themes:
 * 1. dark: Charcoal Obsidian & Warm Artisan Gold
 * 2. cream: Warm Antique Parchment / Cream & Deep Amber Gold
 * 3. light: Pure Crisp Modern White & Slate Gold
 */
export const THEME_TOKENS = {
    dark: {
        'surface-0': '#0c0f14',
        'surface-1': '#161a22',
        'surface-2': '#1e242d',
        'surface-3': '#2a333f',
        'border': '#2a333f',
        'text-primary': '#f0f0f0',
        'text-secondary': '#b0b8c4',
        'text-muted': '#8892a0',
        'accent': '#c9a84c',
        'accent-soft': 'rgba(201, 168, 76, 0.12)',
        'accent-glow': 'rgba(201, 168, 76, 0.28)',
        'green': '#38c97a',
        'red': '#e05656',
    },
    cream: {
        'surface-0': '#fbf8ef',
        'surface-1': '#f3efdf',
        'surface-2': '#ece6d0',
        'surface-3': '#e2dbc1',
        'border': '#dcd4b8',
        'text-primary': '#2d2616',
        'text-secondary': '#5a5035',
        'text-muted': '#726647',
        'accent': '#8a6d1b',
        'accent-soft': 'rgba(138, 109, 27, 0.12)',
        'accent-glow': 'rgba(138, 109, 27, 0.22)',
        'green': '#2e9d5e',
        'red': '#c93b3b',
    },
    light: {
        'surface-0': '#ffffff',
        'surface-1': '#f8fafc',
        'surface-2': '#f1f5f9',
        'surface-3': '#e2e8f0',
        'border': '#e2e8f0',
        'text-primary': '#0f172a',
        'text-secondary': '#334155',
        'text-muted': '#475569',
        'accent': '#92400e',
        'accent-soft': 'rgba(146, 64, 14, 0.08)',
        'accent-glow': 'rgba(146, 64, 14, 0.18)',
        'green': '#16a34a',
        'red': '#dc2626',
    }
}

/**
 * Returns the exact color value based on active theme.
 * Usage: t(theme, 'surface-1') → '#161a22' | '#f3efdf' | '#f8fafc'
 */
export function t(theme, token) {
    let mode = theme
    if (mode !== 'dark' && mode !== 'cream' && mode !== 'light') {
        mode = 'dark'
    }
    const themeSet = THEME_TOKENS[mode] || THEME_TOKENS.dark
    return themeSet[token] || `var(--color-${token})`
}

/** Check if the theme has a dark background */
export function isDarkBg(theme) {
    return theme === 'dark'
}

/** Get the appropriate background gradient for sticky headers */
export function headerGradient(theme) {
    if (theme === 'light') return 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98) 70%, rgba(255, 255, 255, 0))'
    if (theme === 'cream') return 'linear-gradient(to bottom, rgba(251, 248, 239, 0.98) 70%, rgba(251, 248, 239, 0))'
    return 'linear-gradient(to bottom, rgba(12, 15, 20, 0.98) 70%, rgba(12, 15, 20, 0))'
}

/** Get nav background gradient */
export function navGradient(theme) {
    if (theme === 'light') return 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 60%, rgba(255, 255, 255, 0.88))'
    if (theme === 'cream') return 'linear-gradient(to top, rgba(251, 248, 239, 0.98) 60%, rgba(251, 248, 239, 0.88))'
    return 'linear-gradient(to top, rgba(12, 15, 20, 0.98) 60%, rgba(12, 15, 20, 0.88))'
}
