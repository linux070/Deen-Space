import { useState, useCallback } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { useAudioCtx } from '../context/AudioContext'
import { IconHeartFill, IconHeart, IconVolume, IconRefresh } from './Icons'
import { t } from '../utils/theme'

export default function DuaCard({ dua, type = 'dua', isCountingMode = false, hideAudio = false, hideCounter = false, label }) {
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
            {label && (
                <div className="px-6 pt-5 pb-0 flex justify-start">
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

                <div className={`flex-1 ${isCountingMode ? 'max-h-[30vh]' : ''}`}>
                    {/* Transliteration */}
                    {showTransliteration && dua.transliteration && (
                        <p
                            className="text-[15px] italic leading-relaxed mb-6 text-capitalize"
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
                            className="text-[15px] italic leading-relaxed text-capitalize"
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

            {/* Counting Area (if repeat > 1) */}
            {dua.repeat && dua.repeat > 1 && !hideCounter && (
                <div
                    className={`mt-auto px-6 py-6 border-t flex flex-col items-center gap-3`}
                    style={{
                        borderColor: t(theme, 'surface-3'),
                        background: isCountingMode ? t(theme, 'surface-2') : 'transparent'
                    }}
                >
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: t(theme, 'text-muted') }}>Progress</span>
                            <span className="text-xl font-bold tabular-nums" style={{ color: t(theme, 'accent') }}>
                                {count} <span className="text-sm" style={{ color: t(theme, 'text-muted') }}>/ {dua.repeat}</span>
                            </span>
                        </div>
                        <button
                            onClick={resetCount}
                            className="p-2 rounded-xl transition-all duration-200 active:rotate-180"
                            style={{ background: t(theme, 'surface-3'), color: t(theme, 'text-secondary') }}
                        >
                            <IconRefresh size={18} />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: t(theme, 'surface-3') }}>
                        <div
                            className="h-full transition-all duration-300 rounded-full"
                            style={{
                                width: `${(count / dua.repeat) * 100}%`,
                                background: t(theme, 'accent'),
                                boxShadow: `0 0 10px ${t(theme, 'accent')}44`
                            }}
                        />
                    </div>
                    {isCountingMode && (
                        <p className="text-[10px] text-center mt-1 font-medium animate-pulse" style={{ color: t(theme, 'text-muted') }}>
                            Tap anywhere on the card to count
                        </p>
                    )}
                </div>
            )}

            {/* Footer: Reference + Actions */}
            <div className="flex items-center justify-between px-6 py-4" style={{ background: t(theme, 'surface-1') }}>
                <div className="flex items-center gap-2">
                    {dua.reference && (
                        <span
                            className="text-[10px] px-2.5 py-1 rounded-lg font-bold tracking-[0.1em]"
                            style={{
                                background: t(theme, 'surface-2'),
                                color: t(theme, 'text-secondary'),
                                border: `1px solid ${t(theme, 'border')}`
                            }}
                        >
                            {dua.reference}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
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
                    {!hideAudio && (
                        <button
                            onClick={(e) => { e.stopPropagation(); speak(dua.arabic_text, dua.id) }}
                            className="p-2.5 rounded-full transition-all duration-200 active:scale-90 relative"
                            style={{
                                color: isPlaying
                                    ? t(theme, 'accent')
                                    : t(theme, 'text-muted'),
                            }}
                            aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
                        >
                            <IconVolume size={20} />
                            {isPlaying && (
                                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: t(theme, 'accent') }}></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: t(theme, 'accent') }}></span>
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </article>
    )
}
