/**
 * Bataa's own icons, from two art sheets in public/icons (80x80 units each):
 * - line.svg: interface line icons. Drawn as a mask over the current text color, so `text-*` classes color them.
 * - fill.svg: filled status icons in their own colors (orange, the red heart, the lilac moon).
 * The check and play marks are drawn inline from the same paths, because they sit inside circles the app draws.
 * Size each icon with Tailwind classes (h-5 w-5 and so on), as before. The tab bar has its own sheet (public/nav).
 */
type Props = { className?: string; strokeWidth?: number }
/** [center x, center y, square size] of each icon on its sheet. */
type Box = readonly [number, number, number]

function lineIcon(box: Box) {
  const [cx, cy, s] = box
  const x = cx - s / 2
  const y = cy - s / 2
  // A percentage mask-position p puts the image's point at p% on the box's p%; solving for an offset of
  // -x (in sheet units) gives p = x / (80 - s), which holds at any rendered size.
  const mask = {
    maskImage: 'url(/icons/line.svg)',
    WebkitMaskImage: 'url(/icons/line.svg)',
    maskSize: `${8000 / s}% ${8000 / s}%`,
    WebkitMaskSize: `${8000 / s}% ${8000 / s}%`,
    maskPosition: `${(x / (80 - s)) * 100}% ${(y / (80 - s)) * 100}%`,
    WebkitMaskPosition: `${(x / (80 - s)) * 100}% ${(y / (80 - s)) * 100}%`,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
  return function LineIcon({ className = '' }: Props) {
    return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={mask} />
  }
}

function fillIcon(box: Box) {
  const [cx, cy, s] = box
  return function FillIcon({ className = '' }: Props) {
    return (
      <svg aria-hidden viewBox={`${cx - s / 2} ${cy - s / 2} ${s} ${s}`} className={`shrink-0 ${className}`}>
        <image href="/icons/fill.svg" width="80" height="80" />
      </svg>
    )
  }
}

/** A filled icon as a one-color silhouette (mask), for states like "locked" that should look muted. */
function fillMask(box: Box) {
  const [cx, cy, s] = box
  const x = cx - s / 2
  const y = cy - s / 2
  const mask = {
    maskImage: 'url(/icons/fill.svg)',
    WebkitMaskImage: 'url(/icons/fill.svg)',
    maskSize: `${8000 / s}% ${8000 / s}%`,
    WebkitMaskSize: `${8000 / s}% ${8000 / s}%`,
    maskPosition: `${(x / (80 - s)) * 100}% ${(y / (80 - s)) * 100}%`,
    WebkitMaskPosition: `${(x / (80 - s)) * 100}% ${(y / (80 - s)) * 100}%`,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
  return function MaskIcon({ className = '' }: Props) {
    return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={mask} />
  }
}

// Interface line icons (line.svg).
export const ArrowLeft = lineIcon([9.7, 10.4, 13])
export const ChevronRight = lineIcon([29.5, 10.4, 13])
export const X = lineIcon([49.1, 10.4, 13])
export const Info = lineIcon([69.14, 10.5, 13])
export const Settings = lineIcon([9.7, 29.5, 13])
export const Pencil = lineIcon([28.9, 29.5, 13])
export const Camera = lineIcon([49.6, 29.6, 13])
export const ImageIcon = lineIcon([69.15, 29.6, 13])
export const Trash2 = lineIcon([9.6, 49.45, 13])
export const Store = lineIcon([29.4, 49.45, 13])
export const Shuffle = lineIcon([49.3, 49.6, 13])
export const Languages = lineIcon([69.55, 49.3, 14])
export const UserRound = lineIcon([9.7, 68.9, 13])

// Filled status icons (fill.svg).
export const Flame = fillIcon([10.7, 19, 15])
export const Zap = fillIcon([29.8, 18.9, 15])
export const Heart = fillIcon([49.9, 19.6, 15])
export const Moon = fillIcon([69.3, 19.2, 15])
export const CheckCircle = fillIcon([10.97, 39.01, 15])
export const Croissant = fillIcon([69.4, 39.7, 15])
export const Clock = fillIcon([11.13, 59.58, 15])
export const Target = fillIcon([30.25, 59.68, 15])
export const BookOpenCheck = fillIcon([50, 59.9, 16])
export const ListChecks = fillIcon([69.7, 59.8, 15])
export const Lock = fillMask([30, 38.8, 15])

/** The check mark from the sheet's check icon, in the current color (it goes inside circles the app draws). */
export function Check({ className = '' }: Props) {
  return (
    <svg aria-hidden viewBox="7.4 35.8 7.5 7.5" fill="none" className={`shrink-0 ${className}`}>
      <path d="m8.58 39.7 1.72 1.74 3.39-3.85" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** The play triangle from the sheet's play icon, in the current color. */
export function Play({ className = '' }: Props) {
  return (
    <svg aria-hidden viewBox="47 36.5 6.4 6.4" className={`shrink-0 ${className}`}>
      <path
        d="m47.89 37.62v3.53c0 0.76 0.64 1.08 1.24 0.76l3.06-1.82c0.7-0.42 0.64-1.19 0-1.52l-3.09-1.74c-0.63-0.3-1.21 0.04-1.21 0.79z"
        fill="currentColor"
      />
    </svg>
  )
}
