import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { useQuranList } from '../hooks/useQuran'
import DuaCard from '../components/DuaCard'
import { IconBookmarkFill, IconBookmark, IconBook, IconChevronRight, IconQuran, IconHands, IconNinetyNine } from '../components/Icons'
import { t } from '../utils/theme'
import PageHeader from '../components/PageHeader'

export default function FavoritesPage({ duas = [], asma = [] }) {
    const { theme } = useSettings()
    const { favorites, toggle } = useFavorites()
    const { surahs } = useQuranList()
    const navigate = useNavigate()
    const isDark = theme === 'dark'

    const [activeTab, setActiveTab] = useState('all') // 'all' | 'quran' | 'dua' | 'asma'

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
                const id = parseInt((f.id || '').replace('asma-', ''))
                return asma.find(a => a.id === id)
            })
            .filter(Boolean)
    }, [favorites, asma])

    const favAyahs = useMemo(() => {
        return favorites.filter(f => f.type === 'ayah')
    }, [favorites])

    // Helper to resolve accurate Surah title: "Surah Al-Naas, 2:12"
    const getAyahMeta = (item) => {
        let sNum = item.surahNumber
        let aNum = item.ayahNumber
        if (!sNum || !aNum) {
            const m = (item.id || '').match(/ayah-(\d+)-(\d+)/)
            if (m) {
                sNum = sNum || parseInt(m[1])
                aNum = aNum || parseInt(m[2])
            }
        }
        const surah = surahs?.find(s => s.number === sNum)
        const surahName = item.surahName || surah?.englishName || (sNum ? `Surah ${sNum}` : 'Surah')
        const arabicSurahName = surah?.name || ''
        return {
            sNum,
            aNum,
            surahName,
            arabicSurahName,
            displayTitle: sNum && aNum ? `Surah ${surahName}, ${sNum}:${aNum}` : `Surah ${surahName}`
        }
    }

    const totalCount = favAyahs.length + favDuas.length + favAsma.length
    const isEmpty = totalCount === 0

    // Filter counts
    const counts = {
        all: totalCount,
        quran: favAyahs.length,
        dua: favDuas.length,
        asma: favAsma.length,
    }

    const activeTextCol = isDark ? '#0c0f14' : '#ffffff'

    return (
        <div className="pb-36 max-w-4xl mx-auto min-h-screen px-4 sm:px-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}>
            <PageHeader
                title="Bookmarks"
                subtitle="Saved verses, supplications & divine names"
                showBack={true}
                onBack={() => { if (window.history.length > 1) navigate(-1); else navigate('/settings'); }}
                titleSerif={false}
                titleWeight={400}
                padding="px-2 pt-6 pb-4"
                subtitleCase="title"
            />

            {/* Filter Segment Tabs */}
            {!isEmpty && (
                <div
                    className="grid grid-cols-4 sm:flex items-center gap-1 p-1 rounded-xl border mb-6 text-center"
                    style={{
                        background: t(theme, 'surface-1'),
                        borderColor: t(theme, 'border'),
                    }}
                >
                    {[
                        { id: 'all', label: `All (${counts.all})` },
                        { id: 'quran', label: `Qur'an (${counts.quran})` },
                        { id: 'dua', label: `Duas (${counts.dua})` },
                        { id: 'asma', label: `Names (${counts.asma})` },
                    ].map(tab => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 whitespace-nowrap truncate"
                                style={{
                                    background: isActive ? t(theme, 'accent') : 'transparent',
                                    color: isActive ? activeTextCol : t(theme, 'text-muted'),
                                    boxShadow: isActive ? `0 2px 8px ${t(theme, 'accent-glow')}` : 'none',
                                }}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            )}

            <main className="flex flex-col gap-6">
                {isEmpty ? (
                    <div
                        className="rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center my-6"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                            style={{
                                background: t(theme, 'accent-soft'),
                                color: t(theme, 'accent'),
                                border: `1px solid ${t(theme, 'border')}`
                            }}
                        >
                            <IconBookmark size={26} />
                        </div>
                        <h3 className="text-lg font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                            No bookmarks yet
                        </h3>
                        <p className="text-xs sm:text-sm opacity-65 max-w-sm leading-relaxed mb-6" style={{ color: t(theme, 'text-secondary') }}>
                            Tap the bookmark icon while reading the Holy Qur’an or reciting Duas to save verses and supplications here.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/quran')}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                style={{
                                    background: t(theme, 'accent'),
                                    color: activeTextCol,
                                    boxShadow: `0 2px 8px ${t(theme, 'accent-glow')}`
                                }}
                            >
                                <IconQuran size={15} />
                                <span>Browse Qur'an</span>
                            </button>
                            <button
                                onClick={() => navigate('/library')}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    borderColor: t(theme, 'border'),
                                    color: t(theme, 'text-primary')
                                }}
                            >
                                Explore Duas
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Bookmarked Quran Ayahs ── */}
                        {(activeTab === 'all' || activeTab === 'quran') && favAyahs.length > 0 && (
                            <section className="animate-fade-in">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h2
                                        className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 flex items-center gap-1.5"
                                        style={{ color: t(theme, 'text-muted') }}
                                    >
                                        <IconQuran size={14} style={{ color: t(theme, 'accent') }} />
                                        <span>Bookmarked Verses ({favAyahs.length})</span>
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-3.5">
                                    {favAyahs.map(item => {
                                        const { sNum, aNum, displayTitle, arabicSurahName } = getAyahMeta(item)

                                        return (
                                            <article
                                                key={item.id}
                                                className="rounded-2xl p-4 sm:p-5 border flex flex-col gap-3 transition-all duration-200 hover:border-amber-500/60 group"
                                                style={{
                                                    background: t(theme, 'surface-1'),
                                                    borderColor: t(theme, 'border'),
                                                }}
                                            >
                                                {/* Header: Title e.g. "Surah Al-Naas, 2:12" */}
                                                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: t(theme, 'border') }}>
                                                    <button
                                                        onClick={() => navigate(`/quran/${sNum || 1}`)}
                                                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-left group-hover:text-amber-500 transition-colors"
                                                        style={{ color: t(theme, 'text-primary') }}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                            style={{
                                                                background: t(theme, 'accent-soft'),
                                                                color: t(theme, 'accent'),
                                                            }}
                                                        >
                                                            <IconBook size={14} />
                                                        </div>
                                                        <span className="leading-tight font-bold">{displayTitle}</span>
                                                    </button>

                                                    <div className="flex items-center gap-2">
                                                        {arabicSurahName && (
                                                            <span className="font-arabic text-sm opacity-60 hidden sm:inline" style={{ color: t(theme, 'accent'), direction: 'rtl' }}>
                                                                {arabicSurahName}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => toggle({ id: item.id, type: 'ayah' })}
                                                            className="p-1.5 rounded-lg active:scale-90 transition-transform"
                                                            style={{ color: t(theme, 'accent'), background: t(theme, 'surface-2') }}
                                                            title="Remove bookmark"
                                                            aria-label="Remove bookmark"
                                                        >
                                                            <IconBookmarkFill size={15} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Arabic Verse Text */}
                                                {item.text && (
                                                    <p
                                                        className="text-right text-lg sm:text-xl leading-[2.4] font-arabic select-text py-1"
                                                        style={{
                                                            fontFamily: 'var(--font-arabic)',
                                                            color: t(theme, 'text-primary'),
                                                            direction: 'rtl',
                                                        }}
                                                    >
                                                        {item.text}
                                                    </p>
                                                )}

                                                {/* Transliteration */}
                                                {item.transliteration && (
                                                    <p
                                                        className="text-xs sm:text-[13px] italic font-serif leading-relaxed select-text"
                                                        style={{ color: t(theme, 'accent'), fontFamily: 'var(--font-serif-body)' }}
                                                    >
                                                        {item.transliteration}
                                                    </p>
                                                )}

                                                {/* English Translation */}
                                                {item.translation && (
                                                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed select-text" style={{ color: t(theme, 'text-secondary') }}>
                                                        {item.translation}
                                                    </p>
                                                )}

                                                {/* Footer: Read in context */}
                                                <div className="pt-2 flex items-center justify-between border-t border-dashed" style={{ borderColor: t(theme, 'border') }}>
                                                    <span className="text-[10px] font-mono opacity-40" style={{ color: t(theme, 'text-muted') }}>
                                                        Chapter {sNum} • Verse {aNum}
                                                    </span>
                                                    <button
                                                        onClick={() => navigate(`/quran/${sNum || 1}`)}
                                                        className="flex items-center gap-1.5 text-xs font-bold opacity-80 hover:opacity-100 transition-opacity"
                                                        style={{ color: t(theme, 'accent') }}
                                                    >
                                                        <span>Read in context</span>
                                                        <IconChevronRight size={13} />
                                                    </button>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ── Bookmarked Duas ── */}
                        {(activeTab === 'all' || activeTab === 'dua') && favDuas.length > 0 && (
                            <section className="animate-fade-in">
                                <h2
                                    className="text-xs font-bold uppercase tracking-[0.2em] mb-3 px-1 opacity-60 flex items-center gap-1.5"
                                    style={{ color: t(theme, 'text-muted') }}
                                >
                                    <IconHands size={14} style={{ color: t(theme, 'accent') }} />
                                    <span>Supplications & Prayers ({favDuas.length})</span>
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {favDuas.map(dua => (
                                        <DuaCard key={dua.id} dua={dua} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── Bookmarked 99 Names ── */}
                        {(activeTab === 'all' || activeTab === 'asma') && favAsma.length > 0 && (
                            <section className="animate-fade-in">
                                <h2
                                    className="text-xs font-bold uppercase tracking-[0.2em] mb-3 px-1 opacity-60 flex items-center gap-1.5"
                                    style={{ color: t(theme, 'text-muted') }}
                                >
                                    <IconNinetyNine size={14} style={{ color: t(theme, 'accent') }} />
                                    <span>Names of Allah ({favAsma.length})</span>
                                </h2>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {favAsma.map(name => (
                                        <div
                                            key={name.id}
                                            onClick={() => navigate('/praise')}
                                            className="rounded-2xl p-4 flex flex-col gap-2 border transition-all hover:border-amber-500/50 cursor-pointer group active:scale-[0.98]"
                                            style={{
                                                background: t(theme, 'surface-1'),
                                                borderColor: t(theme, 'border'),
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                                                    style={{
                                                        background: t(theme, 'accent-soft'),
                                                        color: t(theme, 'accent'),
                                                    }}
                                                >
                                                    {name.id}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggle({ id: `asma-${name.id}`, type: 'asma' }); }}
                                                    className="p-1 active:scale-90 transition-transform"
                                                    style={{ color: t(theme, 'accent') }}
                                                    title="Remove bookmark"
                                                >
                                                    <IconBookmarkFill size={15} />
                                                </button>
                                            </div>
                                            <p
                                                className="text-center text-xl font-arabic py-1"
                                                style={{ fontFamily: 'var(--script-font)', color: t(theme, 'text-primary'), direction: 'rtl' }}
                                            >
                                                {name.arabic_name}
                                            </p>
                                            <p
                                                className="text-center text-xs font-semibold"
                                                style={{ color: t(theme, 'accent') }}
                                            >
                                                {name.transliteration}
                                            </p>
                                            <p
                                                className="text-center text-[11px] opacity-70"
                                                style={{ color: t(theme, 'text-muted') }}
                                            >
                                                {name.meaning}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── Tab Empty States when a filter has 0 items ── */}
                        {activeTab === 'quran' && favAyahs.length === 0 && (
                            <div
                                className="rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center my-4 animate-fade-in"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        color: t(theme, 'accent'),
                                        border: `1px solid ${t(theme, 'border')}`
                                    }}
                                >
                                    <IconQuran size={22} />
                                </div>
                                <h3 className="text-base font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                                    No bookmarked verses
                                </h3>
                                <p className="text-xs sm:text-sm opacity-65 max-w-xs leading-relaxed mb-5" style={{ color: t(theme, 'text-secondary') }}>
                                    Tap the bookmark icon on any ayah while reading the Qur’an to save it here.
                                </p>
                                <button
                                    onClick={() => navigate('/quran')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                    style={{
                                        background: t(theme, 'accent'),
                                        color: activeTextCol,
                                        boxShadow: `0 2px 8px ${t(theme, 'accent-glow')}`
                                    }}
                                >
                                    <IconQuran size={15} />
                                    <span>Browse Qur'an</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'dua' && favDuas.length === 0 && (
                            <div
                                className="rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center my-4 animate-fade-in"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        color: t(theme, 'accent'),
                                        border: `1px solid ${t(theme, 'border')}`
                                    }}
                                >
                                    <IconHands size={22} />
                                </div>
                                <h3 className="text-base font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                                    No bookmarked supplications
                                </h3>
                                <p className="text-xs sm:text-sm opacity-65 max-w-xs leading-relaxed mb-5" style={{ color: t(theme, 'text-secondary') }}>
                                    Bookmark daily prayers and prophetic supplications from the library to easily recite them here.
                                </p>
                                <button
                                    onClick={() => navigate('/library')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                    style={{
                                        background: t(theme, 'accent'),
                                        color: activeTextCol,
                                        boxShadow: `0 2px 8px ${t(theme, 'accent-glow')}`
                                    }}
                                >
                                    <IconHands size={15} />
                                    <span>Explore Duas</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'asma' && favAsma.length === 0 && (
                            <div
                                className="rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center my-4 animate-fade-in"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        color: t(theme, 'accent'),
                                        border: `1px solid ${t(theme, 'border')}`
                                    }}
                                >
                                    <IconNinetyNine size={22} />
                                </div>
                                <h3 className="text-base font-bold mb-1" style={{ color: t(theme, 'text-primary') }}>
                                    No bookmarked divine names
                                </h3>
                                <p className="text-xs sm:text-sm opacity-65 max-w-xs leading-relaxed mb-5" style={{ color: t(theme, 'text-secondary') }}>
                                    Save beautiful names from Asma-ul-Husna to reflect upon and recite them here.
                                </p>
                                <button
                                    onClick={() => navigate('/praise')}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                                    style={{
                                        background: t(theme, 'accent'),
                                        color: activeTextCol,
                                        boxShadow: `0 2px 8px ${t(theme, 'accent-glow')}`
                                    }}
                                >
                                    <IconNinetyNine size={15} />
                                    <span>Explore 99 Names</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
