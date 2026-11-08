const fs = require('fs');
const path = require('path');

async function main() {
    console.log('Fetching English transliteration from AlQuran Cloud...');
    const res = await fetch('https://api.alquran.cloud/v1/quran/en.transliteration');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const surahsData = data.data.surahs;

    console.log(`Fetched ${surahsData.length} surahs. Merging into public/data/quran/surahs/...`);

    const dir = path.join(__dirname, '..', 'public', 'data', 'quran', 'surahs');
    let totalAyahs = 0;

    for (const surahTranslit of surahsData) {
        const sNum = surahTranslit.number;
        const filePath = path.join(dir, `${sNum}.json`);
        if (!fs.existsSync(filePath)) {
            console.warn(`File ${filePath} not found, skipping.`);
            continue;
        }

        const localSurah = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Build a lookup by numberInSurah
        const translitMap = new Map();
        for (const a of surahTranslit.ayahs) {
            translitMap.set(a.numberInSurah, a.text);
        }

        // Merge transliteration
        for (const a of localSurah.ayahs) {
            a.transliteration = translitMap.get(a.numberInSurah) || '';
            totalAyahs++;
        }

        fs.writeFileSync(filePath, JSON.stringify(localSurah), 'utf8');
    }

    console.log(`Done! Successfully merged transliteration into all 114 surahs (${totalAyahs} ayahs).`);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

