import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import DuaCard from '../components/DuaCard'
import { IconHeartFill } from '../components/Icons'
import { t } from '../utils/theme'
import PageHeader from '../components/PageHeader'

export default function FavoritesPage({ duas, asma }) {
    const { theme } = useSettings()
    const { favorites, toggle } = useFavorites()
    const navigate = useNavigate()

    const favDuas = useMemo(() => {
        return favorites
            .filter(f => f.type === 'dua')
            .map(f => duas.find(d => d.id === f.id))
            .filter(Boolean)
    }, [favorites, duas])

    const favAsma = useMemo(() => {
        return favorites
            .filter(f => f.type === 'asma')
            .map(f => {
                const id = parseInt(f.id.replace('asma-', ''))
                return asma.find(a => a.id === id)
            })
            .filter(Boolean)
    }, [favorites, asma])

    const isEmpty = favDuas.length === 0 && favAsma.length === 0

    return (
        <div className="pb-32 max-w-xl md:max-w-6xl mx-auto min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <PageHeader
                title="Favourites"
                subtitle="Your pinned Duas, Names & Salawat"
                showBack={false}
                titleSerif={false}
                titleWeight={400}
                padding="px-6 pt-16 pb-12"
                subtitleCase="title"
            />


            <main className="px-4 flex flex-col gap-4">
                {isEmpty ? (
                    <div className="text-center py-20">
                        <div
                            className="text-5xl mb-4"
                            style={{ color: t(theme, 'text-muted') }}
                        >
                            🤲
                        </div>
                        <p
                            className="text-lg font-medium mb-2"
                            style={{ color: t(theme, 'text-secondary') }}
                        >
                            Your favourites list is empty
                        </p>
                        <p
                            className="text-sm max-w-xs mx-auto"
                            style={{ color: t(theme, 'text-muted') }}
                        >
                            Tap the heart icon on any dua, name, or salawat to add it to your personal favourites.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Saved Names */}
                        {favAsma.length > 0 && (
                            <section>
                                <h2
                                    className="text-sm font-semibold uppercase tracking-wider mb-3"
                                    style={{ color: t(theme, 'text-muted') }}
                                >
                                    Names of Allah ({favAsma.length})
                                </h2>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {favAsma.map(name => (
                                        <div
                                            key={name.id}
                                            className="rounded-2xl p-4 flex flex-col gap-1.5"
                                            style={{
                                                background: t(theme, 'surface-1'),
                                                border: `1px solid ${t(theme, 'border')}`,
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                                                    style={{
                                                        background: t(theme, 'accent-soft'),
                                                        color: t(theme, 'accent'),
                                                    }}
                                                >{name.id}</span>
                                                <button
                                                    onClick={() => toggle({ id: `asma-${name.id}`, type: 'asma' })}
                                                    className="p-1 active:scale-90 transition-transform duration-150"
                                                    style={{ color: t(theme, 'accent') }}
                                                >
                                                    <IconHeartFill size={14} />
                                                </button>
                                            </div>
                                            <p
                                                className="text-center text-xl"
                                                style={{ fontFamily: 'var(--script-font)', color: t(theme, 'text-primary'), direction: 'rtl' }}
                                            >
                                                {name.arabic_name}
                                            </p>
                                            <p
                                                className="text-center text-xs font-medium"
                                                style={{ color: t(theme, 'accent') }}
                                            >
                                                {name.transliteration}
                                            </p>
                                            <p
                                                className="text-center text-xs"
                                                style={{ color: t(theme, 'text-muted') }}
                                            >
                                                {name.meaning}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Saved Duas */}
                        {favDuas.length > 0 && (
                            <section>
                                <h2
                                    className="text-sm font-medium uppercase tracking-wider mb-3 mt-2"
                                    style={{ color: t(theme, 'text-muted') }}
                                >
                                    Duas & Salawat ({favDuas.length})
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {favDuas.map(dua => (
                                        <DuaCard key={dua.id} dua={dua} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
