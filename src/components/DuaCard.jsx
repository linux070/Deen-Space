import { useState, useCallback } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { useAudioCtx } from '../context/AudioContext'
import { IconHeartFill, IconHeart, IconVolume, IconRefresh } from './Icons'
import { t } from '../utils/theme'

export default function DuaCard({ dua, type = 'dua', isCountingMode = false, hideAudio = false, hideCounter = false, hideTags = false, label, onDelete }) {
    const { showTranslation, showTransliteration, language, theme } = useSettings()
    const { toggle, isFavorite } = useFavorites()
    const { speak, speaking } = useAudioCtx()
    const [count, setCount] = useState(0)

    const fav = isFavorite(dua.id)
    const isPlaying = speaking === dua.id

    const translation =
        typeof dua.translation === 'object'
            ? dua.translation[language] || dua.translation.en
            : dua.translation

    const handleCount = useCallback((e) => {
        // Prevent event bubbling if necessary, but here we want to catch taps
        if (dua.repeat && dua.repeat > 1) {
            if (count < dua.repeat) {
                if (navigator.vibrate) navigator.vibrate(15)
                setCount(prev => prev + 1)
            } else {
                if (navigator.vibrate) navigator.vibrate([30, 50, 30])
            }
        }
    }, [count, dua.repeat])

    const resetCount = useCallback((e) => {
        e.stopPropagation()
        setCount(0)
    }, [])

    return (
        <article
            className={`rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-md flex flex-col ${isCountingMode ? 'h-full' : ''}`}
            onClick={isCountingMode ? handleCount : undefined}
            style={{
                background: t(theme, 'surface-1'),
                border: `1px solid ${t(theme, 'border')}`,
                boxShadow: isCountingMode ? '0 8px 32px rgba(0,0,0,0.1)' : 'none',
                minHeight: isCountingMode ? '400px' : 'auto',
            }}
        >
            {/* Label / Index Tag */}
            {/* Label / Index Tag */}
            {!hideTags && label && (
                <div className="px-6 pt-5 pb-0 flex justify-between items-center">
                    <span
                        className="text-[10px] font-black tracking-[0.15em] px-2.5 py-1 rounded-lg"
                        style={{ background: t(theme, 'accent-soft'), color: t(theme, 'accent') }}
                    >
                        {label}
                    </span>
                </div>
            )}

            <div className={`px-6 pt-8 pb-6 flex-1 overflow-y-auto no-scrollbar flex flex-col`}>
                {/* Arabic text */}
                <div
                    className={`text-right leading-[var(--arabic-line-height)] mb-8`}
                    style={{
                        fontFamily: 'var(--script-font)',
                        fontSize: 'var(--arabic-size)',
                        color: t(theme, 'text-primary'),
                        direction: 'rtl',
                    }}
                >
                    {dua.arabic_text}
                </div>

                {/* Separator */}
                <div
                    className="h-px w-full mb-8 opacity-50 flex-shrink-0"
                    style={{ background: t(theme, 'border') }}
                />

                <div className={`flex-1`}>
                    {/* Transliteration */}
                    {showTransliteration && dua.transliteration && (
                        <p
                            className="text-[17px] italic leading-relaxed mb-6 text-capitalize"
                            style={{
                                color: t(theme, 'text-secondary'),
                                fontFamily: 'var(--font-serif-body)',
                            }}
                        >
                            {dua.transliteration}
                        </p>
                    )}

                    {/* Translation */}
                    {showTranslation && translation && (
                        <p
                            className="text-[17px] italic leading-relaxed text-capitalize"
                            style={{
                                color: t(theme, 'text-secondary'),
                                fontFamily: 'var(--font-serif-body)',
                            }}
                        >
                            {translation}
                        </p>
                    )}
                </div>
            </div>



            {/* Footer: Reference + Actions */}
            <div className="flex items-center justify-between px-6 py-4" style={{ background: t(theme, 'surface-1') }}>
                <div className="flex items-center gap-2">
                    {dua.reference && (
                        <span
                            className="text-[13px] px-3 py-1.5 rounded-xl font-bold tracking-tight"
                            style={{
                                background: t(theme, 'surface-2'),
                                color: t(theme, 'text-primary'),
                                border: `1px solid ${t(theme, 'border')}`
                            }}
                        >
                            {dua.reference}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2.5 rounded-full transition-all duration-200 active:scale-90 opacity-60 hover:opacity-100 hover:bg-red-500/10"
                            style={{ color: '#ef4444' }}
                            aria-label="Delete prayer"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                            </svg>
                        </button>
                    )}
                    {dua.repeat && dua.repeat > 1 && (
                        <span className="text-[14px] font-bold px-3 py-1.5 rounded-xl" style={{
                            color: t(theme, 'text-primary'),
                            background: t(theme, 'surface-2'),
                            border: `1px solid ${t(theme, 'border')}`
                        }}>
                            x{dua.repeat}
                        </span>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); toggle({ id: dua.id, type }) }}
                        className="p-2.5 rounded-full transition-all duration-200 active:scale-90"
                        style={{
                            color: fav
                                ? t(theme, 'accent')
                                : t(theme, 'text-muted'),
                        }}
                        aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                    >
                        {fav ? <IconHeartFill size={20} /> : <IconHeart size={20} />}
                    </button>
                </div>
            </div>
        </article>
    )
}
