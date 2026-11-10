import { createContext, useContext, useState, useEffect, useCallback, useLayoutEffect } from 'react'

const SettingsContext = createContext(null)

export const AVAILABLE_SCRIPTS = [
    {
        id: 'uthmani',
        name: 'Uthmani',
        label: 'Uthmani (Madinah)',
        region: 'Madinah Script',
        description: 'Standard script used in printed Qurans worldwide, modeled after the Madinah Mushaf.',
        sample: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        fontFamily: 'var(--font-arabic-uthmani)',
    },
    {
        id: 'indopak',
        name: 'Indo-Pak',
        label: 'Indo-Pak (Naskh)',
        region: 'South Asian Naskh',
        description: 'Popular across Pakistan, India, and Bangladesh with bold, prominent diacritic marks.',
        sample: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
        fontFamily: 'var(--font-arabic-indopak)',
    },
    {
        id: 'scheherazade',
        name: 'Classical Naskh',
        label: 'Classical (Scheherazade)',
        region: 'Traditional Calligraphy',
        description: 'Flowing, curved handwriting designed for smooth and natural long-form reading.',
        sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        fontFamily: 'var(--font-arabic-scheherazade)',
    },
    {
        id: 'nastaliq',
        name: 'Nastaliq',
        label: 'Nastaliq (Urdu)',
        region: 'Persian & Urdu Style',
        description: 'Graceful diagonal Persian and Urdu cursive style with sloping letterforms.',
        sample: 'بِسمِ اللہِ الرَّحمٰنِ الرَّحِیمِ',
        fontFamily: 'var(--font-arabic-nastaliq)',
    },
]

const SCRIPT_FONT_MAP = {
    uthmani: 'var(--font-arabic-uthmani)',
    indopak: 'var(--font-arabic-indopak)',
    scheherazade: 'var(--font-arabic-scheherazade)',
    nastaliq: 'var(--font-arabic-nastaliq)',
}

const DEFAULTS = {
    theme: 'dark',          // 'dark' | 'cream' | 'light'
    script: 'uthmani',      // 'uthmani' | 'indopak' | 'scheherazade' | 'nastaliq'
    arabicSize: 1.75,       // rem
    showTranslation: true,
    showTransliteration: true,
    language: 'en',         // 'en' only
}

const THEME_CYCLE = ['light', 'cream', 'dark']

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-settings')
            const parsed = saved ? JSON.parse(saved) : DEFAULTS
            // Sanitize theme
            if (parsed.theme === 'sepia') parsed.theme = 'cream'
            if (!THEME_CYCLE.includes(parsed.theme)) parsed.theme = 'dark'
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
        root.classList.remove('dark', 'light', 'cream')
        root.classList.add(currentTheme)
        root.setAttribute('data-theme', currentTheme)

        const metaTheme = document.querySelector('meta[name="theme-color"]')
        if (metaTheme) {
            if (currentTheme === 'light') {
                metaTheme.setAttribute('content', '#ffffff')
            } else if (currentTheme === 'cream') {
                metaTheme.setAttribute('content', '#fbf8ef')
            } else {
                metaTheme.setAttribute('content', '#0c0f14')
            }
        }

        root.style.setProperty('--arabic-size', `${currentArabicSize}rem`)
        const activeFont = SCRIPT_FONT_MAP[currentScript] || SCRIPT_FONT_MAP.uthmani
        root.style.setProperty('--script-font', activeFont)
        root.style.setProperty('--font-arabic', activeFont)
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
            const currentIndex = THEME_CYCLE.indexOf(prev.theme)
            const nextIndex = (currentIndex + 1) % THEME_CYCLE.length
            return { ...prev, theme: THEME_CYCLE[nextIndex] }
        })
    }, [])

    return (
        <SettingsContext.Provider value={{ ...settings, lastDuaPath, setLastDuaPath, update, toggleTheme }}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => useContext(SettingsContext)
