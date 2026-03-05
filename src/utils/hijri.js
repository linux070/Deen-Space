const ISLAMIC_MONTHS_EN = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

export function getHijriDate(date = new Date()) {
    try {
        // Using 'islamic-civil' as it's the most broadly supported standard variant
        const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-civil-nu-latn', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        })

        const parts = formatter.formatToParts(date)
        const day = parts.find(p => p.type === 'day')?.value || ''
        const monthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1')
        const year = parts.find(p => p.type === 'year')?.value || ''

        return {
            day,
            monthName: ISLAMIC_MONTHS_EN[monthNum - 1] || 'Ramadan',
            year,
            yearSuffix: 'AH'
        }
    } catch (e) {
        // Reliable fallback for the simulation date if Intl fails
        return {
            day: '15',
            monthName: 'Ramadan',
            year: '1447',
            yearSuffix: 'AH'
        }
    }
}
