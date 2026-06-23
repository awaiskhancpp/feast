'use client'
import PaymentModal from './PaymentModal'
import { useMemo, useState } from 'react'
import { ArrowLeft, Grid2X2, ShoppingCart, UtensilsCrossed, X } from 'lucide-react'
import Image from 'next/image'
import type { CartLine, MenuCategory, MenuItem, TableOrder } from './types'
import { cn } from './utils'

type CategoryMeta = {
  id: string
  label: string
  iconUrl?: string // default (inactive) icon
  iconHighlightedUrl?: string // highlighted (active/hover) icon
}

type OrderMenuProps = {
  dishes: MenuItem[]
  order: TableOrder
  onBack: () => void
  categories: CategoryMeta[]
}

export default function OrderMenu({ dishes, order, onBack, categories }: OrderMenuProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<Record<string, CartLine>>({})
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const orderableDishes = useMemo(() => dishes.filter((d) => d.inStock), [dishes])

  const categoryList = useMemo(() => {
    return [
      {
        id: 'all',
        label: 'All Menu',
        count: orderableDishes.length,
        iconUrl: undefined,
        iconHighlightedUrl: undefined,
      },
      ...categories.map((c) => ({
        id: String(c.id),
        label: c.label,
        count: orderableDishes.filter((d) => d.category === String(c.id)).length,
        iconUrl: c.iconUrl,
        iconHighlightedUrl: c.iconHighlightedUrl,
      })),
    ]
  }, [orderableDishes, categories])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orderableDishes.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, orderableDishes, search])

  const cartLines = useMemo(() => {
    return Object.values(selectedItems)
      .map((line) => {
        const item = dishes.find((entry) => entry.id === line.itemId)
        return item ? { ...line, item } : null
      })
      .filter(Boolean) as Array<CartLine & { item: MenuItem }>
  }, [dishes, selectedItems])

  const summary = useMemo(() => {
    const subtotal = cartLines.reduce((total, line) => total + line.item.price * line.quantity, 0)
    const tax = subtotal * 0.1
    const discount = order.isMember ? subtotal * 0.5 : 0
    const total = subtotal + tax - discount
    return { subtotal, tax, discount, total }
  }, [cartLines, order.isMember])

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

  const updateCartQuantity = (itemId: string, delta: number) => {
    setSelectedItems((current) => {
      const existing = current[itemId]
      if (!existing) return current
      const nextQuantity = existing.quantity + delta
      if (nextQuantity <= 0) {
        const next = { ...current }
        delete next[itemId]
        return next
      }
      return { ...current, [itemId]: { ...existing, quantity: nextQuantity } }
    })
  }

  return (
    // fixed below navbar (h-20 mobile / lg:h-24), covers sidebar laterally
    <div className="fixed inset-x-0 bottom-0 top-20 z-[200] flex flex-col overflow-hidden bg-[#f7f8fb] text-slate-950 lg:top-24 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold dark:text-slate-100">
              Order {order.orderNumber} · Table T-{order.tableId}
            </h1>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
              {order.customerName} · {order.guests} guest{order.guests !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Main 3-column grid */}
      <div
        className={cn(
          'grid min-h-0 flex-1 gap-5 p-5',
          // Mobile: single column, Desktop: categories | menu | cart
          'grid-cols-1',
          'lg:grid-cols-[220px_minmax(0,1fr)]',
          'xl:grid-cols-[220px_minmax(0,1fr)_360px]',
          'max-lg:overflow-y-auto max-lg:content-start',
        )}
      >
        {/* ── Category sidebar ── */}
        <aside className="space-y-2 max-lg:flex max-lg:overflow-x-auto max-lg:space-x-2 max-lg:space-y-0 max-lg:pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryList.map((category) => (
            <CategoryButton
              active={activeCategory === category.id}
              category={category}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </aside>

        {/* ── Dish cards grid ── */}
        <section className="min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredItems.length === 0 ? (
            <div className="grid min-h-[200px] place-items-center text-center">
              <p className="text-sm text-slate-400">
                {search ? `No dishes match "${search}".` : 'No dishes in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-1 py-2 sm:grid-cols-3 md:gap-4">
              {filteredItems.map((item) => {
                const quantity = selectedItems[item.id]?.quantity ?? 0
                return (
                  <button
                    key={item.id}
                    className={cn(
                      'relative overflow-hidden rounded-2xl bg-white p-0 text-left shadow-sm outline-none transition-all duration-200',
                      'hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#6066ed]',
                      quantity > 0 && 'ring-2 ring-[#6066ed]',
                    )}
                    type="button"
                    onClick={() => setDetailItem(item)}
                  >
                    <DishImage className="h-50 w-full" item={item} />

                    {/* Info */}
                    <div className="py-4 px-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h2 className="text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">
                          {item.name}
                        </h2>
                        <span className="flex-shrink-0 text-sm font-bold text-[#6066ed]">
                          {money(item.price)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    {/* Quantity badge */}
                    {quantity > 0 && (
                      <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-[#6066ed] text-xs font-bold text-white shadow-sm">
                        {quantity}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Desktop cart ── */}
        <aside className="hidden min-h-0 flex-col rounded-2xl bg-white shadow-sm xl:flex dark:bg-slate-900">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <h2 className="mb-4 text-base font-bold text-slate-950 dark:text-slate-100">
              Detail Items
            </h2>

            {hasCartItems ? (
              <div className="space-y-1">
                {cartLines.map((line) => (
                  <CartLineRow
                    key={line.itemId}
                    line={line}
                    onEdit={() => setDetailItem(line.item)}
                    onDecrement={() => updateCartQuantity(line.itemId, -1)}
                    onIncrement={() => updateCartQuantity(line.itemId, 1)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid flex-1 place-items-center">
                <p className="text-sm text-slate-400">Tap a dish to add it to this order.</p>
              </div>
            )}
          </div>

          {hasCartItems && (
            <CartSummary
              summary={summary}
              isMember={order.isMember}
              onPlaceOrder={() => setPaymentOpen(true)}
            />
          )}
        </aside>
      </div>

      {/* Floating cart button (below xl) */}
      {hasCartItems && !drawerOpen ? (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-[#6066ed] py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(96,102,237,0.4)] xl:hidden"
        >
          <ShoppingCart className="h-4 w-4" />
          {cartLines.length} item{cartLines.length === 1 ? '' : 's'}
          <span className="border-l border-white/30 pl-2">{money(summary.total)}</span>
        </button>
      ) : null}

      {detailItem && (
        <ProductDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onAddToCart={(payload) => addMenuItem(detailItem, payload)}
        />
      )}

      {drawerOpen && (
        <CartDrawer
          cartLines={cartLines}
          onClose={() => setDrawerOpen(false)}
          onEditItem={(item) => setDetailItem(item)}
          onRemoveItem={(itemId) => updateCartQuantity(itemId, -1)}
          onIncrementItem={(itemId) => updateCartQuantity(itemId, 1)}
          onPlaceOrder={() => setPaymentOpen(true)}
          summary={summary}
          isMember={order.isMember}
        />
      )}

      <PaymentModal
        open={paymentOpen}
        order={order}
        cartLines={cartLines}
        summary={summary}
        onClose={() => setPaymentOpen(false)}
        onSuccess={() => {
          setPaymentOpen(false)
          setDrawerOpen(false)
        }}
      />
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DishImage({ item, className }: { item: MenuItem; className?: string }) {
  if (!item.image) {
    return (
      <div
        className={cn(
          'grid place-items-center bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500',
          className,
        )}
      >
        <UtensilsCrossed className="h-8 w-8" />
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={cn('object-cover', className)} src={item.image} alt={item.name} />
}

function CartLineRow({
  line,
  onEdit,
  onDecrement,
  onIncrement,
}: {
  line: CartLine & { item: MenuItem }
  onEdit: () => void
  onDecrement: () => void
  onIncrement: () => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-1 py-2.5">
      <DishImage className="h-16 w-16 flex-shrink-0 rounded-xl" item={line.item} />

      <div className="min-w-0 flex-1">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">
            {line.item.name}
          </p>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {money(line.item.price * line.quantity)}
          </span>
        </div>

        {/* Note */}
        <p className="mt-0.5 truncate text-xs text-slate-400">{line.note}</p>

        {/* Qty + price */}
        <div className="mt-1.5 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecrement}
              className="grid h-5 w-5 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
              aria-label={`Remove one ${line.item.name}`}
            >
              −
            </button>
            <span className="text-xs font-semibold text-[#6066ed]">x{line.quantity}</span>
            <button
              type="button"
              onClick={onIncrement}
              className="grid h-5 w-5 place-items-center rounded-md bg-[#6066ed]/10 text-xs font-bold text-[#6066ed] transition hover:bg-[#6066ed]/20"
              aria-label={`Add one ${line.item.name}`}
            >
              +
            </button>
          </div>
          {/* <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {money(line.item.price * line.quantity)}
          </span> */}
        </div>
      </div>
    </div>
  )
}

function CartSummary({
  summary,
  isMember,
  onPlaceOrder,
}: {
  summary: { subtotal: number; tax: number; discount: number; total: number }
  isMember: boolean
  onPlaceOrder: () => void
}) {
  return (
    <div className="border-t border-dashed border-slate-200 px-5 pb-5 pt-4 text-sm dark:border-slate-700">
      <SummaryRow label="Sub total" value={money(summary.subtotal)} />
      <SummaryRow label="Tax" value={money(summary.tax)} />
      {isMember && summary.discount > 0 && (
        <SummaryRow label="Discount " value={`-${money(summary.discount)}`} negative />
      )}

      <div className="my-3 border-t border-dashed border-slate-200 dark:border-slate-700" />
      <SummaryRow label="Total Payment" value={money(summary.total)} strong />

      {/* Discount code */}
      <div className="mt-4 flex gap-2">
        <input
          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none placeholder:text-slate-400 focus:border-[#6066ed] focus:ring-1 focus:ring-[#6066ed]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Discount Code"
        />
        <button
          className="h-9 flex-shrink-0 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:border-[#6066ed] hover:text-[#6066ed] dark:border-slate-700 dark:text-slate-300"
          type="button"
        >
          Apply
        </button>
      </div>

      <button
        className="mt-3 h-11 w-full rounded-xl bg-[#6066ed] text-sm font-semibold text-white transition hover:bg-[#4e54d4] active:scale-[0.98]"
        type="button"
        onClick={onPlaceOrder}
      >
        Place an Order
      </button>
    </div>
  )
}

function CategoryButton({
  active,
  category,
  onClick,
}: {
  active: boolean
  category: {
    id: string
    label: string
    count: number
    iconUrl?: string
    iconHighlightedUrl?: string
  }
  onClick: () => void
}) {
  const hasSvg = Boolean(category.iconUrl)

  return (
    <button
      className={cn(
        'group flex min-h-[58px] w-full min-w-[170px] items-center gap-3 rounded-xl px-4 text-left transition-all duration-150',
        active
          ? 'bg-[#6066ed] text-white shadow-[0_4px_14px_rgba(96,102,237,0.3)]'
          : 'bg-white hover:bg-[#6066ed] hover:text-white hover:shadow-[0_4px_14px_rgba(96,102,237,0.25)] dark:bg-slate-800 dark:hover:bg-[#6066ed]',
      )}
      type="button"
      onClick={onClick}
    >
      {/* Icon container */}
      <span
        className={cn(
          'relative grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-all duration-150',
          active ? 'bg-white' : 'bg-slate-50 group-hover:bg-white dark:bg-slate-700',
        )}
      >
        {hasSvg ? (
          <>
            {/* Default icon — shown when inactive and not hovered */}
            <img
              src={category.iconUrl}
              alt=""
              aria-hidden
              className={cn(
                'absolute h-5 w-5 object-contain transition-opacity duration-150',
                active ? 'opacity-0' : 'opacity-100 group-hover:opacity-0',
              )}
            />
            {/* Highlighted icon — shown when active or on hover */}
            <img
              src={category.iconHighlightedUrl ?? category.iconUrl}
              alt=""
              aria-hidden
              className={cn(
                'absolute h-5 w-5 object-contain transition-opacity duration-150',
                active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              )}
            />
          </>
        ) : (
          // "All Menu" has no DB icon — use Lucide fallback
          <Image src={active ? '/allHighlighted.svg' : '/all.svg'} alt="" width={20} height={20} />
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">{category.label}</span>
        <span
          className={cn(
            'block text-xs transition-all duration-150',
            active
              ? 'text-white/80'
              : 'text-slate-400 group-hover:text-white/80 dark:text-slate-500',
          )}
        >
          {category.count} Menu In Stock
        </span>
      </span>
    </button>
  )
}

function spicyLabel(level: number) {
  if (level <= 0) return 'Not Spicy'
  if (level === 1) return 'Spicy Lv.1'
  if (level === 2) return 'Spicy Lv.5'
  if (level === 3) return 'Spicy Lv.3'
  return `Spicy Lv.${level}`
}

function money(value: number) {
  return `$${value.toFixed(2)}`
}

function SummaryRow({
  label,
  value,
  strong,
  negative,
}: {
  label: string
  value: string
  strong?: boolean
  negative?: boolean
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center justify-between',
        strong && 'font-bold text-slate-950 dark:text-slate-100',
      )}
    >
      <span className={cn('text-slate-400', strong && 'text-slate-500 dark:text-slate-300')}>
        {label}
      </span>
      <span className={cn(negative && 'text-rose-500')}>{value}</span>
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
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/40 px-6 py-8 backdrop-blur-[2px]">
      <div className="max-h-full w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white shadow-[0_20px_60px_rgba(26,31,44,0.22)] dark:bg-slate-900">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            type="button"
            onClick={onClose}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-base font-bold dark:text-slate-100">Detail Product</h3>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 px-5 pb-5 md:grid-cols-[minmax(0,1fr)_1.1fr]">
          <DishImage className="h-full w-full rounded-2xl" item={item} />

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="min-w-0">
                <h4 className="truncate text-xl font-bold dark:text-slate-100">{item.name}</h4>
                <p className="text-sm capitalize text-slate-400">{item.category}</p>
              </div>
              <p className="flex-shrink-0 text-xl font-bold text-[#6066ed]">{money(item.price)}</p>
            </div>

            <div className="py-4">
              <p className="mb-1.5 text-sm font-semibold dark:text-slate-100">Description</p>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 py-4 dark:border-slate-800">
              <p className="mb-2 text-sm font-semibold dark:text-slate-100">Spicy Level</p>
              {[0, 1, 2, 3].map((level) => (
                <label
                  key={level}
                  className="flex cursor-pointer items-center justify-between rounded-lg py-1 text-sm"
                >
                  <span className="text-slate-500 dark:text-slate-400">{spicyLabel(level)}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-400">
                    Free
                    <input
                      type="radio"
                      checked={spicyLevel === level}
                      onChange={() => setSpicyLevel(level)}
                      className="accent-[#6066ed]"
                    />
                  </span>
                </label>
              ))}
            </div>

            <div className="border-t border-slate-100 py-4 dark:border-slate-800">
              <label className="block text-sm font-semibold dark:text-slate-100">
                Notes
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#6066ed] focus:ring-1 focus:ring-[#6066ed]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Type notes here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-sm font-semibold dark:text-slate-100">Order Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-bold dark:text-slate-100">
                  {quantity}
                </span>
                <button
                  className="grid h-8 w-8 place-items-center rounded-lg bg-[#6066ed] text-white transition hover:bg-[#4e54d4]"
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="mt-4 h-11 w-full rounded-xl bg-[#6066ed] text-sm font-semibold text-white transition hover:bg-[#4e54d4] active:scale-[0.98]"
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
  isMember,
  onClose,
  onEditItem,
  onRemoveItem,
  onIncrementItem,
  onPlaceOrder,
}: {
  cartLines: Array<CartLine & { item: MenuItem }>
  summary: { subtotal: number; tax: number; discount: number; total: number }
  isMember: boolean
  onClose: () => void
  onEditItem: (item: MenuItem) => void
  onRemoveItem: (itemId: string) => void
  onIncrementItem: (itemId: string) => void
  onPlaceOrder: () => void
}) {
  return (
    <div className="fixed inset-0 z-[250] bg-black/30 backdrop-blur-[1px] xl:hidden">
      <div className="ml-auto flex h-full w-full max-w-[380px] flex-col bg-white shadow-[0_0_40px_rgba(26,31,44,0.18)] dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-base font-bold dark:text-slate-100">Detail Items</h2>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1">
            {cartLines.map((line) => (
              <CartLineRow
                key={line.itemId}
                line={line}
                onEdit={() => onEditItem(line.item)}
                onDecrement={() => onRemoveItem(line.itemId)}
                onIncrement={() => onIncrementItem(line.itemId)}
              />
            ))}
          </div>
        </div>

        <CartSummary summary={summary} isMember={isMember} onPlaceOrder={onPlaceOrder} />
      </div>
    </div>
  )
}
