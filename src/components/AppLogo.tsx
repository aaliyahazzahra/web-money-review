// Logo Librasica: monogram L faceted di atas kotak burgundy, dengan timbangan kecil.
// Warnanya tetap (tidak mengikuti tema) karena ini identitas aplikasi; sama dengan public/favicon.svg.
const BURGUNDY = '#800020'
const CREAM = '#F3E6D5'
const CREAM_SHADE = '#E9D7C2'
const PINK = '#D45060'
const LIGHT_PINK = '#E8939C'

export function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" data-logo="librasica" className="shrink-0">
      <rect width="100" height="100" rx="22" fill={BURGUNDY} />
      <polygon points="28,18 56,18 52,24 46,24 46,72 70,72 76,62 78,82 24,82 30,76 30,24 26,22" fill={CREAM} />
      <polygon points="38,24 46,24 46,72 38,76" fill={CREAM_SHADE} />
      <polygon points="46,72 70,72 76,62 78,82 38,82 38,76" fill={CREAM_SHADE} />
      <polygon points="64,30 82,28 82,31 64,33" fill={PINK} />
      <line x1="66" y1="32" x2="62" y2="42" stroke={PINK} strokeWidth="1.6" />
      <line x1="66" y1="32" x2="70" y2="42" stroke={PINK} strokeWidth="1.6" />
      <polygon points="60,42 72,42 69,47 63,47" fill={LIGHT_PINK} />
    </svg>
  )
}
