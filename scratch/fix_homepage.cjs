const fs = require('fs');
let c = fs.readFileSync('src/pages/HomePage.jsx', 'utf8');

c = c.replace(
    "import { IconHands, IconBook, IconCalendar, IconNinetyNine, IconCompass, IconChevronRight } from '../components/Icons'",
    "import { IconHands, IconBook, IconCalendar, IconNinetyNine, IconCompass, IconChevronRight, IconQuran } from '../components/Icons'"
);

// Update Quick Hub to include Quran as the first pillar
const oldQuickCards = `<div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    <QuickCard
                        title="Dua Library"
                        subtitle="Explore Collections"
                        icon={IconHands}
                        onClick={() => navigate('/library')}
                        theme={theme}
                    />
                    <QuickCard
                        title="Daily Guidance"
                        subtitle="Morning & Evening"
                        icon={IconBook}
                        onClick={() => {
                            const saved = localStorage.getItem('last-daily-category')
                            navigate(saved ? \`/daily/\${saved}\` : '/daily')
                        }}
                        theme={theme}
                    />
                    <QuickCard
                        title="40 Robbana"
                        subtitle="Quranic Prayers"
                        icon={IconCompass}
                        onClick={() => navigate('/library/robbana')}
                        theme={theme}
                    />
                    <QuickCard
                        title="99 Names"
                        subtitle="Asmaul Husna"
                        icon={IconNinetyNine}
                        onClick={() => navigate('/praise')}
                        theme={theme}
                    />
                </div>`;

const newQuickCards = `<div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    <QuickCard
                        title="The Holy Qur'an"
                        subtitle={lastRead ? \`Surah \${lastRead.surahEnglishName || lastRead.surahNumber}\` : "114 Surahs Offline"}
                        icon={IconQuran}
                        onClick={() => navigate(lastRead ? \`/quran/\${lastRead.surahNumber}\` : '/quran')}
                        theme={theme}
                    />
                    <QuickCard
                        title="Dua Library"
                        subtitle="Supplications"
                        icon={IconHands}
                        onClick={() => navigate('/library')}
                        theme={theme}
                    />
                    <QuickCard
                        title="Daily Guidance"
                        subtitle="Morning & Evening"
                        icon={IconBook}
                        onClick={() => {
                            const saved = localStorage.getItem('last-daily-category')
                            navigate(saved ? \`/daily/\${saved}\` : '/daily')
                        }}
                        theme={theme}
                    />
                    <QuickCard
                        title="99 Names"
                        subtitle="Asmaul Husna"
                        icon={IconNinetyNine}
                        onClick={() => navigate('/praise')}
                        theme={theme}
                    />
                </div>`;

c = c.replace(oldQuickCards, newQuickCards);

fs.writeFileSync('src/pages/HomePage.jsx', c);
console.log('Fixed HomePage with IconQuran');

