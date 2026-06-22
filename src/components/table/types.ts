export type TableStatus = 'available' | 'billed' | 'reserved' | 'dine'

export type TableShape = 'vertical' | 'horizontal'

export type TableItem = {
  // Payload document id - the stable identity used for persistence (update/delete).
  // Normalized to a string at the server boundary (table/page.tsx) so nothing
  // downstream has to care whether the database's native id is numeric or text.
  id: string
  // Human-facing label ("T-24"), independent of the database id - renumbering
  // a table is just editing this field, never touching the primary key.
  tableNumber: string
  x: number
  y: number
  shape: TableShape
  status: TableStatus
  time?: string
}

export type TableStatusMeta = {
  label: string
  color: string
  short: string
  dotClass: string
  badgeClass: string
}

export type OrderType = 'dine-in' | 'takeaway'

export type OrderDraft = {
  orderType: OrderType
  tableId: string
  customerName: string
  guests: number
}

export type TableOrder = OrderDraft & {
  orderNumber: string
  createdAt: string
}

export type Customer = {
  id: string
  name: string
}

export type MenuCategory = {
  id: string
  label: string
  count: number
}

export type MenuItem = {
  id: string
  name: string
  category: string
  price: number
  description: string
  image?: string
  inStock: boolean
}

export type CartLine = {
  itemId: string
  quantity: number
  note: string
  spicyLevel: number
}
