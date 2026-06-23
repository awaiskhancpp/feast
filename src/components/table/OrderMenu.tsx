'use client'
import PaymentModal from './PaymentModal'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChefHat,
  Coffee,
  CupSoda,
  Edit3,
  Grid2X2,
  IceCreamBowl,
  Salad,
  Search,
  ShoppingCart,
  Soup,
  UtensilsCrossed,
  Waves,
  X,
} from 'lucide-react'
import { MENU_CATEGORY_META, type MenuCategoryIcon } from './tableData'
import type { CartLine, MenuCategory, MenuItem, TableOrder } from './types'
import { cn } from './utils'

type OrderMenuProps = {
  dishes: MenuItem[]
  order: TableOrder
  onBack: () => void
}

export default function OrderMenu({ dishes, order, onBack }: OrderMenuProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<Record<string, CartLine>>({})
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const orderableDishes = useMemo(() => dishes.filter((d) => d.inStock), [dishes])

  const categories: MenuCategory[] = useMemo(
    () =>
      MENU_CATEGORY_META.map((meta) => ({
        id: meta.id,
        label: meta.label,
        count:
          meta.id === 'all'
            ? orderableDishes.length
            : orderableDishes.filter((d) => d.category === meta.id).length,
      })),
    [orderableDishes],
  )

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
    const discount = order.isMember ? subtotal * 0.2 : 0
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
    <div className="absolute inset-0 z-[40] flex flex-col overflow-hidden bg-[#f7f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold dark:text-slate-100 sm:text-base">
              Order {order.orderNumber} - Table T-{order.tableId}
            </h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {order.customerName} · {order.guests} guests
            </p>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="border-b border-slate-100 bg-white px-4 py-2.5 lg:hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d70ff]" />
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#6066ed] focus:ring-1 focus:ring-[#6066ed] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="Search here..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {/* Main grid */}
      <div
        className={cn(
          'grid min-h-0 flex-1 gap-4 p-4 md:p-5 xl:p-6 max-lg:grid-cols-1 max-lg:content-start max-lg:overflow-y-auto',
          'grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[170px_minmax(0,1fr)_400px]',
        )}
      >
        {/* Category sidebar */}
        <aside className="space-y-3 max-lg:flex max-lg:overflow-x-auto max-lg:space-x-3 max-lg:space-y-0">
          {categories.map((category) => (
            <CategoryButton
              active={activeCategory === category.id}
              category={category}
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </aside>

        {/* Dish cards */}
        <section className="min-h-0 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredItems.length === 0 ? (
            <div className="grid min-h-[200px] place-items-center text-center">
              <p className="text-sm text-slate-400">
                {search ? `No dishes match "${search}".` : 'No dishes in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="mx-4 my-4 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:gap-4">
              {filteredItems.map((item) => {
                const quantity = selectedItems[item.id]?.quantity ?? 0
                return (
                  <button
                    className={cn(
                      'relative overflow-hidden rounded-xl bg-white p-2 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#6066ed] dark:bg-slate-800 dark:shadow-slate-900/40',
                      quantity > 0 && 'ring-2 ring-[#6066ed]',
                    )}
                    type="button"
                    key={item.id}
                    onClick={() => setDetailItem(item)}
                  >
                    <DishImage className="h-42 w-full rounded-lg" item={item} />
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <h2 className="text-sm font-bold text-slate-950 dark:text-slate-100">
                        {item.name}
                      </h2>
                      <span className="text-sm font-bold text-[#6066ed]">{money(item.price)}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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
          )}
        </section>

        {/* Desktop cart */}
        <aside className="hidden min-h-0 flex-col overflow-y-auto rounded-2xl bg-white p-4 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex dark:bg-slate-900">
          {hasCartItems ? (
            <>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-slate-100">
                    Detail Items
                  </h2>
                  <p className="text-xs text-slate-400">{cartLines.length} items in cart</p>
                </div>
              </div>

              <div className="space-y-3">
                {cartLines.map((line) => (
                  <CartLineRow
                    key={line.itemId}
                    line={line}
                    onDecrement={() => updateCartQuantity(line.itemId, -1)}
                    onIncrement={() => updateCartQuantity(line.itemId, 1)}
                  />
                ))}
              </div>

              <CartSummary
                summary={summary}
                isMember={order.isMember}
                onPlaceOrder={() => setPaymentOpen(true)}
              />
            </>
          ) : (
            <div className="grid h-full min-h-[200px] place-items-center text-center">
              <p className="text-sm text-slate-400">Tap a dish to add it to this order.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Floating cart button (below xl) */}
      {hasCartItems && !drawerOpen ? (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-[#6066ed] py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(96,102,237,0.4)] xl:hidden"
        >
          <ShoppingCart className="h-4 w-4" />
          {cartLines.length} item{cartLines.length === 1 ? '' : 's'}
          <span className="border-l border-white/30 pl-2">{money(summary.total)}</span>
        </button>
      ) : null}

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
          onIncrementItem={(itemId) => updateCartQuantity(itemId, 1)}
          onPlaceOrder={() => setPaymentOpen(true)}
          summary={summary}
          isMember={order.isMember}
        />
      ) : null}

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
  onDecrement,
  onIncrement,
}: {
  line: CartLine & { item: MenuItem }
  onDecrement: () => void
  onIncrement: () => void
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-1">
      <DishImage className="h-18 w-18 flex-shrink-0 rounded-lg" item={line.item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold dark:text-slate-100">{line.item.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{line.note}</p>
          </div>
          <p className="flex-shrink-0 text-sm font-bold dark:text-slate-100">
            {money(line.item.price)}
          </p>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-[#6066ed]">x{line.quantity}</span>
          <div className="flex items-center gap-1">
            <button
              className="grid h-6 w-6 place-items-center rounded-md text-slate-600 "
              type="button"
              onClick={onDecrement}
              aria-label={`Remove one ${line.item.name}`}
            >
              -
            </button>
            <button
              className="text-[#8d70ff]"
              type="button"
              onClick={onIncrement}
              aria-label={`Add one ${line.item.name}`}
            >
              +
            </button>
          </div>
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
    <div className="mt-4 border-t border-dashed border-slate-200 pt-4 text-sm dark:border-slate-700">
      <SummaryRow label="Sub total" value={money(summary.subtotal)} />
      <SummaryRow label="Tax" value={money(summary.tax)} />
      {isMember && summary.discount > 0 && (
        <SummaryRow label="Member discount" value={`-${money(summary.discount)}`} />
      )}
      <div className="my-4 border-t border-dashed border-slate-200 dark:border-slate-700" />
      <SummaryRow label="Total Payment" value={money(summary.total)} strong />
      <div className="mt-4 flex gap-2">
        <input
          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Discount Code"
        />
        <button
          className="h-9 flex-shrink-0 rounded-lg border border-slate-200 px-4 text-xs font-semibold dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          type="button"
        >
          Apply
        </button>
      </div>
      <button
        className="mt-4 h-11 w-full rounded-lg bg-[#6066ed] text-sm font-semibold text-white"
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
  category: MenuCategory
  onClick: () => void
}) {
  const Icon = getCategoryIcon(category.id as MenuCategoryIcon)

  return (
    <button
      className={cn(
        'group flex min-h-[58px] w-full min-w-[170px] items-center gap-3 rounded-xl px-4 text-left transition',
        active
          ? 'bg-primary text-white'
          : 'bg-white hover:bg-primary hover:text-white dark:bg-slate-800 dark:hover:bg-primary',
      )}
      type="button"
      onClick={onClick}
    >
      <span
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-lg transition',
          active
            ? 'bg-white/15 text-white'
            : 'bg-slate-50 text-slate-500 group-hover:bg-white/15 group-hover:text-white dark:bg-slate-700 dark:text-slate-400',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">{category.label}</span>
        <span
          className={cn(
            'block text-xs transition',
            active
              ? 'text-white/85'
              : 'text-slate-500 group-hover:text-white/85 dark:text-slate-400',
          )}
        >
          {category.count} Menu In Stock
        </span>
      </span>
    </button>
  )
}

function getCategoryIcon(icon: MenuCategoryIcon) {
  const icons = {
    all: Grid2X2,
    appetizers: ChefHat,
    drink: CupSoda,
    desserts: IceCreamBowl,
    coffee: Coffee,
    main: UtensilsCrossed,
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
  return `$${value.toFixed(2)}`
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center justify-between',
        strong && 'text-base font-bold text-slate-950 dark:text-slate-100',
      )}
    >
      <span className={cn('text-slate-400', strong && 'text-slate-500 dark:text-slate-300')}>
        {label}
      </span>
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
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/30 px-4 py-6 backdrop-blur-[1px]">
      <div className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white shadow-[0_18px_60px_rgba(26,31,44,0.18)] dark:bg-slate-900">
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
            className="grid h-8 w-8 place-items-center text-slate-500 dark:text-slate-400"
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 px-5 pb-5 md:grid-cols-[minmax(0,1fr)_1.1fr]">
          <DishImage className="min-h-[500px] w-full rounded-2xl md:h-[340px]" item={item} />
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="min-w-0">
                <h4 className="truncate text-xl font-bold dark:text-slate-100">{item.name}</h4>
                <p className="text-sm text-slate-400">{item.category}</p>
              </div>
              <p className="flex-shrink-0 text-xl font-bold text-[#6066ed]">{money(item.price)}</p>
            </div>

            <div className="py-4">
              <p className="mb-2 text-sm font-semibold dark:text-slate-100">Description</p>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 py-4 dark:border-slate-800">
              <p className="text-sm font-semibold dark:text-slate-100">Spicy Level</p>
              {[0, 1, 2, 3].map((level) => (
                <label
                  key={level}
                  className="flex items-center justify-between rounded-lg py-1 text-sm text-slate-500 dark:text-slate-400"
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

            <div className="border-t border-slate-100 py-4 dark:border-slate-800">
              <label className="block text-sm font-semibold dark:text-slate-100">
                Notes
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                  placeholder="Type notes here..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-sm font-semibold dark:text-slate-100">Order Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  className="grid h-7 w-7 place-items-center rounded-md bg-slate-100 dark:bg-slate-700 dark:text-slate-100"
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-semibold dark:text-slate-100">
                  {quantity}
                </span>
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
    <div className="fixed inset-0 bg-black/20 xl:hidden">
      <div className="ml-auto h-full w-full max-w-[380px] overflow-y-auto bg-white p-4 shadow-[0_18px_60px_rgba(26,31,44,0.18)] dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold dark:text-slate-100">Detail Items</h2>
          <button
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            type="button"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          {cartLines.map((line) => (
            <CartLineRow
              key={line.itemId}
              line={line}
              onDecrement={() => onRemoveItem(line.itemId)}
              onIncrement={() => onIncrementItem(line.itemId)}
            />
          ))}
        </div>
        <CartSummary summary={summary} isMember={isMember} onPlaceOrder={onPlaceOrder} />
      </div>
    </div>
  )
}
