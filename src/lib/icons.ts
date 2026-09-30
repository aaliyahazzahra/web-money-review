import {
  Baby, Book, Briefcase, Bus, Car, CircleEllipsis, Clapperboard, Coffee, Dog, Droplet, Dumbbell, Fuel,
  Gift, GraduationCap, HandCoins, HeartPulse, House, Landmark, type LucideIcon, PiggyBank, Pill, Plane,
  Receipt, Shirt, ShoppingBag, Smartphone, TrendingUp, Utensils, Wallet, Wifi, Zap,
} from 'lucide-react'

/** Ikon yang bisa dipilih untuk kategori; kunci = nama yang disimpan di database. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  coffee: Coffee,
  bus: Bus,
  car: Car,
  fuel: Fuel,
  plane: Plane,
  'shopping-bag': ShoppingBag,
  shirt: Shirt,
  receipt: Receipt,
  home: House,
  zap: Zap,
  droplet: Droplet,
  wifi: Wifi,
  smartphone: Smartphone,
  clapperboard: Clapperboard,
  'heart-pulse': HeartPulse,
  pill: Pill,
  dumbbell: Dumbbell,
  'graduation-cap': GraduationCap,
  book: Book,
  baby: Baby,
  dog: Dog,
  wallet: Wallet,
  briefcase: Briefcase,
  gift: Gift,
  'hand-coins': HandCoins,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  landmark: Landmark,
  'circle-ellipsis': CircleEllipsis,
}

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? CircleEllipsis
}

/**
 * Warna grafik kategori: 7 hue tervalidasi (CVD & normal-vision) untuk permukaan light/dark,
 * tanpa merah supaya tidak tertukar dengan expense. Database menyimpan nilai light.
 */
export const CATEGORY_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7']

const DARK_STEPS: Record<string, string> = {
  '#2a78d6': '#3987e5',
  '#eb6834': '#d95926',
  '#1baf7a': '#199e70',
  '#eda100': '#c98500',
  '#e87ba4': '#d55181',
  '#008300': '#008300',
  '#4a3aa7': '#9085e9',
}

/** Warna kategori sesuai tema; warna di luar palet dikembalikan apa adanya. */
export function categoryColorFor(color: string, theme: 'light' | 'dark'): string {
  if (theme === 'light') return color
  return DARK_STEPS[color.toLowerCase()] ?? color
}
