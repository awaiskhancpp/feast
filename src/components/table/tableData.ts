import type { TableStatus, TableStatusMeta } from './types'
import { DISH_CATEGORIES } from '@/lib/dishCategories'

export const STATUS_ORDER: TableStatus[] = ['available', 'billed', 'reserved', 'dine']

export const STATUS_META: Record<TableStatus, TableStatusMeta> = {
  available: {
    label: 'Available',
    color: '#5b5ff2',
    short: 'Avail',
    dotClass: 'bg-[#5b5ff2]',
    badgeClass: 'bg-[#5b5ff2] text-white',
  },
  billed: {
    label: 'Billed',
    color: '#07c85f',
    short: 'Bill',
    dotClass: 'bg-[#07c85f]',
    badgeClass: 'bg-[#07c85f] text-white',
  },
  reserved: {
    label: 'Reserved',
    color: '#f0b83f',
    short: 'Res',
    dotClass: 'bg-[#f0b83f]',
    badgeClass: 'bg-[#f0b83f] text-white',
  },
  dine: {
    label: 'Dine in',
    color: '#f4f5f9',
    short: 'Dine',
    dotClass: 'bg-[#f4f5f9] ring-1 ring-slate-200/70',
    badgeClass: 'bg-[#f4f5f9] text-[#858b96]',
  },
}

export type MenuCategoryIcon =
  | 'all'
  | 'appetizers'
  | 'drink'
  | 'desserts'
  | 'coffee'
  | 'main'
  | 'salads'
  | 'seafood'
  | 'soup'

// Static id/label/icon mapping only - "how many dishes are in this category"
// is no longer baked in here as a hardcoded number. It's real data now, so
// OrderMenu computes counts at render time from the actual dishes it was
// given, instead of trusting a number that could silently drift from reality.
export const MENU_CATEGORY_META: { id: MenuCategoryIcon; label: string }[] = [
  { id: 'all', label: 'All Menu' },
  ...DISH_CATEGORIES.map((c) => ({ id: c.value as MenuCategoryIcon, label: c.label })),
]
