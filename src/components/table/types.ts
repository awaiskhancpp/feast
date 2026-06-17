export type TableStatus = 'available' | 'billed' | 'reserved' | 'dine'

export type TableShape = 'vertical' | 'horizontal'

export type TableItem = {
  id: number
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
  tableId: number
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
  icon: 'all' | 'appetizers' | 'drink' | 'desserts' | 'coffee' | 'main' | 'salads' | 'seafood' | 'soup'
}

export type MenuItem = {
  id: number
  name: string
  category: string
  price: string
  description: string
  image: string
}
