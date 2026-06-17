'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Bell,
  ChefHat,
  Coffee,
  CupSoda,
  Grid2X2,
  IceCreamBowl,
  Salad,
  Search,
  Soup,
  Utensils,
  Waves,
} from 'lucide-react'
import { MENU_CATEGORIES, MENU_ITEMS } from './tableData'
import type { MenuCategory, TableOrder } from './types'
import { cn } from './utils'

type OrderMenuProps = {
  order: TableOrder
  onBack: () => void
}

export default function OrderMenu({ order, onBack }: OrderMenuProps) {
  const [activeCategory, setActiveCategory] = useState('appetizers')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({})

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()

    return MENU_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, search])

  const addMenuItem = (itemId: number) => {
    setSelectedItems((current) => ({ ...current, [itemId]: (current[itemId] ?? 0) + 1 }))
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#f7f8fb] text-slate-950">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold">
              Order {order.orderNumber} - Table T-{order.tableId}
            </h1>
            <p className="text-xs text-slate-500">
              {order.customerName} · {order.guests} guests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d70ff]" />
            <input
              className="h-10 w-64 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#6066ed] focus:ring-1 focus:ring-[#6066ed]"
              placeholder="Search here..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-[#8d70ff]"
            type="button"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full">
              <Image src="/person.jpg" alt="Cristina" fill className="object-cover" />
            </div>
            <div className="hidden text-sm leading-tight sm:block">
              <p className="font-bold">Cristina</p>
              <p className="text-xs text-slate-500">Cashier</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[180px_minmax(0,1fr)] gap-5 p-6 max-md:grid-cols-1 max-md:overflow-y-auto">
        <aside className="space-y-3 max-md:flex max-md:overflow-x-auto max-md:space-x-3 max-md:space-y-0">
          {MENU_CATEGORIES.map((category) => (
            <CategoryButton
              active={activeCategory === category.id}
              category={category}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </aside>

        <section className="min-h-0 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-5">
            {filteredItems.map((item) => {
              const quantity = selectedItems[item.id] ?? 0

              return (
                <button
                  className={cn(
                    'relative overflow-hidden rounded-xl bg-white p-2 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#6066ed]',
                    quantity > 0 && 'ring-2 ring-[#6066ed]',
                  )}
                  type="button"
                  key={item.id}
                  onClick={() => addMenuItem(item.id)}
                >
                  <img
                    className="h-32 w-full rounded-lg object-cover"
                    src={item.image}
                    alt={item.name}
                  />
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-950">{item.name}</h2>
                    <span className="text-sm font-bold text-[#6066ed]">{item.price}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>

                  {quantity > 0 ? (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#6066ed] text-xs font-bold text-white">
                      {quantity}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function CategoryButton({
  active,
  category,
  onClick,
}: {
  active: boolean
  category: MenuCategory
  onClick: () => void
}) {
  const Icon = getCategoryIcon(category.icon)

  return (
    <button
      className={cn(
        'flex min-h-[58px] w-full min-w-[170px] items-center gap-3 rounded-xl bg-white px-4 text-left transition hover:bg-slate-50',
        active && 'bg-[#6066ed] text-white hover:bg-[#6066ed]',
      )}
      type="button"
      onClick={onClick}
    >
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500',
          active && 'bg-white/15 text-white',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{category.label}</span>
        <span className={cn('block text-xs text-slate-500', active && 'text-white/85')}>
          {category.count} Menu In Stock
        </span>
      </span>
    </button>
  )
}

function getCategoryIcon(icon: MenuCategory['icon']) {
  const icons = {
    all: Grid2X2,
    appetizers: ChefHat,
    drink: CupSoda,
    desserts: IceCreamBowl,
    coffee: Coffee,
    main: Utensils,
    salads: Salad,
    seafood: Waves,
    soup: Soup,
  }

  return icons[icon]
}
