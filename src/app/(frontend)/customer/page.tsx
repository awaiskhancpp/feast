import { getPayload } from 'payload'
import config from '@/payload.config'
import CustomerListPage, { type CustomerRow } from '@/components/layout/Customer'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const result = await payload.find({
    collection: 'customers',
    sort: '-createdAt',
    limit: 0,
    pagination: false,
  })

  const customers: CustomerRow[] = result.docs.map((doc) => ({
    id: String(doc.id),
    name: `${doc.firstName} ${doc.lastName}`,
    phone: doc.phoneNumber,
    address: doc.address,
    dateAdded: new Date(doc.createdAt).toLocaleDateString('en-CA'),
    status: doc.status === 'member' ? 'Member' : 'Guest',
  }))

  return <CustomerListPage customers={customers} />
}
