/* Official Hugeicons component integrations */
import { HugeiconsIcon } from '@hugeicons/react'
import HandPrayerIcon from '@hugeicons/core-free-icons/HandPrayerIcon'
import PrayerRug02Icon from '@hugeicons/core-free-icons/PrayerRug02Icon'
import Quran02Icon from '@hugeicons/core-free-icons/Quran02Icon'
import BookOpen01Icon from '@hugeicons/core-free-icons/BookOpen01Icon'
import SunriseIcon from '@hugeicons/core-free-icons/SunriseIcon'
import SunsetIcon from '@hugeicons/core-free-icons/SunsetIcon'
import Sun02Icon from '@hugeicons/core-free-icons/Sun02Icon'
import Moon02Icon from '@hugeicons/core-free-icons/Moon02Icon'
import StarIcon from '@hugeicons/core-free-icons/StarIcon'
import StarsIcon from '@hugeicons/core-free-icons/StarsIcon'
import FlowerIcon from '@hugeicons/core-free-icons/FlowerIcon'
import UserIcon from '@hugeicons/core-free-icons/UserIcon'
import Bookmark02Icon from '@hugeicons/core-free-icons/Bookmark02Icon'
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon'
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon'

/* Modern Hugeicons-powered SVG icons — pixel-aligned, 1.5px stroke */

export function IconSun({ size = 20, className = '', style, ...props }) {
    return <HugeiconsIcon icon={Sun02Icon} size={size} className={className} style={style} {...props} />
}

export function IconMoon({ size = 20, className = '', style, ...props }) {
    return <HugeiconsIcon icon={Moon02Icon} size={size} className={className} style={style} {...props} />
}

export function IconStar({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={StarIcon} size={size} className={className} style={style} {...props} />
}

export function IconBook({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={BookOpen01Icon} size={size} className={className} style={style} {...props} />
}

export function IconHeart({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
        </svg>
    )
}

export function IconHeartFill({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
        </svg>
    )
}


export function IconBookmark({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={Bookmark02Icon} size={size} className={className} style={style} {...props} />
}

export function IconBookmarkFill({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d="M17.5 21L12 16.8L6.5 21V6.2C6.5 4.43269 7.93269 3 9.7 3H14.3C16.0673 3 17.5 4.43269 17.5 6.2V21Z" />
        </svg>
    )
}

export function IconSettings({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

export function IconSearch({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

export function IconRefresh({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
        </svg>
    )
}

export function IconUpdate({ size = 18, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
        </svg>
    )
}

export function IconMinus({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
        </svg>
    )
}

export function IconPlus({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5v14" />
        </svg>
    )
}

export function IconChevronLeft({ size = 20, className = '', style, ...props }) {
    return <HugeiconsIcon icon={ArrowLeft01Icon} size={size} className={className} style={style} {...props} />
}

export function IconChevronRight({ size = 20, className = '', style, ...props }) {
    return <HugeiconsIcon icon={ArrowRight01Icon} size={size} className={className} style={style} {...props} />
}

export function IconGrid({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    )
}

export function IconVolume({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    )
}

export function IconDua({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21v-3" />
            <path d="M6.5 14c-.6-1.5-1.5-2.5-1.5-4a7 7 0 0 1 14 0c0 1.5-.9 2.5-1.5 4" />
            <path d="M12 14v4" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
        </svg>
    )
}

export function IconHands({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={HandPrayerIcon} size={size} className={className} style={style} {...props} />
}

export function IconMosque({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 22v-8a1 1 0 0 0-1-1h-1a2 2 0 0 1-2-2V9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2a2 2 0 0 1-2 2H5a1 1 0 0 0-1 1v8" />
            <path d="M12 7V3" />
            <path d="M11 3h2" />
            <path d="M12 11v11" />
            <path d="M4 22h16" />
        </svg>
    )
}

export function IconSalah({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" fill="currentColor" stroke="none" />
            <path d="M12 11c-2 0-3.5 1-4.5 3L4 18l1.5 1.5 3-3.5 3.5-1.5 3.5 1.5 3.5 3.5 1.5-1.5-3.5-4c-1-2-2.5-3-4.5-3z" />
            <path d="M22 22H2" />
            <path d="M12 11V7l-4-3" />
        </svg>
    )
}

export function IconTasbih({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            {/* Prayer Beads Loop (Tasbih / Masbaha) — Hugeicons style */}
            <circle cx="12" cy="9" r="6" />
            <circle cx="12" cy="3" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="16.2" cy="4.8" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="18" cy="9" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="16.2" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="7.8" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="6" cy="9" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="7.8" cy="4.8" r="1.1" fill="currentColor" stroke="none" />
            <path d="M12 15v3" />
            <path d="M9.5 21.5l2.5-3.5 2.5 3.5" />
            <path d="M12 18v3.5" />
        </svg>
    )
}

export function IconCrescent({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            {/* Ramadan Crescent & Radiant Celestial Star — Hugeicons style */}
            <path d="M19 12.8A7.8 7.8 0 1 1 11.2 5a6.2 6.2 0 0 0 7.8 7.8Z" />
            <path d="M17.5 3.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6Z" />
        </svg>
    )
}

export function IconCompass({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
        </svg>
    )
}

export function IconUser({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={UserIcon} size={size} className={className} style={style} {...props} />
}

export function IconCalendar({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}

export function IconInfo({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}

export function IconClock({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
export function IconSparkles({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={StarsIcon} size={size} className={className} style={style} {...props} />
}
export function IconPencil({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    )
}

export function IconRemembrance({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
            <path d="M12 7.5L12.4 9.4L14.3 9.8L12.4 10.2L12 12.1L11.6 10.2L9.7 9.8L11.6 9.4L12 7.5Z" fill="currentColor" stroke="none" />
            <circle cx="15.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
            <circle cx="8.5" cy="11.5" r="0.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="14" r="0.4" fill="currentColor" stroke="none" />
        </svg>
    )
}

export function IconTrash({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    )
}

export function IconNinetyNine({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            {/* Sacred 8-Pointed Rub-el-Hizb Rosette (Asma-ul-Husna Divine Seal) — Hugeicons style */}
            <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
            <rect x="4.5" y="4.5" width="15" height="15" rx="2" transform="rotate(45 12 12)" />
            <circle cx="12" cy="12" r="3.2" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
    )
}

export function IconFlower({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={FlowerIcon} size={size} className={className} style={style} {...props} />
}

/* ─── Premium Daily Guidance icons ─── */

export function IconPrayerMat({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={PrayerRug02Icon} size={size} className={className} style={style} {...props} />
}

export function IconSunrise({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={SunriseIcon} size={size} className={className} style={style} {...props} />
}

export function IconSunset({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={SunsetIcon} size={size} className={className} style={style} {...props} />
}

export function IconBeads({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            {/* Prayer Beads Loop (Tasbih / Masbaha) — Hugeicons style */}
            <circle cx="12" cy="9" r="6" />
            <circle cx="12" cy="3" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="16.2" cy="4.8" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="18" cy="9" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="16.2" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="7.8" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="6" cy="9" r="1.1" fill="currentColor" stroke="none" />
            <circle cx="7.8" cy="4.8" r="1.1" fill="currentColor" stroke="none" />
            <path d="M12 15v3" />
            <path d="M9.5 21.5l2.5-3.5 2.5 3.5" />
            <path d="M12 18v3.5" />
        </svg>
    )
}

export function IconHome({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

export function IconTag({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
            <path d="M7 7h.01" />
        </svg>
    )
}

export function IconMessage({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}

export function IconCopy({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    )
}

export function IconCheck({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

export function IconQuran({ size = 22, className = '', style, ...props }) {
    return <HugeiconsIcon icon={Quran02Icon} size={size} className={className} style={style} {...props} />
}

export function IconScroll({ size = 20, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d="M8 21h8a4 4 0 0 0 4-4V5a2 2 0 0 0-2-2H8a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4z" />
            <path d="M4 17a4 4 0 0 1 4-4h12" />
            <path d="M8 7h7M8 10h4" strokeWidth="1.2" opacity="0.65" />
        </svg>
    )
}

/* ───────────────────────────────────────────────────────────
   MODERN HUGEICONS-STYLE TAB ICONS (https://hugeicons.com/)
   Balanced 1.65px uniform stroke, rounded joints, native feel
   ─────────────────────────────────────────────────────────── */

export function IconHugeHome({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d="M2.5 10.2L10.75 3.6C11.48 3.02 12.52 3.02 13.25 3.6L21.5 10.2C21.82 10.46 22 10.85 22 11.27V19.5C22 20.6 21.1 21.5 20 21.5H15.5C14.67 21.5 14 20.83 14 20V16C14 14.9 13.1 14 12 14C10.9 14 10 14.9 10 16V20C10 20.83 9.33 21.5 8.5 21.5H4C2.9 21.5 2 20.6 2 19.5V11.27C2 10.85 2.18 10.46 2.5 10.2Z" />
        </svg>
    )
}

export function IconHugeDua({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            {/* Left cupped palm */}
            <path d="M12 20.5C9.5 20.5 5 18.2 4.2 13.5C3.8 11.2 4.4 9 5.8 7.4C6.8 6.3 8.3 5.8 9.7 6.2C10.9 6.5 11.7 7.5 12 8.5" />
            <path d="M8.5 7V13" />
            {/* Right cupped palm */}
            <path d="M12 20.5C14.5 20.5 19 18.2 19.8 13.5C20.2 11.2 19.6 9 18.2 7.4C17.2 6.3 15.7 5.8 14.3 6.2C13.1 6.5 12.3 7.5 12 8.5" />
            <path d="M15.5 7V13" />
            {/* Center division */}
            <line x1="12" y1="8.5" x2="12" y2="20.5" />
        </svg>
    )
}

export function IconHugeQuran({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d="M12 6.5C10 5 6.5 4.5 3.5 5.5C3.5 10.5 3.5 15.5 3.5 18.5C6.5 17.5 10 18 12 19.5M12 6.5C14 5 17.5 4.5 20.5 5.5C20.5 10.5 20.5 15.5 20.5 18.5C17.5 17.5 14 18 12 19.5M12 6.5V19.5" />
            <path d="M7 9H9M7 12H9M15 9H17M15 12H17" strokeWidth="1.3" opacity="0.6" />
        </svg>
    )
}

export function IconHugeTasbih({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <circle cx="12" cy="10" r="6.8" strokeDasharray="2 3.3" />
            <path d="M12 16.8V21M10 21H14" />
        </svg>
    )
}

export function IconHugeSettings({ size = 22, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    )
}

export function IconX({ size = 18, className = '', style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    )
}

export { RubElHizbBadge } from './RubElHizbBadge'
