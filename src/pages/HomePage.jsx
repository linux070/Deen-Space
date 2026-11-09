import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHijriDate } from '../utils/hijri.js'
import { useSettings } from '../context/SettingsContext'
import { useFavorites } from '../context/FavoritesContext'
import { t } from '../utils/theme'
import {
    IconHands,
    IconBook,
    IconCalendar,
    IconNinetyNine,
    IconCompass,
    IconChevronRight,
    IconQuran,
    IconBookmark,
    IconBookmarkFill,
    IconCopy,
    IconCheck,
    RubElHizbBadge,
} from '../components/Icons'
import { useQuranList, useLastRead } from '../hooks/useQuran'

const VERSES = [
    {
        arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
        transliteration: 'Fadhkuruunee adhkurkum',
        translation: '"So remember Me; I will remember you."',
        reference: 'Surah Al-Baqarah 2:152',
        surahNumber: 2
    },
    {
        arabic: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
        transliteration: 'Laa taqnatuu mir rahmatil laah',
        translation: '"Do not despair of the mercy of Allah."',
        reference: 'Surah Az-Zumar 39:53',
        surahNumber: 39
    },
    {
        arabic: 'إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ',
        transliteration: 'Innal laaha yuhibbul mutawakkileen',
        translation: '"Indeed, Allah loves those who rely [upon Him]."',
        reference: 'Surah Al-Imran 3:159',
        surahNumber: 3
    },
    {
        arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
        transliteration: "Wahuwa ma'akum ayna maa kuntum",
        translation: '"And He is with you wherever you are."',
        reference: 'Surah Al-Hadid 57:4',
        surahNumber: 57
    },
    {
        arabic: 'إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ',
        transliteration: "Innal laaha ma'alladheenat taqaw walladheena hum muhsinuun",
        translation: '"Indeed, Allah is with those who fear Him and those who are doers of good."',
        reference: 'Surah An-Nahl 16:128',
        surahNumber: 16
    },
    {
        arabic: 'وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ',
        transliteration: "Wamaa kaanal laahu mu'adh-dhibahum wahum yastaghfiruun",
        translation: '"And Allah would not punish them while they seek forgiveness."',
        reference: 'Surah Al-Anfal 8:33',
        surahNumber: 8
    },
    {
        arabic: 'وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا',
        transliteration: "Wal-dhaakireenal laaha katheeraw wal-dhaakiraati a'addal laahu lahum maghfirataw wa-ajran 'azeemaa",
        translation: '"...and the men who remember Allah often and the women who do so - for them Allah has prepared forgiveness and a great reward."',
        reference: 'Surah Al-Ahzab 33:35',
        surahNumber: 33
    },
    {
        arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
        transliteration: 'La-in shakartum la-azeedannakum',
        translation: '"If you are grateful, I will surely increase you [in favor]."',
        reference: 'Surah Ibrahim 14:7',
        surahNumber: 14
    },
    {
        arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
        transliteration: 'Walladheena jaahaduu feenaa lanahdiyannahum subulanaa',
        translation: '"And those who strive for Us - We will surely guide them to Our ways."',
        reference: 'Surah Al-Ankabut 29:69',
        surahNumber: 29
    },
    {
        arabic: 'وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ',
        transliteration: 'Waman yaghfirudh dhunuuba illal laah',
        translation: '"And who can forgive sins except Allah?"',
        reference: 'Surah Al-Imran 3:135',
        surahNumber: 3
    },
    {
        arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        transliteration: "Alaa bidhikril laahi tatma'innul quluub",
        translation: '"Unquestionably, by the remembrance of Allah hearts are assured."',
        reference: "Surah Ar-Ra'd 13:28",
        surahNumber: 13
    },
    {
        arabic: 'وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا',
        transliteration: 'Waman yattaqil laaha yaj\'al lahu makhrajaa',
        translation: '"And whoever fears Allah - He will make for him a way out."',
        reference: 'Surah At-Talaq 65:2',
        surahNumber: 65
    },
    {
        arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        transliteration: "Inna ma'al 'usri yusraa",
        translation: '"Indeed, with hardship [will be] ease."',
        reference: 'Surah Ash-Sharh 94:6',
        surahNumber: 94
    },
    {
        arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
        transliteration: "Waqul rabbi zidnee 'ilmaa",
        translation: '"And say, \"My Lord, increase me in knowledge.\""',
        reference: 'Surah Ta-Ha 20:114',
        surahNumber: 20
    },
    {
        arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
        transliteration: "Robbanaa taqabbal minnaa innaka antas samee'ul 'aleem",
        translation: '"Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing."',
        reference: 'Surah Al-Baqarah 2:127',
        surahNumber: 2
    },
    {
        arabic: 'وَقُلِ الْحَمْدُ لِلَّهِ الَّذِي لَمْ يَتَّخِذْ وَلَدًا',
        transliteration: 'Waqulil hamdu lillaahil ladhee lam yattakhidh waladaa',
        translation: '"And say, \"Praise to Allah, who has not taken a son...\""',
        reference: 'Surah Al-Isra 17:111',
        surahNumber: 17
    },
    {
        arabic: 'وَاللَّهُ يَعْلَمُ مَا فِي قُلُوبِكُمْ',
        transliteration: 'Wallahu ya\'lamu maa fee quluubikum',
        translation: '"And Allah knows what is in your hearts."',
        reference: 'Surah Al-Ahzab 33:51',
        surahNumber: 33
    },
    {
        arabic: 'فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ',
        transliteration: 'Fasbir inna wa\'dal laahi haqqun',
        translation: '"So be patient. Indeed, the promise of Allah is truth."',
        reference: 'Surah Ar-Rum 30:60',
        surahNumber: 30
    },
    {
        arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
        transliteration: 'Wa-idhaa sa-alaka \'ibaadee \'annee fa-innee qareeb',
        translation: '"And when My servants ask you concerning Me - indeed I am near."',
        reference: 'Surah Al-Baqarah 2:186',
        surahNumber: 2
    },
    {
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
        transliteration: 'Robbanaa aatinaa fid dunyaa hasanatan wa-fil aakhirati hasanah',
        translation: '"Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good."',
        reference: 'Surah Al-Baqarah 2:201',
        surahNumber: 2
    },
    {
        arabic: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ',
        transliteration: 'Watawakkal \'alal hayyil ladhee laa yamuut',
        translation: '"And rely upon the Ever-Living who does not die."',
        reference: 'Surah Al-Furqan 25:58',
        surahNumber: 25
    },
    {
        arabic: 'فَإِنَّ حَسْبَكَ اللَّهُ',
        transliteration: 'Fa-inna hasbakal laah',
        translation: '"Then indeed, Allah is sufficient for you."',
        reference: 'Surah Al-Anfal 8:62',
        surahNumber: 8
    },
    {
        arabic: 'وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ',
        transliteration: 'Wa\'bud rabbaka hattaa ya-tiyakal yaqeen',
        translation: '"And worship your Lord until there comes to you the certainty."',
        reference: 'Surah Al-Hijr 15:99',
        surahNumber: 15
    },
    {
        arabic: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
        transliteration: 'Waqaala rabbukum ud\'uunee astajib lakum',
        translation: '"And your Lord says, \"Call upon Me; I will respond to you.\""',
        reference: 'Surah Ghafir 40:60',
        surahNumber: 40
    },
]

export default function HomePage({ duas = [], asma = [] }) {
    const navigate = useNavigate()
    const { theme } = useSettings()
    const isDark = theme === 'dark'
    const { lastRead } = useLastRead()
    const { surahs } = useQuranList()

    const currentSurah = useMemo(() => {
        if (!lastRead?.surahNumber || !surahs?.length) return null
        return surahs.find(s => s.number === Number(lastRead.surahNumber))
    }, [lastRead, surahs])

    const totalVerses = lastRead?.totalVerses || currentSurah?.numberOfAyahs || 85
    const surahEnglishName = lastRead?.surahEnglishName || currentSurah?.englishName || `Surah ${lastRead?.surahNumber || 40}`
    const currentAyah = lastRead?.ayahNumber || 1
    const progressPercent = Math.max(3, Math.min(100, Math.round((currentAyah / totalVerses) * 100)))

    // Dynamic greeting based on time of day
    const greeting = useMemo(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 18) return 'Good Afternoon'
        return 'Good Evening'
    }, [])

    // Gregorian date
    const dateParts = useMemo(() => {
        const now = new Date()
        return {
            dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
            monthDay: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
            year: now.getFullYear()
        }
    }, [])

    // Hijri date
    const hijri = useMemo(() => getHijriDate(), [])

    // Current week strip (Sunday to Saturday) matching the calendar card design
    const weekDays = useMemo(() => {
        const today = new Date()
        const currentDayIndex = today.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
        const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

        const days = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() - currentDayIndex + i)
            days.push({
                label: dayLabels[i],
                dateNum: d.getDate(),
                isToday: i === currentDayIndex,
                key: `${i}-${d.getDate()}`
            })
        }
        return days
    }, [])

    // Rotating daily verse
    const verseOfTheDay = useMemo(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
        return VERSES[dayOfYear % VERSES.length]
    }, [])

    const { toggle: toggleBookmark, isFavorite } = useFavorites()
    const [copiedVerse, setCopiedVerse] = useState(false)

    const verseId = `daily-verse-${verseOfTheDay.surahNumber || 'vod'}-${verseOfTheDay.reference}`
    const isVerseBookmarked = isFavorite(verseId)

    const handleCopyVerse = (e) => {
        e.stopPropagation()
        const textToCopy = `${verseOfTheDay.arabic}\n\n${verseOfTheDay.transliteration ? verseOfTheDay.transliteration + '\n\n' : ''}${verseOfTheDay.translation}\n\n— ${verseOfTheDay.reference}`
        navigator.clipboard.writeText(textToCopy)
        setCopiedVerse(true)
        setTimeout(() => setCopiedVerse(false), 2000)
    }

    const handleBookmarkVerse = (e) => {
        e.stopPropagation()
        toggleBookmark({
            id: verseId,
            type: 'quran',
            title: verseOfTheDay.reference,
            surahName: verseOfTheDay.reference,
            surahNumber: verseOfTheDay.surahNumber,
            arabic: verseOfTheDay.arabic,
            text: verseOfTheDay.arabic,
            transliteration: verseOfTheDay.transliteration,
            translation: verseOfTheDay.translation,
        })
    }

    const activeTextCol = isDark ? '#0c0f14' : '#ffffff'

    return (
        <div
            className="pb-36 px-4 sm:px-6 md:px-8 flex flex-col gap-6 max-w-5xl mx-auto"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}
        >
            {/* ── 1. Editorial Greeting Header ── */}
            <header className="animate-fade-in flex flex-col pt-1">
                <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight leading-tight"
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--font-serif-body)',
                    }}
                >
                    Assalamu Alaikum
                </h1>
                <p
                    className="text-xs sm:text-sm font-normal mt-1"
                    style={{
                        color: t(theme, 'text-secondary'),
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    {greeting}, welcome back to your space.
                </p>
            </header>

            {/* ── 2. "Continue Reciting" Banner ── */}
            {lastRead && (
                <section className="animate-fade-in" style={{ animationDelay: '40ms' }}>
                    <div
                        onClick={() => navigate(`/quran/${lastRead.surahNumber}?ayah=${currentAyah}`)}
                        className="group relative cursor-pointer rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-sm hover:border-amber-500/60"
                        style={{
                            background: t(theme, 'surface-1'),
                            borderColor: t(theme, 'border'),
                        }}
                    >
                        {/* Top: Rub el Hizb Medallion, Surah Info, Circular Play Button */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <RubElHizbBadge
                                    number={lastRead.surahNumber}
                                    size={48}
                                    theme={theme}
                                />
                                <div className="min-w-0 flex flex-col">
                                    <span
                                        className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] mb-0.5"
                                        style={{
                                            color: t(theme, 'accent'),
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Continue Reciting
                                    </span>
                                    <h3
                                        className="text-lg sm:text-xl font-normal truncate tracking-tight transition-colors group-hover:text-amber-500"
                                        style={{
                                            color: t(theme, 'text-primary'),
                                            fontFamily: 'var(--font-serif-body)',
                                        }}
                                    >
                                        {surahEnglishName}
                                    </h3>
                                    <p
                                        className="text-xs truncate mt-0.5 font-normal"
                                        style={{
                                            color: t(theme, 'text-secondary'),
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Surah {lastRead.surahNumber} · Verse {currentAyah} of {totalVerses}
                                    </p>
                                </div>
                            </div>

                            {/* Circular Play Button */}
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 active:scale-95 shadow-sm"
                                style={{
                                    background: t(theme, 'accent'),
                                    color: isDark ? '#0c0f14' : '#ffffff',
                                    boxShadow: `0 4px 14px ${t(theme, 'accent-glow')}`,
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="6 3 20 12 6 21 6 3" />
                                </svg>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div
                            className="w-full h-1.5 rounded-full overflow-hidden mt-4"
                            style={{ background: t(theme, 'surface-2') }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${progressPercent}%`,
                                    background: t(theme, 'accent'),
                                }}
                            />
                        </div>

                        {/* Bottom Info Row */}
                        <div
                            className="flex items-center justify-between text-xs mt-3 font-normal"
                            style={{
                                color: t(theme, 'text-secondary'),
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            <span>Resume from verse {currentAyah}</span>
                            <span style={{ fontFamily: 'var(--font-serif-body)' }}>{currentAyah} / {totalVerses}</span>
                        </div>
                    </div>
                </section>
            )}

            {/* ── 3. Islamic Calendar Editorial Card ── */}
            <section className="animate-fade-in" style={{ animationDelay: '80ms' }}>
                <div
                    className="rounded-3xl p-6 sm:p-7 border relative transition-all duration-300 shadow-sm"
                    style={{
                        background: t(theme, 'surface-1'),
                        borderColor: t(theme, 'border'),
                    }}
                >
                    <div className="flex flex-col">
                        {/* Section Tagline */}
                        <span
                            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] mb-2.5"
                            style={{
                                color: t(theme, 'text-secondary'),
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            Islamic Calendar
                        </span>

                        {/* Sacred Hijri Date with Year & AH inline using Lora serif font */}
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h2
                                className="leading-tight tracking-tight text-2xl sm:text-3xl md:text-[2.1rem]"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-serif-body)',
                                    fontWeight: 400,
                                }}
                            >
                                {hijri.day} {hijri.monthName}
                            </h2>
                            <span
                                className="text-lg sm:text-xl md:text-2xl font-light opacity-50 whitespace-nowrap"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-serif-body)',
                                    fontWeight: 400,
                                }}
                            >
                                {hijri.year} {hijri.yearSuffix}
                            </span>
                        </div>

                        {/* Gregorian Date */}
                        <p
                            className="text-xs sm:text-sm font-normal mt-2"
                            style={{
                                color: t(theme, 'text-secondary'),
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            {dateParts.dayName}, {dateParts.monthDay}, {dateParts.year}
                        </p>

                        {/* 7-Day Current Week Strip */}
                        <div className="mt-6 sm:mt-7 flex items-center justify-between gap-1 sm:gap-2 w-full max-w-sm">
                            {weekDays.map((day) => (
                                <div
                                    key={day.key}
                                    className={`flex-1 max-w-[44px] flex flex-col items-center justify-center py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 ${
                                        day.isToday ? 'scale-105 shadow-md' : 'opacity-85 hover:opacity-100'
                                    }`}
                                    style={
                                        day.isToday
                                            ? {
                                                  background: t(theme, 'accent'),
                                                  color: isDark ? '#0c0f14' : '#ffffff',
                                                  boxShadow: `0 4px 14px ${t(theme, 'accent-glow')}`,
                                              }
                                            : {
                                                  background: t(theme, 'surface-2'),
                                                  color: t(theme, 'text-primary'),
                                                  border: `1px solid ${t(theme, 'border')}`,
                                              }
                                    }
                                >
                                    <span
                                        className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-0.5"
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            color: day.isToday
                                                ? (isDark ? '#0c0f14' : '#ffffff')
                                                : t(theme, 'text-muted'),
                                            opacity: day.isToday ? 0.95 : 0.65,
                                        }}
                                    >
                                        {day.label}
                                    </span>
                                    <span
                                        className="text-sm sm:text-base leading-none font-bold"
                                        style={{
                                            fontFamily: 'var(--font-serif-body)',
                                            color: day.isToday
                                                ? (isDark ? '#0c0f14' : '#ffffff')
                                                : t(theme, 'text-primary'),
                                        }}
                                    >
                                        {day.dateNum}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. Quick Access Sanctuary Card (Explore) ── */}
            <section className="animate-fade-in" style={{ animationDelay: '120ms' }}>
                <div
                    className="rounded-3xl p-5 sm:p-7 border relative transition-all duration-300 shadow-sm"
                    style={{
                        background: t(theme, 'surface-1'),
                        borderColor: t(theme, 'border'),
                    }}
                >
                    {/* Header inside the container: Explore */}
                    <div className="mb-4 sm:mb-5 pb-3 border-b" style={{ borderColor: t(theme, 'border') }}>
                        <span
                            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em]"
                            style={{
                                color: t(theme, 'text-secondary'),
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            Explore
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:gap-6 items-start">
                        <QuickAccessItem
                            titleLine1="Dua"
                            titleLine2="Library"
                            icon={IconHands}
                            onClick={() => navigate('/library')}
                            theme={theme}
                        />
                        <QuickAccessItem
                            titleLine1="Daily"
                            titleLine2="Guidance"
                            icon={IconBook}
                            onClick={() => {
                                const saved = localStorage.getItem('last-daily-category')
                                navigate(saved ? `/daily/${saved}` : '/daily')
                            }}
                            theme={theme}
                        />
                        <QuickAccessItem
                            titleLine1="40"
                            titleLine2="Robbana"
                            icon={IconCompass}
                            onClick={() => navigate('/library/robbana')}
                            theme={theme}
                        />
                        <QuickAccessItem
                            titleLine1="99"
                            titleLine2="Names"
                            icon={IconNinetyNine}
                            onClick={() => navigate('/praise')}
                            theme={theme}
                        />
                    </div>
                </div>
            </section>

            {/* ── 5. Illuminated Verse of the Day (Bespoke Sacred Leaf) ── */}
            <section className="animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div
                    className="rounded-[2rem] border overflow-hidden relative transition-all duration-300"
                    style={{
                        background: t(theme, 'surface-1'),
                        borderColor: isDark ? 'rgba(201, 168, 76, 0.22)' : t(theme, 'border'),
                        boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.03)',
                    }}
                >
                    {/* Atmospheric gold radial highlight */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-80"
                        style={{
                            background: isDark
                                ? 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201, 168, 76, 0.08), transparent 70%)'
                                : 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201, 168, 76, 0.04), transparent 70%)',
                        }}
                    />

                    <div className="relative p-6 sm:p-8 md:p-10 flex flex-col gap-5 sm:gap-6">
                        {/* 1. Header Bar: Masthead Badge & Interactive Actions */}
                        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: t(theme, 'border') }}>
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        color: t(theme, 'accent'),
                                        border: `1px solid ${t(theme, 'border')}`,
                                    }}
                                >
                                    <IconQuran size={15} />
                                </div>
                                <div className="flex flex-col">
                                    <span
                                        className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] leading-tight"
                                        style={{
                                            color: t(theme, 'accent'),
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Verse of the Day
                                    </span>
                                    <span
                                        className="text-[11px] font-normal leading-tight mt-0.5"
                                        style={{
                                            color: t(theme, 'text-secondary'),
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Daily contemplation
                                    </span>
                                </div>
                            </div>

                            {/* Utility actions: Copy & Bookmark */}
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={handleCopyVerse}
                                    className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all active:scale-95 hover:border-amber-500/50"
                                    style={{
                                        background: t(theme, 'surface-2'),
                                        borderColor: t(theme, 'border'),
                                        color: copiedVerse ? '#22c55e' : t(theme, 'text-secondary'),
                                    }}
                                    title="Copy verse"
                                    aria-label="Copy verse"
                                >
                                    {copiedVerse ? (
                                        <>
                                            <IconCheck size={14} className="text-emerald-500" />
                                            <span className="text-[11px] font-bold text-emerald-500">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconCopy size={14} />
                                            <span className="text-[11px] hidden sm:inline opacity-75">Copy</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleBookmarkVerse}
                                    className="p-1.5 rounded-xl border transition-all active:scale-95 hover:border-amber-500/50"
                                    style={{
                                        background: isVerseBookmarked ? t(theme, 'accent-soft') : t(theme, 'surface-2'),
                                        borderColor: isVerseBookmarked ? t(theme, 'accent') : t(theme, 'border'),
                                        color: isVerseBookmarked ? t(theme, 'accent') : t(theme, 'text-secondary'),
                                    }}
                                    title={isVerseBookmarked ? "Remove bookmark" : "Bookmark verse"}
                                    aria-label="Bookmark verse"
                                >
                                    {isVerseBookmarked ? (
                                        <IconBookmarkFill size={14} style={{ color: t(theme, 'accent') }} />
                                    ) : (
                                        <IconBookmark size={14} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 2. Sacred Arabic Text (Illuminated Center Stage) */}
                        <div className="py-2 sm:py-3 flex flex-col items-center text-center">
                            <p
                                className="leading-[2.1] sm:leading-[2.3] font-arabic select-text text-center tracking-normal"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--script-font)',
                                    fontSize: 'calc(var(--arabic-size) * 1.15)',
                                    direction: 'rtl',
                                    textRendering: 'optimizeLegibility',
                                    fontWeight: 500,
                                }}
                            >
                                {verseOfTheDay.arabic}
                            </p>
                        </div>

                        {/* 3. Manuscript Ornament Jewel Divider */}
                        <div className="flex items-center justify-center gap-3 my-0.5 select-none opacity-60">
                            <span
                                className="h-px w-10 sm:w-16"
                                style={{
                                    background: `linear-gradient(to right, transparent, ${t(theme, 'accent')})`,
                                    opacity: 0.5
                                }}
                            />
                            <span
                                className="text-xs"
                                style={{ color: t(theme, 'accent'), opacity: 0.8 }}
                            >
                                ۞
                            </span>
                            <span
                                className="h-px w-10 sm:w-16"
                                style={{
                                    background: `linear-gradient(to left, transparent, ${t(theme, 'accent')})`,
                                    opacity: 0.5
                                }}
                            />
                        </div>

                        {/* 4. Transliteration & Translation Flow */}
                        <div className="flex flex-col items-center text-center gap-2.5 max-w-2xl mx-auto px-2">
                            {verseOfTheDay.transliteration && (
                                <p
                                    className="text-xs sm:text-sm font-serif italic leading-relaxed select-text tracking-wide"
                                    style={{
                                        color: t(theme, 'accent'),
                                        fontFamily: 'var(--font-serif-body)',
                                    }}
                                >
                                    {verseOfTheDay.transliteration}
                                </p>
                            )}

                            <p
                                className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90 select-text font-normal"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-serif-body)',
                                }}
                            >
                                {verseOfTheDay.translation}
                            </p>
                        </div>

                        {/* 5. Refined Footer: Reference & Navigation */}
                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t" style={{ borderColor: t(theme, 'border') }}>
                            <span
                                className="px-3 py-1.5 rounded-xl text-xs font-normal tracking-tight border shadow-xs"
                                style={{
                                    background: t(theme, 'surface-2'),
                                    borderColor: t(theme, 'border'),
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'var(--font-serif-body)',
                                }}
                            >
                                {verseOfTheDay.reference}
                            </span>

                            {verseOfTheDay.surahNumber && (
                                <button
                                    onClick={() => navigate(`/quran/${verseOfTheDay.surahNumber}`)}
                                    className="group flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 hover:border-amber-500/60 shadow-xs"
                                    style={{
                                        background: t(theme, 'accent-soft'),
                                        borderColor: t(theme, 'border'),
                                        color: t(theme, 'accent'),
                                    }}
                                >
                                    <span>Read in Surah</span>
                                    <IconChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

/**
 * Minimalist Quick Access Icon Item
 */
function QuickAccessItem({ titleLine1, titleLine2, icon: IconComp, onClick, theme }) {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center text-center cursor-pointer select-none transition-transform active:scale-95 w-full"
        >
            <div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-[1.2rem] sm:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm"
                style={{
                    background: t(theme, 'surface-2'),
                    color: t(theme, 'text-primary'),
                }}
            >
                <IconComp size={22} className="sm:w-6 sm:h-6" />
            </div>

            <div className="flex flex-col items-center mt-2 sm:mt-2.5 leading-tight">
                <span
                    className="text-[11px] sm:text-xs md:text-[13px] font-medium transition-colors group-hover:text-amber-500"
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--font-serif-body)',
                    }}
                >
                    {titleLine1}
                </span>
                <span
                    className="text-[11px] sm:text-xs md:text-[13px] font-medium transition-colors group-hover:text-amber-500"
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--font-serif-body)',
                    }}
                >
                    {titleLine2}
                </span>
            </div>
        </button>
    )
}
