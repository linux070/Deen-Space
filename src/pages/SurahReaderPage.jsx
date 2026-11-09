import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSurah, useQuranList, useLastRead, useReaderSettings } from '../hooks/useQuran'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { t } from '../utils/theme'
import {
    IconChevronLeft,
    IconChevronRight,
    IconBookmark,
    IconBookmarkFill,
    IconCopy,
    IconCheck,
    IconQuran,
    IconSearch,
    IconX,
    RubElHizbBadge,
} from '../components/Icons'

const BISMILLAH_TEXT = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
const BISMILLAH_REGEX = /^[\uFEFF\s]*بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/u

export default function SurahReaderPage() {
    const { surahId } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const currentId = parseInt(surahId) || 1

    const { theme, script, arabicSize, showTranslation, showTransliteration, update } = useSettings()
    const isDark = theme === 'dark'
    const { surah, loading, error } = useSurah(currentId)
    const { surahs } = useQuranList()
    const { lastRead, saveLastRead } = useLastRead()
    const { settings, updateSetting } = useReaderSettings()
    const { isFavorite, toggle } = useFavorites()

    const [copiedAyah, setCopiedAyah] = useState(null)
    const [selectedAyah, setSelectedAyah] = useState(null)
    const [showSelectorModal, setShowSelectorModal] = useState(false)
    const topRef = useRef(null)
    const latestAyahRef = useRef(1)

    // Dynamic offline reading tracker (tracks mouse & scroll)
    const updateReadingAyah = useCallback((num) => {
        if (num && num !== latestAyahRef.current && surah) {
            latestAyahRef.current = num
            saveLastRead({
                surahNumber: surah.number,
                surahEnglishName: surah.englishName,
                ayahNumber: num,
                totalVerses: surah.numberOfAyahs,
            })
        }
    }, [surah, saveLastRead])

    // Initialize reading position on load & resume smoothly
    useEffect(() => {
        if (surah) {
            const paramAyah = parseInt(searchParams.get('ayah'), 10)
            const savedAyah = (lastRead?.surahNumber === surah.number && lastRead?.ayahNumber > 0) ? lastRead.ayahNumber : 1
            const targetNum = (paramAyah && paramAyah > 0 && paramAyah <= surah.numberOfAyahs) ? paramAyah : savedAyah

            latestAyahRef.current = targetNum || 1

            saveLastRead({
                surahNumber: surah.number,
                surahEnglishName: surah.englishName,
                ayahNumber: targetNum || 1,
                totalVerses: surah.numberOfAyahs,
            })

            if (targetNum && targetNum > 1) {
                const timer = setTimeout(() => {
                    const el = document.getElementById(`ayah-${targetNum}`)
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                }, 300)
                return () => clearTimeout(timer)
            }
        }
    }, [surah])

    // Scroll tracker: observe which ayah is in the active reading zone
    useEffect(() => {
        if (!surah?.ayahs?.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const num = parseInt(entry.target.getAttribute('data-ayah'), 10)
                        if (num) {
                            updateReadingAyah(num)
                        }
                    }
                }
            },
            {
                root: null,
                rootMargin: '-60px 0px -65% 0px',
                threshold: 0.1,
            }
        )

        const elements = document.querySelectorAll('[data-ayah]')
        elements.forEach(el => observer.observe(el))

        return () => observer.disconnect()
    }, [surah, updateReadingAyah])

    // Scroll to top instantly when switching surahs (without target ayah)
    useEffect(() => {
        if (!searchParams.get('ayah')) {
            window.scrollTo({ top: 0, behavior: 'instant' })
        }
        setSelectedAyah(null)
    }, [currentId, searchParams])

    // Clean Ayah 1 text (strip duplicate Bismillah if API prepended it)
    const getCleanAyahText = (ayah) => {
        if (!ayah) return ''
        let txt = ayah.text.replace(/^\uFEFF/, '').trim()
        if (ayah.numberInSurah === 1 && currentId !== 1 && currentId !== 9) {
            txt = txt.replace(BISMILLAH_REGEX, '').trim()
        }
        return txt
    }

    // Copy Ayah to clipboard
    const handleCopy = (ayah) => {
        const clean = getCleanAyahText(ayah)
        let text = `${clean}\n\n`
        if (ayah.transliteration) text += `${ayah.transliteration}\n\n`
        text += `"${ayah.translation}"\n\n— Surah ${surah.englishName} [${surah.number}:${ayah.numberInSurah}]`
        navigator.clipboard.writeText(text)
        setCopiedAyah(ayah.numberInSurah)
        setTimeout(() => setCopiedAyah(null), 2000)
    }

    // Previous and Next surahs
    const prevSurah = useMemo(() => {
        if (!surahs || currentId <= 1) return null
        return surahs.find(s => s.number === currentId - 1)
    }, [surahs, currentId])

    const nextSurah = useMemo(() => {
        if (!surahs || currentId >= 114) return null
        return surahs.find(s => s.number === currentId + 1)
    }, [surahs, currentId])

    // Upcoming pending surahs (next 3 chapters in queue)
    const pendingSurahs = useMemo(() => {
        if (!surahs) return []
        return surahs.filter(s => s.number > currentId && s.number <= currentId + 3)
    }, [surahs, currentId])

    const showBismillahBanner = currentId !== 9 && currentId !== 1

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: t(theme, 'surface-0') }}>
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse mb-4"
                    style={{ background: t(theme, 'accent-soft'), color: t(theme, 'accent'), border: `1px solid ${t(theme, 'border')}` }}
                >
                    <IconQuran size={26} />
                </div>
                <p className="text-sm font-semibold tracking-tight" style={{ color: t(theme, 'text-primary') }}>
                    Loading Surah {currentId}...
                </p>
                <p className="text-xs opacity-60 mt-1" style={{ color: t(theme, 'text-muted') }}>
                    Preparing chapter for offline reading
                </p>
            </div>
        )
    }

    if (error || !surah) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: t(theme, 'surface-0') }}>
                <p className="text-base font-semibold mb-3" style={{ color: t(theme, 'text-primary') }}>
                    Could not load this Surah.
                </p>
                <button
                    onClick={() => navigate('/quran')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer"
                    style={{
                        background: t(theme, 'accent'),
                        color: isDark ? '#0c0f14' : '#ffffff',
                    }}
                >
                    Back to all Surahs
                </button>
            </div>
        )
    }

    return (
        <div
            ref={topRef}
            className="min-h-screen pb-36 md:pb-32"
            style={{ background: t(theme, 'surface-0'), color: t(theme, 'text-primary') }}
        >
            {/* ── Sticky Top Navigation Bar ── */}
            <header
                className="sticky top-0 z-40 backdrop-blur-xl border-b transition-all"
                style={{
                    background: t(theme, 'surface-0'),
                    borderColor: t(theme, 'border'),
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.35rem)',
                }}
            >
                <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Back to Surah Index */}
                    <button
                        onClick={() => navigate('/quran')}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                        style={{
                            background: t(theme, 'surface-1'),
                            border: `1px solid ${t(theme, 'border')}`,
                            color: t(theme, 'text-primary'),
                        }}
                        aria-label="Back to all Surahs"
                        title="Back to all Surahs"
                    >
                        <IconChevronLeft size={18} />
                        <span className="text-xs font-semibold hidden sm:inline">Surahs</span>
                    </button>

                    {/* Surah Switcher Modal Trigger Button */}
                    <button
                        onClick={() => setShowSelectorModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border transition-all active:scale-95 hover:border-amber-500/60 min-w-0 flex-1 sm:flex-initial justify-center sm:justify-start cursor-pointer"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                        title="Switch to another Surah"
                    >
                        <IconQuran size={16} style={{ color: t(theme, 'accent') }} className="flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-bold truncate max-w-[130px] sm:max-w-[200px]" style={{ color: t(theme, 'text-primary') }}>
                            {surah.number}. {surah.englishName}
                        </span>
                        <span className="text-[9px] opacity-40 ml-0.5">▼</span>
                    </button>

                    {/* Controls: Mode + Font Size */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* View Mode Switcher */}
                        <div
                            className="flex items-center p-0.5 rounded-xl border"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                            }}
                        >
                            <button
                                onClick={() => updateSetting('viewMode', 'translation')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                style={{
                                    background: settings.viewMode === 'translation' ? t(theme, 'surface-2') : 'transparent',
                                    color: settings.viewMode === 'translation' ? t(theme, 'accent') : t(theme, 'text-muted'),
                                    boxShadow: settings.viewMode === 'translation' ? (isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.06)') : 'none',
                                }}
                            >
                                Verses
                            </button>
                            <button
                                onClick={() => updateSetting('viewMode', 'mushaf')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                                style={{
                                    background: settings.viewMode === 'mushaf' ? t(theme, 'surface-2') : 'transparent',
                                    color: settings.viewMode === 'mushaf' ? t(theme, 'accent') : t(theme, 'text-muted'),
                                    boxShadow: settings.viewMode === 'mushaf' ? (isDark ? '0 1px 4px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.06)') : 'none',
                                }}
                            >
                                Mushaf
                            </button>
                        </div>

                        {/* Font size adjustment */}
                        <div
                            className="flex items-center p-0.5 rounded-xl border"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                            }}
                        >
                            <button
                                onClick={() => {
                                    const next = Math.max(1.25, Number(((arabicSize || 1.75) - 0.25).toFixed(2)))
                                    update('arabicSize', next)
                                    updateSetting('fontSize', Math.round(next * 16))
                                }}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg active:scale-90 cursor-pointer"
                                style={{ color: t(theme, 'text-muted') }}
                                title="Make Arabic text smaller"
                                aria-label="Make Arabic text smaller"
                            >
                                -
                            </button>
                            <span className="text-[10px] font-mono font-bold px-1 select-none" style={{ color: t(theme, 'text-muted') }}>
                                {(arabicSize || 1.75).toFixed(2)}
                            </span>
                            <button
                                onClick={() => {
                                    const next = Math.min(2.75, Number(((arabicSize || 1.75) + 0.25).toFixed(2)))
                                    update('arabicSize', next)
                                    updateSetting('fontSize', Math.round(next * 16))
                                }}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold rounded-lg active:scale-90 cursor-pointer"
                                style={{ color: t(theme, 'text-muted') }}
                                title="Make Arabic text larger"
                                aria-label="Make Arabic text larger"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main Content Area ── */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5">
                {/* ── Surah Masthead (Dignified Quranic Presentation) ── */}
                <section className="text-center pt-2 pb-6 sm:pt-4 sm:pb-8 mb-4 sm:mb-6 flex flex-col items-center">
                    {/* Majestic Arabic Name */}
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-arabic tracking-normal mb-1.5"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--script-font)',
                            direction: 'rtl',
                            lineHeight: 1.4,
                        }}
                    >
                        {surah.name}
                    </h1>

                    {/* Transliterated English Name in Editorial Serif */}
                    <h2
                        className="text-xl sm:text-2xl font-normal tracking-tight"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--font-serif-body)',
                        }}
                    >
                        {surah.englishName}
                    </h2>

                    {/* Meaning / Translation */}
                    <p
                        className="text-xs sm:text-[13px] opacity-60 mt-0.5"
                        style={{
                            color: t(theme, 'text-secondary'),
                            fontFamily: 'var(--font-serif-body)',
                            fontStyle: 'italic',
                        }}
                    >
                        {surah.englishNameTranslation}
                    </p>

                    {/* Majestic Centered Bismillah Presentation (Quran.com Inspired, Responsive & Unified Color) */}
                    {showBismillahBanner && (
                        <div
                            className="w-full max-w-lg mx-auto my-5 sm:my-7 px-4 flex flex-col items-center justify-center select-none animate-fade-in"
                            style={{
                                color: t(theme, 'text-primary'),
                            }}
                        >
                            <div className="w-full flex items-center justify-center gap-2 sm:gap-3.5">
                                {/* Left Delicate Arabesque Hairline */}
                                <div className="h-px flex-1 max-w-[50px] sm:max-w-[80px] bg-gradient-to-r from-transparent via-current to-current opacity-30" />
                                <span className="text-[10px] sm:text-xs opacity-40 font-serif">۞</span>

                                {/* Sacred Calligraphy Text */}
                                <p
                                    className="text-xl sm:text-2xl md:text-3xl font-arabic tracking-normal text-center whitespace-nowrap px-2"
                                    style={{
                                        fontFamily: 'var(--script-font)',
                                        direction: 'rtl',
                                        lineHeight: 1.8,
                                    }}
                                >
                                    {BISMILLAH_TEXT}
                                </p>

                                <span className="text-[10px] sm:text-xs opacity-40 font-serif">۞</span>
                                {/* Right Delicate Arabesque Hairline */}
                                <div className="h-px flex-1 max-w-[50px] sm:max-w-[80px] bg-gradient-to-l from-transparent via-current to-current opacity-30" />
                            </div>
                        </div>
                    )}
                </section>

                {/* ── View Mode: Translation (Simple Divided List — Quran.com Style) ── */}
                {settings.viewMode === 'translation' && (
                    <div
                        className="flex flex-col divide-y transition-colors"
                        style={{ borderColor: t(theme, 'border') }}
                    >
                        {surah.ayahs.map(ayah => {
                            const ayahKey = `ayah-${surah.number}-${ayah.numberInSurah}`
                            const isFav = isFavorite(ayahKey)
                            const isCopied = copiedAyah === ayah.numberInSurah
                            const cleanText = getCleanAyahText(ayah)

                            return (
                                <article
                                    key={ayah.numberInSurah}
                                    id={`ayah-${ayah.numberInSurah}`}
                                    data-ayah={ayah.numberInSurah}
                                    onMouseEnter={() => updateReadingAyah(ayah.numberInSurah)}
                                    className="scroll-mt-24 py-6 sm:py-8 transition-colors flex flex-col gap-3"
                                    style={{
                                        contentVisibility: 'auto',
                                        containIntrinsicSize: '160px',
                                    }}
                                >
                                    {/* Top Bar: Verse Key & Actions (Unboxed, clean editorial layout) */}
                                    <div className="flex items-center justify-between">
                                        {/* Verse Key (e.g. 1:1, 1:33) - Clean, unboxed text */}
                                        <div className="flex items-center select-none">
                                            <span
                                                className="font-mono text-xs sm:text-[13px] font-semibold tracking-wider"
                                                style={{ color: t(theme, 'text-secondary') }}
                                            >
                                                {surah.number}:{ayah.numberInSurah}
                                            </span>
                                        </div>

                                        {/* Action Icons: Copy and Bookmark (unboxed, clean icons) */}
                                        <div className="flex items-center gap-1">
                                            {/* Copy */}
                                            <button
                                                onClick={() => handleCopy(ayah)}
                                                className="p-1.5 rounded-lg opacity-75 hover:opacity-100 transition-all active:scale-90 flex items-center justify-center cursor-pointer"
                                                style={{
                                                    color: isCopied ? t(theme, 'accent') : t(theme, 'text-secondary'),
                                                }}
                                                title="Copy Ayah text, transliteration, and translation"
                                                aria-label="Copy Ayah"
                                            >
                                                {isCopied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                                            </button>

                                            {/* Bookmark / Favorite */}
                                            <button
                                                onClick={() => toggle({
                                                    id: ayahKey,
                                                    type: 'ayah',
                                                    surahNumber: surah.number,
                                                    ayahNumber: ayah.numberInSurah,
                                                    surahName: surah.englishName,
                                                    text: cleanText,
                                                    translation: ayah.translation,
                                                    transliteration: ayah.transliteration,
                                                })}
                                                className="p-1.5 rounded-lg opacity-75 hover:opacity-100 transition-all active:scale-90 flex items-center justify-center cursor-pointer"
                                                style={{
                                                    color: isFav ? t(theme, 'accent') : t(theme, 'text-secondary'),
                                                }}
                                                title={isFav ? 'Remove Bookmark' : 'Bookmark Ayah'}
                                                aria-label="Bookmark Ayah"
                                            >
                                                {isFav ? <IconBookmarkFill size={18} /> : <IconBookmark size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Arabic Verse Text with Ayah End Rub el Hizb Badge */}
                                    <div
                                        className="text-right leading-[2.2] sm:leading-[2.4] my-2 select-text tracking-normal"
                                        style={{
                                            color: t(theme, 'text-primary'),
                                            fontFamily: 'var(--script-font)',
                                            fontSize: 'var(--arabic-size)',
                                            direction: 'rtl',
                                        }}
                                    >
                                        {cleanText}
                                        <RubElHizbBadge
                                            number={ayah.numberInSurah}
                                            size={28}
                                            theme={theme}
                                            className="inline-flex align-middle mx-2"
                                            style={{ verticalAlign: 'middle', direction: 'ltr' }}
                                        />
                                    </div>

                                    {/* Transliteration & Translation (Unboxed, clean editorial typography) */}
                                    {(ayah.transliteration || ayah.translation) && (
                                        <div className="flex flex-col gap-1.5 text-left pt-1">
                                            {/* Phonetic Transliteration */}
                                            {ayah.transliteration && (
                                                <p
                                                    className="text-sm sm:text-[15px] font-medium leading-relaxed italic select-text"
                                                    style={{
                                                        color: t(theme, 'accent'),
                                                        fontFamily: 'var(--font-serif-body)',
                                                    }}
                                                >
                                                    {ayah.transliteration}
                                                </p>
                                            )}

                                            {/* English Translation (Saheeh International) */}
                                            {ayah.translation && (
                                                <p
                                                    className="text-[15px] sm:text-[16.5px] leading-relaxed font-normal select-text opacity-95"
                                                    style={{
                                                        color: t(theme, 'text-primary'),
                                                        fontFamily: 'var(--font-sans)',
                                                    }}
                                                >
                                                    {ayah.translation}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                )}

                {/* ── View Mode: Mushaf (Continuous Reading) ── */}
                {settings.viewMode === 'mushaf' && (
                    <div
                        className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 border leading-[2.1] sm:leading-[2.2] text-justify select-text animate-fade-in"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                            direction: 'rtl',
                            fontFamily: 'var(--script-font)',
                            fontSize: 'var(--arabic-size)',
                            color: t(theme, 'text-primary'),
                        }}
                    >
                        {surah.ayahs.map(ayah => {
                            const cleanText = getCleanAyahText(ayah)
                            const isSelected = selectedAyah?.numberInSurah === ayah.numberInSurah

                            return (
                                <span
                                    key={ayah.numberInSurah}
                                    id={`ayah-${ayah.numberInSurah}`}
                                    data-ayah={ayah.numberInSurah}
                                    onClick={() => setSelectedAyah(ayah)}
                                    onMouseEnter={() => updateReadingAyah(ayah.numberInSurah)}
                                    className="cursor-pointer transition-colors duration-150 rounded px-1"
                                    style={{
                                        background: isSelected ? t(theme, 'accent-soft') : 'transparent',
                                    }}
                                >
                                    {cleanText}
                                    {/* Traditional Ayah End Ornament (Rub el Hizb ۞) */}
                                    <RubElHizbBadge
                                        number={ayah.numberInSurah}
                                        size={28}
                                        theme={theme}
                                        className="inline-flex align-middle mx-1.5"
                                        style={{ verticalAlign: 'middle', direction: 'ltr' }}
                                    />
                                </span>
                            )
                        })}
                    </div>
                )}

                {/* Mushaf Selected Ayah Modal/Tray */}
                {settings.viewMode === 'mushaf' && selectedAyah && (
                    <div
                        className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-xl mx-auto rounded-2xl p-4 shadow-2xl border z-40 animate-slide-up"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'accent'),
                        }}
                    >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: t(theme, 'border') }}>
                            <div className="flex items-center gap-2">
                                <RubElHizbBadge
                                    number={selectedAyah.numberInSurah}
                                    size={24}
                                    theme={theme}
                                />
                                <span className="text-xs font-semibold" style={{ color: t(theme, 'accent'), fontFamily: 'var(--font-serif-body)' }}>
                                    Ayah {selectedAyah.numberInSurah}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggle({
                                        id: `ayah-${surah.number}-${selectedAyah.numberInSurah}`,
                                        type: 'ayah',
                                        surahNumber: surah.number,
                                        ayahNumber: selectedAyah.numberInSurah,
                                        surahName: surah.englishName,
                                        text: getCleanAyahText(selectedAyah),
                                        translation: selectedAyah.translation,
                                        transliteration: selectedAyah.transliteration,
                                    })}
                                    className="p-1.5 rounded-lg text-xs"
                                    style={{
                                        background: isFavorite(`ayah-${surah.number}-${selectedAyah.numberInSurah}`) ? t(theme, 'accent-soft') : t(theme, 'surface-2'),
                                        color: isFavorite(`ayah-${surah.number}-${selectedAyah.numberInSurah}`) ? t(theme, 'accent') : t(theme, 'text-primary'),
                                    }}
                                    title="Bookmark Ayah"
                                >
                                    {isFavorite(`ayah-${surah.number}-${selectedAyah.numberInSurah}`) ? <IconBookmarkFill size={15} /> : <IconBookmark size={15} />}
                                </button>
                                <button
                                    onClick={() => handleCopy(selectedAyah)}
                                    className="p-1.5 rounded-lg text-xs"
                                    style={{ background: t(theme, 'surface-2'), color: t(theme, 'text-primary') }}
                                    title="Copy Ayah"
                                >
                                    <IconCopy size={15} />
                                </button>
                                <button
                                    onClick={() => setSelectedAyah(null)}
                                    className="text-xs font-bold opacity-60 hover:opacity-100 px-1"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        {selectedAyah.transliteration && (
                            <p className="text-xs italic font-serif mb-1.5" style={{ color: t(theme, 'accent') }}>
                                {selectedAyah.transliteration}
                            </p>
                        )}
                        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: t(theme, 'text-secondary') }}>
                            {selectedAyah.translation}
                        </p>
                    </div>
                )}

                {/* ── Next & Upcoming Chapters Section ── */}
                <section className="mt-14 pt-8 border-t flex flex-col gap-6" style={{ borderColor: t(theme, 'border') }}>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50" style={{ color: t(theme, 'text-muted') }}>
                            Next Chapter
                        </span>
                        <span className="text-xs opacity-40 font-mono" style={{ color: t(theme, 'text-muted') }}>
                            Surah {currentId} of 114
                        </span>
                    </div>

                    {/* Next Surah Spotlight Card */}
                    {nextSurah && (
                        <div
                            onClick={() => navigate(`/quran/${nextSurah.number}`)}
                            className="group cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${t(theme, 'surface-1')} 0%, ${t(theme, 'surface-2')} 100%)`,
                                borderColor: t(theme, 'accent'),
                                boxShadow: `0 8px 30px ${t(theme, 'accent-glow')}`,
                            }}
                        >
                            <div className="flex items-start sm:items-center gap-4 min-w-0">
                                <RubElHizbBadge
                                    number={nextSurah.number}
                                    size={46}
                                    theme={theme}
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t(theme, 'accent') }}>
                                            Read Next
                                        </span>
                                        <span className="text-xs opacity-30">•</span>
                                        <span className="text-[11px] opacity-60" style={{ color: t(theme, 'text-muted') }}>
                                            {nextSurah.revelationType} • {nextSurah.numberOfAyahs} Ayahs
                                        </span>
                                    </div>
                                    <h3
                                        className="text-lg sm:text-xl font-bold truncate leading-tight group-hover:text-amber-500 transition-colors"
                                        style={{ color: t(theme, 'text-primary') }}
                                    >
                                        {nextSurah.englishName}
                                    </h3>
                                    <p className="text-xs opacity-60 truncate mt-0.5" style={{ color: t(theme, 'text-secondary') }}>
                                        {nextSurah.englishNameTranslation}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed" style={{ borderColor: t(theme, 'border') }}>
                                <span
                                    className="text-2xl sm:text-3xl font-arabic"
                                    style={{
                                        color: t(theme, 'text-primary'),
                                        fontFamily: 'var(--script-font)',
                                        direction: 'rtl',
                                    }}
                                >
                                    {nextSurah.name}
                                </span>
                                <div
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all group-hover:translate-x-1"
                                    style={{
                                        background: t(theme, 'accent'),
                                        color: isDark ? '#0c0f14' : '#ffffff',
                                    }}
                                >
                                    <span>Read Surah</span>
                                    <IconChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Chapters Strip */}
                    {pendingSurahs.length > 1 && (
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider block mb-3 opacity-40 px-1" style={{ color: t(theme, 'text-muted') }}>
                                Upcoming Surahs
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {pendingSurahs.slice(1).map(s => (
                                    <button
                                        key={s.number}
                                        onClick={() => navigate(`/quran/${s.number}`)}
                                        className="group p-4 rounded-2xl border text-left transition-all active:scale-[0.99] flex items-center justify-between hover:border-amber-500/50"
                                        style={{
                                            background: t(theme, 'surface-1'),
                                            borderColor: t(theme, 'border'),
                                        }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                            <span
                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                                                style={{ background: t(theme, 'surface-2'), color: t(theme, 'accent') }}
                                            >
                                                {s.number}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold truncate group-hover:text-amber-500 transition-colors" style={{ color: t(theme, 'text-primary') }}>
                                                    {s.englishName}
                                                </p>
                                                <p className="text-[11px] opacity-50 truncate" style={{ color: t(theme, 'text-muted') }}>
                                                    {s.englishNameTranslation} • {s.numberOfAyahs} Ayahs
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-base font-arabic opacity-70 flex-shrink-0" style={{ fontFamily: 'var(--script-font)', color: t(theme, 'accent'), direction: 'rtl' }}>
                                            {s.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom Utility Controls */}
                    <nav className="flex items-center justify-between gap-3 pt-4">
                        {prevSurah ? (
                            <button
                                onClick={() => navigate(`/quran/${prevSurah.number}`)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    borderColor: t(theme, 'border'),
                                    color: t(theme, 'text-primary'),
                                }}
                            >
                                <IconChevronLeft size={16} style={{ color: t(theme, 'accent') }} />
                                <span>Surah {prevSurah.number}</span>
                            </button>
                        ) : <div />}

                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="px-4 py-2 text-xs font-semibold opacity-60 hover:opacity-100 rounded-xl transition-opacity"
                            style={{ color: t(theme, 'text-muted') }}
                        >
                            ↑ Back to Top
                        </button>

                        <button
                            onClick={() => navigate('/quran')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                                color: t(theme, 'text-primary'),
                            }}
                        >
                            <span>Surah Index</span>
                            <IconChevronRight size={16} style={{ color: t(theme, 'accent') }} />
                        </button>
                    </nav>
                </section>
            </main>

            {/* ── Responsive Surah Selector Dialog Modal ── */}
            <SurahSelectorModal
                isOpen={showSelectorModal}
                onClose={() => setShowSelectorModal(false)}
                surahs={surahs}
                currentId={currentId}
                onSelect={(id) => {
                    setShowSelectorModal(false)
                    navigate(`/quran/${id}`)
                }}
                theme={theme}
            />
        </div>
    )
}

/**
 * Responsive Surah Selector Dialog Modal
 * Designed with senior UI/UX craftsmanship:
 * - 100% solid, non-transparent surfaces in dark, cream, and light modes
 * - Sleek iOS-style segmented control for All / Meccan / Medinan
 * - Illuminated active reading indicator with auto-scroll into view
 * - High-contrast text on all active and inactive tabs
 */
function SurahSelectorModal({ isOpen, onClose, surahs, currentId, onSelect }) {
    const { theme, script, arabicSize, showTranslation, showTransliteration, update } = useSettings()
    const isDark = theme === 'dark'
    const [search, setSearch] = useState('')
    const selectedRef = useRef(null)
    const listRef = useRef(null)

    // Lock body scroll when modal is open and reset search
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            setSearch('')
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // Smooth auto-scroll to active surah when modal opens
    useEffect(() => {
        if (isOpen && selectedRef.current) {
            const timer = setTimeout(() => {
                selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
            }, 120)
            return () => clearTimeout(timer)
        }
    }, [isOpen, currentId])

    // ESC key closes modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const filtered = useMemo(() => {
        if (!surahs) return []
        const q = search.trim().toLowerCase()
        if (!q) return surahs
        return surahs.filter(s =>
            s.number.toString() === q ||
            s.englishName.toLowerCase().includes(q) ||
            s.englishNameTranslation.toLowerCase().includes(q) ||
            s.name.includes(q)
        )
    }, [surahs, search])

    if (!isOpen) return null

    // High contrast button text:
    const activeTextCol = isDark ? '#0c0f14' : '#ffffff'

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="surah-modal-title"
        >
            <div
                className="w-full sm:max-w-lg rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-slide-up sm:animate-scale-up"
                style={{
                    background: t(theme, 'surface-1'),
                    borderColor: t(theme, 'border'),
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="px-5 py-4 sm:px-6 sm:py-4.5 border-b flex items-center justify-between flex-shrink-0"
                    style={{ borderColor: t(theme, 'border'), background: t(theme, 'surface-1') }}
                >
                    <h2
                        id="surah-modal-title"
                        className="text-lg sm:text-xl font-normal tracking-tight"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--font-serif-body)',
                        }}
                    >
                        Jump to Surah
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-all active:scale-90 cursor-pointer"
                        style={{
                            background: t(theme, 'surface-2'),
                            color: t(theme, 'text-primary'),
                            border: `1px solid ${t(theme, 'border')}`,
                        }}
                        aria-label="Close modal"
                    >
                        <IconX size={14} />
                    </button>
                </div>

                {/* Search Bar */}
                <div
                    className="p-3.5 sm:p-4 border-b flex-shrink-0"
                    style={{ borderColor: t(theme, 'border'), background: t(theme, 'surface-1') }}
                >
                    <div
                        className="flex items-center px-4 py-3 rounded-2xl border text-xs sm:text-sm transition-all shadow-xs focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/15"
                        style={{
                            background: t(theme, 'surface-2'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        <div className="flex items-center pr-3 flex-shrink-0 opacity-50" style={{ color: t(theme, 'accent') }}>
                            <IconSearch size={17} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Surah or number..."
                            className="w-full bg-transparent outline-none placeholder:opacity-40 text-xs sm:text-sm font-medium"
                            style={{ color: t(theme, 'text-primary') }}
                            autoFocus={false}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                aria-label="Clear search"
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 hover:opacity-100 opacity-60 flex-shrink-0 ml-2 shadow-xs cursor-pointer"
                                style={{
                                    background: t(theme, 'surface-1'),
                                    color: t(theme, 'text-muted'),
                                }}
                            >
                                <IconX size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Surah list (Continuous Divided Ledger) */}
                <div
                    ref={listRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 touch-pan-y"
                    style={{ background: t(theme, 'surface-1'), WebkitOverflowScrolling: 'touch' }}
                >
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-xs opacity-60" style={{ color: t(theme, 'text-muted') }}>
                            No Surah found matching "{search}"
                        </div>
                    ) : (
                        <div
                            className="rounded-2xl border overflow-hidden"
                            style={{
                                background: t(theme, 'surface-1'),
                                borderColor: t(theme, 'border'),
                            }}
                        >
                            {filtered.map((s, idx) => {
                                const isSelected = s.number === currentId
                                const isLast = idx === filtered.length - 1
                                return (
                                    <button
                                        key={s.number}
                                        ref={isSelected ? selectedRef : null}
                                        onClick={() => onSelect(s.number)}
                                        className={`w-full flex items-center justify-between px-4 py-3 sm:px-4.5 sm:py-3.5 text-left transition-colors duration-150 group cursor-pointer ${
                                            isSelected ? 'bg-amber-500/10' : 'hover:bg-black/[0.025] dark:hover:bg-white/[0.025]'
                                        }`}
                                        style={{
                                            borderBottom: isLast ? 'none' : `1px solid ${t(theme, 'border')}`,
                                            borderLeft: isSelected ? `3px solid ${t(theme, 'accent')}` : '3px solid transparent',
                                        }}
                                    >
                                        {/* Left: Number crest + Names */}
                                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-3 flex-1">
                                            <RubElHizbBadge
                                                number={s.number}
                                                size={34}
                                                theme={theme}
                                                isSelected={isSelected}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h4
                                                    className="text-xs sm:text-sm font-medium truncate leading-tight group-hover:text-amber-500 transition-colors"
                                                    style={{
                                                        color: isSelected ? t(theme, 'accent') : t(theme, 'text-primary'),
                                                        fontFamily: 'var(--font-serif-body)',
                                                    }}
                                                >
                                                    {s.englishName}
                                                </h4>
                                                <div
                                                    className="flex items-center gap-1.5 mt-0.5 text-[11px] opacity-55 font-normal leading-tight"
                                                    style={{ color: t(theme, 'text-muted'), fontFamily: 'var(--font-sans)' }}
                                                >
                                                    <span className="truncate">{s.englishNameTranslation}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Authentic Arabic calligraphy + Verses count underneath */}
                                        <div className="flex flex-col items-end flex-shrink-0 pl-2 text-right">
                                            <span
                                                className="text-base sm:text-lg font-arabic leading-tight transition-transform duration-200 group-hover:scale-105"
                                                style={{
                                                    fontFamily: 'var(--script-font)',
                                                    color: isSelected ? t(theme, 'accent') : t(theme, 'text-primary'),
                                                    direction: 'rtl',
                                                }}
                                            >
                                                {s.name}
                                            </span>
                                            <span
                                                className="text-[12px] opacity-70 font-medium tracking-wide leading-normal mt-2 whitespace-nowrap"
                                                style={{ color: t(theme, 'text-muted'), fontFamily: 'var(--font-sans)' }}
                                            >
                                                {s.numberOfAyahs} Ayahs
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
