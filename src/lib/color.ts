import { CATEGORY_COLORS } from './icons'

/** Warna kategori yang valid di database: hex 6 digit `#rrggbb` (constraint `ck_tb_categories_color`). */
const HEX_RE = /^#[0-9a-f]{6}$/i

export function isHexColor(value: string): boolean {
  return HEX_RE.test(value)
}

/** Menerima `#abc`, `abc`, `#aabbcc`, atau `aabbcc`; hasil selalu `#aabbcc` huruf kecil, atau null jika tidak valid. */
export function normalizeHex(value: string): string | null {
  let v = value.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(v)) v = v.replace(/./g, (c) => c + c)
  return /^[0-9a-f]{6}$/.test(v) ? `#${v}` : null
}

export interface Hsl {
  /** 0–360 */
  h: number
  /** 0–100 */
  s: number
  /** 0–100 */
  l: number
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sat = s / 100
  const lig = l / 100
  const a = sat * Math.min(lig, 1 - lig)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    const v = lig - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(v * 255).toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

export function hexToHsl(hex: string): Hsl {
  const n = normalizeHex(hex) ?? '#000000'
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l: l * 100 }
  const s = d / (1 - Math.abs(2 * l - 1))
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  if (h < 0) h += 360
  return { h, s: s * 100, l: l * 100 }
}

function luminance(hex: string): number {
  const n = normalizeHex(hex) ?? '#000000'
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Warna ikon di atas latar kategori: putih, atau gelap bila latarnya terlalu terang (mis. kuning muda). */
export function iconColorOn(background: string): string {
  const bg = luminance(background)
  const contrastWhite = 1.05 / (bg + 0.05)
  const contrastDark = (bg + 0.05) / (luminance('#1c1917') + 0.05)
  return contrastWhite >= contrastDark ? '#ffffff' : '#1c1917'
}

/** Warna palet yang paling jarang dipakai kategori aktif sejenis; seri berurutan sesuai palet. */
export function suggestCategoryColor(used: string[]): string {
  const counts = CATEGORY_COLORS.map((c) => used.filter((u) => u.toLowerCase() === c).length)
  return CATEGORY_COLORS[counts.indexOf(Math.min(...counts))]
}

/** Baris abu-abu putih → hitam, seperti baris teratas palet grid. */
const GRAY_ROW = Array.from({ length: 15 }, (_, i) => hslToHex({ h: 0, s: 0, l: 100 - (i * 100) / 14 }))

/** 15 kolom hue (biru → ungu → merah → kuning → hijau, tiap 24°) × 9 tingkat terang, gelap di atas. */
const GRID_HUES = Array.from({ length: 15 }, (_, i) => (200 + i * 24) % 360)
const GRID_LIGHTNESS = [18, 26, 34, 43, 52, 61, 70, 80, 90]

/** Palet grid: baris pertama abu-abu, sisanya baris per tingkat terang. */
export const SWATCH_GRID: string[][] = [
  GRAY_ROW,
  ...GRID_LIGHTNESS.map((l) => GRID_HUES.map((h) => hslToHex({ h, s: l < 40 ? 70 : 82, l }))),
]

/** Posisi spektrum: x = terang (kiri putih → kanan hitam), y = hue (atas merah → bawah merah). Nilai 0–1. */
export function spectrumColor(x: number, y: number): string {
  return hslToHex({ h: y * 360, s: 100, l: (1 - x) * 100 })
}

export function spectrumPosition(hex: string): { x: number; y: number } {
  const { h, l } = hexToHsl(hex)
  return { x: 1 - l / 100, y: h / 360 }
}
