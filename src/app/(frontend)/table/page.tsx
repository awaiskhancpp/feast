import { getPayload } from 'payload'
import config from '@/payload.config'
import Table from '@/components/layout/Table'
import type {
  Customer,
  MenuItem,
  TableItem,
  TableShape,
  TableStatus,
} from '@/components/table/types'

export const dynamic = 'force-dynamic'

export default async function TablePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [tablesResult, customersResult, dishesResult] = await Promise.all([
    payload.find({ collection: 'tables', limit: 0, pagination: false }),
    payload.find({ collection: 'customers', limit: 0, pagination: false }),
    // depth: 1 populates `image` into the full Media doc so we get a usable url
    payload.find({ collection: 'dishes', limit: 0, pagination: false, depth: 1 }),
  ])

  const tables: TableItem[] = tablesResult.docs.map((doc) => ({
    id: String(doc.id),
    tableNumber: doc.tableNumber,
    x: doc.x,
    y: doc.y,
    shape: doc.shape as TableShape,
    chairs: doc.chairs ?? (doc.shape === 'horizontal' ? 8 : 6), // ← add this line
    status: doc.status as TableStatus,
    time: doc.time ?? undefined,
  }))

  const customers: Customer[] = customersResult.docs.map((doc) => ({
    id: String(doc.id),
    name: `${doc.firstName} ${doc.lastName}`,
  }))

  const dishes: MenuItem[] = dishesResult.docs.map((doc) => ({
    id: String(doc.id),
    name: doc.name,
    category: doc.category,
    price: doc.price,
    description: doc.description,
    inStock: doc.inStock ?? true,
    image: typeof doc.image === 'object' && doc.image?.url ? doc.image.url : undefined,
  }))

  return <Table customers={customers} dishes={dishes} initialTables={tables} />
}
