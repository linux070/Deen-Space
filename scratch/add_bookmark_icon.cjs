const fs = require('fs');
let c = fs.readFileSync('src/components/Icons.jsx', 'utf8');
const bookmarkCode = `
export function IconBookmark({ size = 22, className = '', style }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
    )
}

export function IconBookmarkFill({ size = 22, className = '', style }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
    )
}
`;
if (!c.includes('IconBookmark')) {
    c = c.replace('export function IconSettings', bookmarkCode + '\nexport function IconSettings');
    fs.writeFileSync('src/components/Icons.jsx', c, 'utf8');
    console.log('Successfully added IconBookmark and IconBookmarkFill');
} else {
    console.log('IconBookmark already present');
}

