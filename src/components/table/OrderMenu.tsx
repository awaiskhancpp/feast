'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Bell,
  ChefHat,
  Coffee,
  CupSoda,
  Edit3,
  Grid2X2,
  IceCreamBowl,
  Salad,
  Search,
  Soup,
  Utensils,
  Waves,
  X,
} from 'lucide-react'
import { MENU_CATEGORIES, MENU_ITEMS } from './tableData'
import type { CartLine, MenuCategory, MenuItem, TableOrder } from './types'
import { cn } from './utils'

type OrderMenuProps = {
  order: TableOrder
  onBack: () => void
}

export default function OrderMenu({ order, onBack }: OrderMenuProps) {
  const [activeCategory, setActiveCategory] = useState('appetizers')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<Record<number, CartLine>>({})
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

  const cartLines = useMemo(() => {
    return Object.values(selectedItems)
      .map((line) => {
        const item = MENU_ITEMS.find((entry) => entry.id === line.itemId)
        return item ? { ...line, item } : null
      })
      .filter(Boolean) as Array<CartLine & { item: MenuItem }>
  }, [selectedItems])

  const summary = useMemo(() => {
    const subtotal = cartLines.reduce((total, line) => {
      const numericPrice = Number(line.item.price.replace('$', '').replace(',', '.'))
      return total + numericPrice * line.quantity
    }, 0)
    const tax = subtotal * 0.1
    const discount = subtotal * 0.5
    const total = subtotal + tax - discount
    return { subtotal, tax, discount, total }
  }, [cartLines])
  const hasCartItems = cartLines.length > 0

  const addMenuItem = (
    item: MenuItem,
    opts?: { spicyLevel?: number; note?: string; quantity?: number },
  ) => {
    setSelectedItems((current) => {
      const existing = current[item.id]
      const quantity = opts?.quantity ?? 1

      return {
        ...current,
        [item.id]: {
          itemId: item.id,
          quantity: (existing?.quantity ?? 0) + quantity,
          note:
            opts?.note ??
            existing?.note ??
            `Note : ${spicyLabel(opts?.spicyLevel ?? existing?.spicyLevel ?? 2)}`,
          spicyLevel: opts?.spicyLevel ?? existing?.spicyLevel ?? 2,
        },
      }
    })
    setDrawerOpen(false)
    setDetailItem(null)
  }

  const updateCartQuantity = (itemId: number, delta: number) => {
    setSelectedItems((current) => {
      const existing = current[itemId]
      if (!existing) return current

      const nextQuantity = existing.quantity + delta
      if (nextQuantity <= 0) {
        const next = { ...current }
        delete next[itemId]
        return next
      }

      return {
        ...current,
        [itemId]: {
          ...existing,
          quantity: nextQuantity,
        },
      }
    })
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
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d70ff]" />
            <input
              className="h-10 w-56 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#6066ed] focus:ring-1 focus:ring-[#6066ed] xl:w-64"
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

      <div
        className={cn(
          'grid min-h-0 flex-1 gap-4 p-4 md:p-5 xl:p-6 max-lg:grid-cols-1 max-lg:overflow-y-auto',
          hasCartItems
            ? 'grid-cols-[170px_minmax(0,1fr)_280px] max-xl:grid-cols-[170px_minmax(0,1fr)]'
            : 'grid-cols-[170px_minmax(0,1fr)]',
        )}
      >
        <aside className="space-y-3 max-lg:flex max-lg:overflow-x-auto max-lg:space-x-3 max-lg:space-y-0">
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(165px,1fr))] md:gap-4">
            {filteredItems.map((item) => {
              const quantity = selectedItems[item.id]?.quantity ?? 0

              return (
                <button
                  className={cn(
                    'relative overflow-hidden rounded-xl bg-white p-2 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#6066ed]',
                    quantity > 0 && 'ring-2 ring-[#6066ed]',
                  )}
                  type="button"
                  key={item.id}
                  onClick={() => setDetailItem(item)}
                >
                  <img
                    className="h-28 w-full rounded-lg object-cover"
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

        {hasCartItems ? (
          <aside className="min-h-0 overflow-y-auto rounded-2xl bg-white p-4 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:rounded-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">Detail Items</h2>
                <p className="text-xs text-slate-400">{cartLines.length} items in cart</p>
              </div>
              <button
                className="rounded-md p-1 text-[#8d70ff] hover:bg-slate-50"
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open detail cart"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {cartLines.map((line) => (
                <div key={line.itemId} className="flex items-start gap-3 rounded-xl p-1">
                  <img
                    src={line.item.image}
                    alt={line.item.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="truncate text-sm font-bold">{line.item.name}</p>
                        <p className="text-xs text-slate-500">{line.note}</p>
                      </div>
                      <p className="text-sm font-bold">{line.item.price}</p>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-[#6066ed]">x{line.quantity}</span>
                      <div className="flex items-center gap-1">
                        <button
                          className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-600"
                          type="button"
                          onClick={() => updateCartQuantity(line.itemId, -1)}
                          aria-label={`Remove one ${line.item.name}`}
                        >
                          -
                        </button>
                        <button
                          className="text-[#8d70ff]"
                          type="button"
                          onClick={() => setDetailItem(line.item)}
                          aria-label={`Edit ${line.item.name}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-dashed border-slate-200 pt-4 text-sm">
              <SummaryRow label="Sub total" value={money(summary.subtotal)} />
              <SummaryRow label="Tax 10%" value={money(summary.tax)} />
              <SummaryRow label="Diskon 50%" value={`-${money(summary.discount)}`} />
              <div className="my-4 border-t border-dashed border-slate-200" />
              <SummaryRow label="Total Payment" value={money(summary.total)} strong />
              <div className="mt-4 flex gap-2">
                <input
                  className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none"
                  placeholder="Discount Code"
                />
                <button
                  className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold"
                  type="button"
                >
                  Apply
                </button>
              </div>
              <button
                className="mt-4 h-11 w-full rounded-lg bg-[#6066ed] text-sm font-semibold text-white"
                type="button"
              >
                Place an Order
              </button>
            </div>
          </aside>
        ) : (
          <div className="hidden xl:block" />
        )}
      </div>

      {detailItem ? (
        <ProductDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onAddToCart={(payload) => addMenuItem(detailItem, payload)}
        />
      ) : null}

      {drawerOpen ? (
        <CartDrawer
          cartLines={cartLines}
          onClose={() => setDrawerOpen(false)}
          onEditItem={(item) => setDetailItem(item)}
          onRemoveItem={(itemId) => updateCartQuantity(itemId, -1)}
          summary={summary}
        />
      ) : null}
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

function spicyLabel(level: number) {
  if (level <= 0) return 'Not Spicy'
  if (level === 1) return 'Level 1'
  if (level === 2) return 'Spicy Lv.5'
  if (level === 3) return 'Level 3'
  return `Level ${level}`
}

function money(value: number) {
  return `$${value.toFixed(2).replace('.', ',')}`
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center justify-between',
        strong && 'text-base font-bold text-slate-950',
      )}
    >
      <span className={cn('text-slate-400', strong && 'text-slate-500')}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function ProductDetailModal({
  item,
  onClose,
  onAddToCart,
}: {
  item: MenuItem
  onClose: () => void
  onAddToCart: (payload: { spicyLevel?: number; note?: string; quantity?: number }) => void
}) {
  const [spicyLevel, setSpicyLevel] = useState(2)
  const [note, setNote] = useState('')
  const [quantity, setQuantity] = useState(2)

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/30 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-[620px] overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(26,31,44,0.18)]">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-base font-bold">Detail Product</h3>
          <button
            className="grid h-8 w-8 place-items-center border border-[#8d70ff] text-[#8d70ff]"
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-5 px-5 pb-5 md:grid-cols-[minmax(0,1fr)_1.1fr]">
          <img
            src={item.image}
            alt={item.name}
            className="h-[340px] w-full rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xl font-bold">{item.name}</h4>
                <p className="text-sm text-slate-400">{item.category}</p>
              </div>
              <p className="text-xl font-bold text-[#6066ed]">{item.price}</p>
            </div>

            <div className="py-4">
              <p className="mb-2 text-sm font-semibold">Description</p>
              <p className="text-sm leading-6 text-slate-500">{item.description}</p>
            </div>

            <div className="space-y-2 border-t border-slate-100 py-4">
              <p className="text-sm font-semibold">Spicy Level</p>
              {[0, 1, 2, 3].map((level) => (
                <label
                  key={level}
                  className="flex items-center justify-between rounded-lg py-1 text-sm text-slate-500"
                >
                  <span>{spicyLabel(level)}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs">Free</span>
                    <input
                      type="radio"
                      checked={spicyLevel === level}
                      onChange={() => setSpicyLevel(level)}
                    />
                  </span>
                </label>
              ))}
            </div>

            <div className="border-t border-slate-100 py-4">
              <label className="block text-sm font-semibold">
                Notes
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none"
                  placeholder="Type notes here..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold">Order Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  className="grid h-7 w-7 place-items-center rounded-md bg-slate-100"
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                <button
                  className="grid h-7 w-7 place-items-center rounded-md bg-[#6066ed] text-white"
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="mt-4 h-11 w-full rounded-lg bg-[#6066ed] text-sm font-semibold text-white"
              type="button"
              onClick={() =>
                onAddToCart({
                  spicyLevel,
                  note: note || `Note : ${spicyLabel(spicyLevel)}`,
                  quantity,
                })
              }
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({
  cartLines,
  summary,
  onClose,
  onEditItem,
  onRemoveItem,
}: {
  cartLines: Array<CartLine & { item: MenuItem }>
  summary: { subtotal: number; tax: number; discount: number; total: number }
  onClose: () => void
  onEditItem: (item: MenuItem) => void
  onRemoveItem: (itemId: number) => void
}) {
  return (
    <div className="fixed inset-0 z-[75] bg-black/20 xl:hidden">
      <div className="ml-auto h-full w-full max-w-[380px] overflow-y-auto bg-white p-4 shadow-[0_18px_60px_rgba(26,31,44,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">Detail Items</h2>
          <button className="text-slate-500" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {cartLines.map((line) => (
            <div key={line.itemId} className="flex items-start gap-3 rounded-xl p-1">
              <img
                src={line.item.image}
                alt={line.item.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="truncate text-sm font-bold">{line.item.name}</p>
                    <p className="text-xs text-slate-500">{line.note}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-600"
                      type="button"
                      onClick={() => onRemoveItem(line.itemId)}
                      aria-label={`Remove one ${line.item.name}`}
                    >
                      -
                    </button>
                    <button
                      className="text-[#8d70ff]"
                      type="button"
                      onClick={() => onEditItem(line.item)}
                      aria-label={`Edit ${line.item.name}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-[#6066ed]">x{line.quantity}</span>
                  <p className="text-sm font-bold">{line.item.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-dashed border-slate-200 pt-4 text-sm">
          <SummaryRow label="Sub total" value={money(summary.subtotal)} />
          <SummaryRow label="Tax 10%" value={money(summary.tax)} />
          <SummaryRow label="Diskon 50%" value={`-${money(summary.discount)}`} />
          <div className="my-4 border-t border-dashed border-slate-200" />
          <SummaryRow label="Total Payment" value={money(summary.total)} strong />
          <div className="mt-4 flex gap-2">
            <input
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none"
              placeholder="Discount Code"
            />
            <button
              className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold"
              type="button"
            >
              Apply
            </button>
          </div>
          <button
            className="mt-4 h-11 w-full rounded-lg bg-[#6066ed] text-sm font-semibold text-white"
            type="button"
          >
            Place an Order
          </button>
        </div>
      </div>
    </div>
  )
}
