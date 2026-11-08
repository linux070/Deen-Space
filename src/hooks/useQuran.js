import { useState, useEffect, useCallback } from 'react'

const surahCache = new Map()

/**
 * Fetch and return the list of all 114 Surahs
 */
export function useQuranList() {
    const [surahs, setSurahs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function fetchSurahs() {
            try {
                if (surahCache.has('surahs-list')) {
                    if (isMounted) {
                        setSurahs(surahCache.get('surahs-list'))
                        setLoading(false)
                    }
                    return
                }

                const res = await fetch('/data/quran/surahs.json')
                if (!res.ok) throw new Error(`Failed to load Surahs: ${res.status}`)
                const data = await res.json()
                surahCache.set('surahs-list', data)

                if (isMounted) {
                    setSurahs(data)
                    setLoading(false)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message)
                    setLoading(false)
                }
            }
        }

        fetchSurahs()
        return () => { isMounted = false }
    }, [])

    return { surahs, loading, error }
}

/**
 * Fetch and return an individual Surah by number (1 - 114)
 */
export function useSurah(surahId) {
    const [surah, setSurah] = useState(() => surahCache.get(`surah-${surahId}`) || null)
    const [loading, setLoading] = useState(!surahCache.has(`surah-${surahId}`))
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!surahId) return
        let isMounted = true

        async function fetchSurah() {
            try {
                if (surahCache.has(`surah-${surahId}`)) {
                    if (isMounted) {
                        setSurah(surahCache.get(`surah-${surahId}`))
                        setLoading(false)
                    }
                    return
                }

                setLoading(true)
                const res = await fetch(`/data/quran/surahs/${surahId}.json`)
                if (!res.ok) throw new Error(`Surah ${surahId} not found`)
                const data = await res.json()
                surahCache.set(`surah-${surahId}`, data)

                if (isMounted) {
                    setSurah(data)
                    setLoading(false)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message)
                    setLoading(false)
                }
            }
        }

        fetchSurah()
        return () => { isMounted = false }
    }, [surahId])

    return { surah, loading, error }
}

/**
 * Manage the user's "Last Read" bookmark
 */
export function useLastRead() {
    const [lastRead, setLastReadState] = useState(() => {
        try {
            const saved = localStorage.getItem('deen_last_read')
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })

    const saveLastRead = useCallback((entry) => {
        try {
            const data = {
                ...entry,
                timestamp: Date.now()
            }
            localStorage.setItem('deen_last_read', JSON.stringify(data))
            setLastReadState(data)
        } catch (e) {
            console.error('Failed to save last read:', e)
        }
    }, [])

    return { lastRead, saveLastRead }
}

/**
 * Reader display settings (font size, view mode, translation toggle)
 */
export function useReaderSettings() {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('deen_reader_settings')
            return saved ? JSON.parse(saved) : {
                fontSize: 26, // Arabic font size in px
                viewMode: 'translation', // 'translation' | 'mushaf'
                showTranslation: true,
                showTransliteration: true,
                autoScroll: false
            }
        } catch {
            return {
                fontSize: 26,
                viewMode: 'translation',
                showTranslation: true,
                showTransliteration: true,
                autoScroll: false
            }
        }
    })

    const updateSetting = useCallback((key, value) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value }
            try {
                localStorage.setItem('deen_reader_settings', JSON.stringify(updated))
            } catch (e) {
                console.error(e)
            }
            return updated
        })
    }, [])

    return { settings, updateSetting }
}

