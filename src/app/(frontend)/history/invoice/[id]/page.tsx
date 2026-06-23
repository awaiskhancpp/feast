import { notFound } from 'next/navigation'
import Invoice from '@/components/invoice/Invoice'
import type { Transaction } from '@/components/transaction/transactionTypes' // If this path is wrong, we'll fix it

type Props = {
  params: Promise<{ id: string }> // Next.js 15+ recommended
}

export default async function InvoicePage({ params }: Props) {
  const { id } = await params // Await params (important in newer Next.js)

  if (!id) {
    notFound()
  }

  // Safe mock transaction
  const mockTransaction: Transaction = {
    id,
    order: `ORD-${id.substring(0, 8)}`, // Safe alternative to .slice()
    date: new Date().toISOString(),
    table: 'T05',
    items: 3,
    amount: '$45.50',
    status: 'Success' as const,
    details: [
      {
        name: 'Grilled Salmon',
        note: 'Medium rare',
        quantity: 1,
        price: '$18.99',
        image: '/placeholder-food.jpg',
      },
      {
        name: 'Caesar Salad',
        note: 'No croutons',
        quantity: 2,
        price: '$12.50',
        image: '/placeholder-food.jpg',
      },
    ],
  }

  const mockCustomer = {
    name: 'John Paul',
    isMember: true,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <Invoice
        transaction={mockTransaction}
        customer={mockCustomer}
        tableNumber={mockTransaction.table}
      />
    </div>
  )
}
