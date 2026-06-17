'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { transactions } from './transactionData'
import type { SortKey, Transaction } from './transactionTypes'
import { cn } from '@/components/table/utils'

type TransactionTableProps = {
  onSelectTransaction?: (transaction: Transaction) => void
  selectedTransactionId?: string | null
}

export function TransactionTable({
  onSelectTransaction,
  selectedTransactionId = null,
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('date')

  const filteredData = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.table.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === 'table') return a.table.localeCompare(b.table)
      if (sortBy === 'items') return a.items - b.items
      if (sortBy === 'amount') return parseFloat(b.amount.slice(1)) - parseFloat(a.amount.slice(1))
      if (sortBy === 'status') return statusRank(a.status) - statusRank(b.status)
      return 0
    })
  }, [filteredData, sortBy])

  const hasSelection = Boolean(onSelectTransaction)

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 sm:p-6">
      <TransactionTableToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">ID Order</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Table</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Order Items</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>

          <tbody>
            {sortedData.map((transaction) => {
              const selected = selectedTransactionId === transaction.id

              return (
                <tr
                  key={transaction.id}
                  className={cn(
                    'border-b border-gray-100',
                    hasSelection && 'cursor-pointer hover:bg-gray-50',
                    selected && 'bg-indigo-50/60',
                  )}
                  onClick={onSelectTransaction ? () => onSelectTransaction(transaction) : undefined}
                >
                  <td className="px-4 py-4">{transaction.order}</td>
                  <td className="px-4 py-4">{transaction.date}</td>
                  <td className="px-4 py-4">{transaction.table}</td>
                  <td className="px-4 py-4">{transaction.items}</td>
                  <td className="px-4 py-4">{transaction.amount}</td>
                  <td className="px-4 py-4">
                    <StatusPill status={transaction.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {sortedData.map((transaction) => {
          const selected = selectedTransactionId === transaction.id

          return (
            <button
              key={transaction.id}
              type="button"
              className={cn(
                'w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm',
                hasSelection && 'transition hover:-translate-y-0.5 hover:shadow-md',
                selected && 'ring-2 ring-indigo-300',
              )}
              onClick={onSelectTransaction ? () => onSelectTransaction(transaction) : undefined}
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{transaction.order}</h4>
                <StatusPill status={transaction.status} />
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Value label="Date" value={transaction.date} />
                <Value label="Table" value={transaction.table} />
                <Value label="Order Items" value={`${transaction.items}`} />
                <Value label="Total Amount" value={transaction.amount} strong />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TransactionTableToolbar({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
}: {
  searchTerm: string
  setSearchTerm: (value: string) => void
  sortBy: SortKey
  setSortBy: (value: SortKey) => void
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        <p className="text-xs text-gray-500">
          Keep track of every transaction effortlessly with our detailed transaction history.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:justify-between lg:w-auto">
        <div className="relative flex-1 md:max-w-md lg:flex-none">
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

        <div className="flex gap-3">
          <button className="relative flex items-center whitespace-nowrap gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
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
  )
}

function StatusPill({ status }: { status: Transaction['status'] }) {
  const colors = {
    Success: 'bg-green-50 text-green-700 border border-green-200',
    Cancel: 'bg-red-50 text-red-700 border border-red-200',
    Pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  )
}

function Value({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className={strong ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}>
        {value}
      </p>
    </div>
  )
}

function statusRank(status: Transaction['status']) {
  switch (status) {
    case 'Success':
      return 0
    case 'Pending':
      return 1
    case 'Cancel':
      return 2
  }
}
