import { TransactionTable } from '@/components/ui/TransactionTable'

export default function TransactionHistory() {
  return (
    <div className="grid grid-cols-12 px-4 py-2">
      <div className="col-span-8">
        <TransactionTable />
      </div>
      <div className="grid-cols-4"></div>
    </div>
  )
}
