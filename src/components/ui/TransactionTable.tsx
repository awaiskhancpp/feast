'use client'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface Transaction {
  id: string
  order: string
  date: string
  table: string
  items: number
  amount: string
  status: 'Success' | 'Cancel' | 'Pending'
}

const transactions: Transaction[] = [
  {
    id: '1',
    order: '#001',
    date: '2024-05-01',
    table: 'T-4',
    items: 12,
    amount: '$24.00',
    status: 'Success',
  },
  {
    id: '2',
    order: '#002',
    date: '2024-05-01',
    table: 'T-10',
    items: 7,
    amount: '$32.71',
    status: 'Success',
  },
  {
    id: '3',
    order: '#003',
    date: '2024-05-02',
    table: 'T-12',
    items: 6,
    amount: '$60.00',
    status: 'Cancel',
  },
  {
    id: '4',
    order: '#004',
    date: '2024-05-03',
    table: 'T-8',
    items: 20,
    amount: '$25.00',
    status: 'Success',
  },
]

type SortKey = 'date' | 'amount'

export function TransactionTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('date')

  const filteredData = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.table.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === 'amount') return parseFloat(b.amount.slice(1)) - parseFloat(a.amount.slice(1))
      return 0
    })
  }, [filteredData, sortBy])

  const getStatusColor = (status: Transaction['status']) => {
    const colors = {
      Success: 'bg-green-50 text-green-700 border border-green-200',
      Cancel: 'bg-red-50 text-red-700 border border-red-200',
      Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    }
    return colors[status]
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      <div className="flex justify-between mb-6">
        <div className="">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <p className="text-xs text-gray-500">
            Keep track of every transaction effortlessly with our detailed transaction history.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">
              <Image src="/icons/searchIcon.svg" alt="" width={20} height={20} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <div className="flex gap-3 ">
            <button className="relative flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Sort by
              <ChevronDown className="w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Sort */}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">ID Order</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Table</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Order Items</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 text-[#000910]">{transaction.order}</td>
                <td className="py-4 px-4 text-[#000910]">{transaction.date}</td>
                <td className="py-4 px-4 text-[#000910]">{transaction.table}</td>
                <td className="py-4 px-4 text-[#000910]">{transaction.items}</td>
                <td className="py-4 px-4 text-[#000910]">{transaction.amount}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
