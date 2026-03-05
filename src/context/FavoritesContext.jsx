import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('dhikr-favorites')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    })

    useEffect(() => {
        localStorage.setItem('dhikr-favorites', JSON.stringify(favorites))
    }, [favorites])

    const toggle = useCallback((item) => {
        setFavorites(prev => {
            const key = item.id
            const exists = prev.find(f => f.id === key)
            if (exists) return prev.filter(f => f.id !== key)
            return [...prev, { id: key, type: item.type || 'dua', addedAt: Date.now() }]
        })
    }, [])

    const isFavorite = useCallback((id) => {
        return favorites.some(f => f.id === id)
    }, [favorites])

    return (
        <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export const useFavorites = () => useContext(FavoritesContext)
