export type TransactionStatus = 'Success' | 'Cancel' | 'Pending'

export type TransactionDetail = {
  name: string
  note: string
  quantity: number
  price: string
  image: string
}

export type Transaction = {
  id: string
  order: string
  date: string
  table: string
  items: number
  amount: string
  status: TransactionStatus
  details: TransactionDetail[]
}

export type SortKey = 'date' | 'table' | 'items' | 'amount' | 'status'
