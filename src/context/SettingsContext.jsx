import { createContext, useContext, useState, useEffect, useCallback, useLayoutEffect } from 'react'

const SettingsContext = createContext(null)

const DEFAULTS = {
    theme: 'dark',          // 'dark' | 'light'
    script: 'uthmani',      // 'uthmani' | 'indopak'
    arabicSize: 1.75,       // rem
    showTranslation: true,
    showTransliteration: true,
    language: 'en',         // 'en' only
}

const THEME_CYCLE = ['dark', 'light']

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-settings')
            const parsed = saved ? JSON.parse(saved) : DEFAULTS
            // Sanitize theme if it was 'sepia'
            if (parsed.theme === 'sepia') parsed.theme = 'dark'
            return { ...DEFAULTS, ...parsed }
        } catch {
            return DEFAULTS
        }
    })

    const [lastDuaPath, setLastDuaPath] = useState('/dua')

    // Use useLayoutEffect to avoid a frame of "flicker" when switching themes
    // This ensures classes are applied to the root BEFORE the browser paints.
    const applyTheme = useCallback((currentTheme, currentArabicSize, currentScript) => {
        const root = document.documentElement
        root.classList.remove('light')
        if (currentTheme === 'light') {
            root.classList.add('light')
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#fbf8ef')
        } else {
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0c0f14')
        }

        root.style.setProperty('--arabic-size', `${currentArabicSize}rem`)
        root.style.setProperty(
            '--script-font',
            currentScript === 'indopak' ? 'var(--font-arabic-indopak)' : 'var(--font-arabic)'
        )
    }, [])

    useEffect(() => {
        localStorage.setItem('dhikr-settings', JSON.stringify(settings))
    }, [settings])

    // Apply theme during layout phase to prevent flicker
    useLayoutEffect(() => {
        applyTheme(settings.theme, settings.arabicSize, settings.script)
    }, [settings, applyTheme])

    const update = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }, [])

    const toggleTheme = useCallback(() => {
        setSettings(prev => {
            const next = prev.theme === 'dark' ? 'light' : 'dark'
            return { ...prev, theme: next }
        })
    }, [])

    return (
        <SettingsContext.Provider value={{ ...settings, lastDuaPath, setLastDuaPath, update, toggleTheme }}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => useContext(SettingsContext)
