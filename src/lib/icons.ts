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

/** Warna grafik kategori (tanpa merah supaya tidak tertukar dengan expense). */
export const CATEGORY_COLORS = [
  '#3F7D58', '#2F6B9A', '#C58B1A', '#6A4C93', '#1F8A8A',
  '#8A6A4F', '#5A7D2A', '#B5651D', '#4A5A8C', '#7A7A7A',
]
