import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHijriDate } from '../utils/hijri.js'
import { useSettings } from '../context/SettingsContext'
import { t } from '../utils/theme'
import { IconHands, IconBook, IconGrid, IconChevronRight, IconTasbih, IconCalendar, IconStar } from '../components/Icons'
import DailyPage from './DailyPage'
import LibraryPage from './LibraryPage'
import PageHeader from '../components/PageHeader'

const VERSES = [
    {
        arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
        transliteration: 'Fadhkuruunee adhkurkum',
        translation: '"So remember Me; I will remember you."',
        reference: 'Surah Al-Baqarah 2:152'
    },
    {
        arabic: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
        transliteration: 'Laa taqnatuu mir rahmatil laah',
        translation: '"Do not despair of the mercy of Allah."',
        reference: 'Surah Az-Zumar 39:53'
    },
    {
        arabic: 'إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ',
        transliteration: 'Innal laaha yuhibbul mutawakkileen',
        translation: '"Indeed, Allah loves those who rely [upon Him]."',
        reference: 'Surah Al-Imran 3:159'
    },
    {
        arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
        transliteration: "Wahuwa ma'akum ayna maa kuntum",
        translation: '"And He is with you wherever you are."',
        reference: 'Surah Al-Hadid 57:4'
    },
    {
        arabic: 'إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ',
        transliteration: "Innal laaha ma'alladheenat taqaw walladheena hum muhsinuun",
        translation: '"Indeed, Allah is with those who fear Him and those who are doers of good."',
        reference: 'Surah An-Nahl 16:128'
    },
    {
        arabic: 'وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ',
        transliteration: "Wamaa kaanal laahu mu'adh-dhibahum wahum yastaghfiruun",
        translation: '"And Allah would not punish them while they seek forgiveness."',
        reference: 'Surah Al-Anfal 8:33'
    },
    {
        arabic: 'وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا',
        transliteration: "Wal-dhaakireenal laaha katheeraw wal-dhaakiraati a'addal laahu lahum maghfirataw wa-ajran 'azeemaa",
        translation: '"...and the men who remember Allah often and the women who do so - for them Allah has prepared forgiveness and a great reward."',
        reference: 'Surah Al-Ahzab 33:35'
    },
    {
        arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
        transliteration: 'La-in shakartum la-azeedannakum',
        translation: '"If you are grateful, I will surely increase you [in favor]."',
        reference: 'Surah Ibrahim 14:7'
    },
    {
        arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
        transliteration: 'Walladheena jaahaduu feenaa lanahdiyannahum subulanaa',
        translation: '"And those who strive for Us - We will surely guide them to Our ways."',
        reference: 'Surah Al-Ankabut 29:69'
    },
    {
        arabic: 'وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ',
        transliteration: 'Waman yaghfirudh dhunuuba illal laah',
        translation: '"And who can forgive sins except Allah?"',
        reference: 'Surah Al-Imran 3:135'
    },
    {
        arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
        transliteration: "Alaa bidhikril laahi tatma'innul quluub",
        translation: '"Unquestionably, by the remembrance of Allah hearts are assured."',
        reference: "Surah Ar-Ra'd 13:28"
    },
    {
        arabic: 'وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا',
        transliteration: 'Waman yattaqil laaha yaj\'al lahu makhrajaa',
        translation: '"And whoever fears Allah - He will make for him a way out."',
        reference: 'Surah At-Talaq 65:2'
    },
    {
        arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
        transliteration: "Inna ma'al 'usri yusraa",
        translation: '"Indeed, with hardship [will be] ease."',
        reference: 'Surah Ash-Sharh 94:6'
    },
    {
        arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
        transliteration: "Waqul rabbi zidnee 'ilmaa",
        translation: '"And say, \"My Lord, increase me in knowledge.\""',
        reference: 'Surah Ta-Ha 20:114'
    },
    {
        arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ',
        transliteration: "Rabbanaa taqabbal minnaa innaka antas samee'ul 'aleem",
        translation: '"Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing."',
        reference: 'Surah Al-Baqarah 2:127'
    },
    {
        arabic: 'وَقُلِ الْحَمْدُ لِلَّهِ الَّذِي لَمْ يَتَّخِذْ وَلَدًا',
        transliteration: 'Waqulil hamdu lillaahil ladhee lam yattakhidh waladaa',
        translation: '"And say, \"Praise to Allah, who has not taken a son...\""',
        reference: 'Surah Al-Isra 17:111'
    },
    {
        arabic: 'وَاللَّهُ يَعْلَمُ مَا فِي قُلُوبِكُمْ',
        transliteration: 'Wallahu ya\'lamu maa fee quluubikum',
        translation: '"And Allah knows what is in your hearts."',
        reference: 'Surah Al-Ahzab 33:51'
    },
    {
        arabic: 'فَاصْبِرْ إِنَّ وَعْدَ اللَّهِ حَقٌّ',
        transliteration: 'Fasbir inna wa\'dal laahi haqqun',
        translation: '"So be patient. Indeed, the promise of Allah is truth."',
        reference: 'Surah Ar-Rum 30:60'
    },
    {
        arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
        transliteration: 'Wa-idhaa sa-alaka \'ibaadee \'annee fa-innee qareeb',
        translation: '"And when My servants ask you concerning Me - indeed I am near."',
        reference: 'Surah Al-Baqarah 2:186'
    },
    {
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
        transliteration: 'Rabbanaa aatinaa fid dunyaa hasanatan wa-fil aakhirati hasanah',
        translation: '"Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good."',
        reference: 'Surah Al-Baqarah 2:201'
    },
    {
        arabic: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ',
        transliteration: 'Watawakkal \'alal hayyil ladhee laa yamuut',
        translation: '"And rely upon the Ever-Living who does not die."',
        reference: 'Surah Al-Furqan 25:58'
    },
    {
        arabic: 'فَإِنَّ حَسْبَكَ اللَّهُ',
        transliteration: 'Fa-inna hasbakal laah',
        translation: '"Then indeed, Allah is sufficient for you."',
        reference: 'Surah Al-Anfal 8:62'
    },
    {
        arabic: 'وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ',
        transliteration: 'Wa\'bud rabbaka hattaa ya-tiyakal yaqeen',
        translation: '"And worship your Lord until there comes to you the certainty."',
        reference: 'Surah Al-Hijr 15:99'
    },
    {
        arabic: 'وَلَا تَجْهَرْ بِصَلَاتِكَ وَلَا تُخَافِتْ بِهَا وَابْتَغِ بَيْنَ ذَٰلِكَ سَبِيلًا',
        transliteration: 'Walaa tajhar bisalaatika walaa tukhaafit bihaa wabtaghi bayna dhaalika sabeelaa',
        translation: '"And speak your prayer neither [too] loudly nor [too] quietly but seek between that an [intermediate] way."',
        reference: 'Surah Al-Isra 17:110'
    },
    {
        arabic: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
        transliteration: 'Waqaala rabbukum ud\'uunee astajib lakum',
        translation: '"And your Lord says, \"Call upon Me; I will respond to you.\""',
        reference: 'Surah Ghafir 40:60'
    },
    {
        arabic: 'إِنَّ الَّذِينَ اتَّقَوْا إِذَا مَسَّهُمْ طَائِفٌ مِّنَ الشَّيْطَانِ تَذَكَّرُوا فَإِذَا هُم مُّبْصِرُونَ',
        transliteration: 'Innalladheenat taqaw idhaa massahum taa-ifum minash shaytaani tadhakkaruu fa-idhaa hum mub\'siruun',
        translation: '"Indeed, those who fear Allah - when an impulse from Satan touches them, they remember [Him] and at once they have insight."',
        reference: "Surah Al-A'raf 7:201"
    },
    {
        arabic: 'وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ وَيَعْفُو عَنِ السَّيِّئَاتِ',
        transliteration: 'Wahuwal ladhee yaqbalut tawbata \'an \'ibaadihi wa-ya\'fuu \'anis sayyi-aat',
        translation: '"And it is He who accepts repentance from his servants and pardons misdeeds."',
        reference: 'Surah Ash-Shura 42:25'
    },
    {
        arabic: 'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ',
        transliteration: 'Wabashshiril ladheena aamanuu wa-\'amilus saalihaat',
        translation: '"And give good tidings to those who believe and do righteous deeds."',
        reference: 'Surah Al-Baqarah 2:25'
    },
    {
        arabic: 'هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ',
        transliteration: 'Huwal awwalu wal-aakhiru wadh-dhaahiru wal-baatin',
        translation: '"He is the First and the Last, the Ascendant and the Intimate."',
        reference: 'Surah Al-Hadid 57:3'
    },
    {
        arabic: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ',
        transliteration: 'Yaaa ayyatuhan nafsul mutma-innah',
        translation: '"[To the righteous it will be said], \"O reassured soul...\""',
        reference: 'Surah Al-Fajr 89:27'
    },
    {
        arabic: 'هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ',
        transliteration: 'Huwal ladhee anzalas sakeenata fee quluubil mu\'mineen',
        translation: '"It is He who sent down tranquility into the hearts of the believers."',
        reference: 'Surah Al-Fath 48:4'
    },
    {
        arabic: 'وَابْتَغِ فِيمَا آتَاكَ اللَّهُ الدَّارَ الْآخِرَةَ وَلَا تَنسَ نَصِيبَكَ مِنَ الدُّنْيَا',
        transliteration: 'Wabtaghi feemaa aataakal laahud daaral aakhirata walaa tansa naseebaka minad dunyaa',
        translation: '"But seek, through that which Allah has given you, the home of the Hereafter; and [yet], do not forget your share of the world."',
        reference: 'Surah Al-Qasas 28:77'
    },
]

export default function HomePage({ duas = [], asma = [] }) {
    const navigate = useNavigate()
    const { theme } = useSettings()

    // Dynamic greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 18) return 'Good Afternoon'
        return 'Good Evening'
    }, [])

    // Gregorian date
    const gregorianDate = useMemo(() => {
        const now = new Date()
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
        return now.toLocaleDateString('en-US', options)
    }, [])

    // Hijri date
    const hijri = useMemo(() => getHijriDate(), [])

    const dateParts = useMemo(() => {
        const now = new Date()
        return {
            dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
            monthDay: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
            year: now.getFullYear()
        }
    }, [])

    const verseOfTheDay = useMemo(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
        return VERSES[dayOfYear % VERSES.length]
    }, [])



    /* ────────────── Home View ────────────── */
    return (
        <div className="pb-32 pt-16 px-6 flex flex-col gap-10 max-w-xl md:max-w-6xl mx-auto">

            {/* ── Greeting ── */}
            <header className="animate-fade-in flex flex-col gap-2 px-1 mb-6">
                <h1
                    style={{
                        color: t(theme, 'text-primary'),
                        fontFamily: 'var(--font-serif-body)',
                        fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
                        fontWeight: 300,
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                    }}
                >
                    Assalamu Alaikum
                </h1>
                <p
                    className="text-[16px] opacity-60 mt-3 tracking-tight leading-relaxed"
                    style={{ color: t(theme, 'text-muted') }}
                >
                    {greeting}, welcome back to your space.
                </p>
            </header>

            {/* ── Islamic Calendar Card ── */}
            <section className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                <div
                    className="rounded-[2.5rem] p-6 sm:p-8 md:p-10 relative overflow-hidden"
                    style={{
                        background: t(theme, 'surface-1'),
                        boxShadow: `0 10px 40px rgba(0,0,0,${theme === 'dark' ? '0.2' : '0.03'})`,
                        border: `1px solid ${t(theme, 'border')}`,
                    }}
                >
                    {/* Category label removed as requested */}

                    <div className="flex items-center gap-2 mb-6 opacity-30">
                        <IconCalendar size={14} style={{ color: t(theme, 'text-primary') }} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: t(theme, 'text-primary') }}>
                            Islamic Calendar
                        </span>
                    </div>

                    <h2
                        className="leading-tight text-left mb-2 whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                            color: t(theme, 'text-primary'),
                            fontFamily: 'var(--font-serif-body)',
                            fontSize: 'clamp(1.5rem, 5.5vw, 2.75rem)',
                            fontWeight: 300,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {hijri.monthName} {hijri.day}, {hijri.year} <span className="text-lg md:text-2xl ml-1">{hijri.yearSuffix}</span>
                    </h2>

                    <p className="text-[15px] font-medium text-left opacity-60" style={{ color: t(theme, 'text-secondary') }}>
                        {dateParts.dayName}, {dateParts.monthDay} {dateParts.year}
                    </p>
                </div>
            </section>

            {/* ── Quick Hub ── */}
            <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] block mb-4 px-1 opacity-40" style={{ color: t(theme, 'text-muted') }}>
                    Quick Hub
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    <QuickCard
                        title="Dua Library"
                        subtitle="Dua Collections "
                        icon={IconHands}
                        onClick={() => navigate('/library')}
                        theme={theme}
                    />
                    <QuickCard
                        title="Daily Adhkar"
                        subtitle="Morning & Evening"
                        icon={IconBook}
                        onClick={() => navigate('/daily')}
                        theme={theme}
                    />
                    <QuickCard
                        title="99 Names of Allah"
                        subtitle="Asmaul Husna"
                        icon={IconStar}
                        onClick={() => navigate('/praise')}
                        theme={theme}
                    />
                    <QuickCard
                        title="Tasbih"
                        subtitle="Daily Dhikr"
                        icon={IconTasbih}
                        onClick={() => navigate('/tasbih')}
                        theme={theme}
                    />
                </div>
            </section>

            {/* ── Verse of the Day ── */}
            <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div
                    className="rounded-3xl overflow-hidden relative"
                    style={{
                        background: t(theme, 'surface-1'),
                        boxShadow: `0 4px 24px rgba(0,0,0,${theme === 'dark' ? '0.18' : '0.04'})`,
                    }}
                >
                    <div className="p-8 pb-10">
                        <header className="mb-8">
                            <h3 className="text-[13px] font-bold" style={{ color: t(theme, 'text-primary') }}>Verse of the Day</h3>
                        </header>

                        <div className="flex flex-col gap-8">
                            <p
                                className="text-4xl md:text-5xl leading-relaxed text-right"
                                style={{
                                    color: t(theme, 'text-primary'),
                                    fontFamily: 'Noorehuda, Arial, sans-serif',
                                    direction: 'rtl'
                                }}
                            >
                                {verseOfTheDay.arabic}
                            </p>

                            <div className="flex flex-col gap-4">
                                <p
                                    className="text-[17px] font-medium leading-relaxed"
                                    style={{
                                        color: t(theme, 'text-primary'),
                                        fontFamily: 'var(--font-serif-body)'
                                    }}
                                >
                                    {verseOfTheDay.transliteration}
                                </p>
                                <p
                                    className="text-[18px] md:text-[20px] font-medium leading-[1.6]"
                                    style={{ color: t(theme, 'text-secondary'), fontFamily: 'var(--font-serif-body)' }}
                                >
                                    {verseOfTheDay.translation}
                                </p>
                                <p className="text-[14px] font-bold tracking-tight opacity-100" style={{ color: t(theme, 'accent') }}>
                                    {verseOfTheDay.reference}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

/* ── Shared Component for the Hub ── */
function QuickCard({ title, subtitle, icon: Icon, onClick, theme }) {
    const isDark = theme === 'dark'
    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col items-start p-6 rounded-[2rem] overflow-hidden transition-all duration-300 text-left"
            style={{
                background: t(theme, 'surface-1'),
                boxShadow: `0 4px 20px rgba(0,0,0,${isDark ? '0.2' : '0.03'})`,
                border: `1px solid ${t(theme, 'border')}`,
                minHeight: '10.5rem'
            }}
        >
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[2rem]"
                style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                }}
            />

            <div
                className="relative w-14 h-14 flex items-center justify-center rounded-full mb-5"
                style={{
                    background: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                    boxShadow: isDark ? 'none' : '0 4px 15px rgba(0,0,0,0.06)',
                    color: t(theme, 'text-primary'),
                }}
            >
                <Icon size={22} />
            </div>

            <h3 className="relative text-[15px] font-bold tracking-tight mb-0.5" style={{ color: t(theme, 'text-primary') }}>{title}</h3>
            <p className="relative text-[12px] font-medium tracking-tight opacity-70" style={{ color: t(theme, 'text-muted') }}>{subtitle}</p>
        </button>
    )
}
