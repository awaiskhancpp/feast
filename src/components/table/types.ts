export type TableStatus = 'available' | 'billed' | 'reserved' | 'dine'
export type TableShape = 'vertical' | 'horizontal'

export type TableItem = {
  id: string
  tableNumber: string
  x: number
  y: number
  shape: TableShape
  chairs: number
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
  isMember: boolean
}

export type TableOrder = OrderDraft & {
  orderNumber: string
  createdAt: string
}

export type Customer = {
  id: string
  name: string
  status: 'member' | 'guest'
}

export type MenuCategory = {
  id: string
  label: string
  count?: number
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
