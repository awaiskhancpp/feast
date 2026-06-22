'use client'
import Image from 'next/image'
import type { Transaction } from './transactionTypes'

type TransactionDetailsPanelProps = {
  transaction: Transaction | null
}

export function TransactionDetailsPanel({ transaction }: TransactionDetailsPanelProps) {
  if (!transaction) {
    return (
      <div className="h-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Detail Orders</h4>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Select a transaction to view its order breakdown.
        </p>
      </div>
    )
  }

  const subtotal = transaction.details.reduce(
    (sum, line) => sum + parseFloat(line.price.slice(1)),
    0,
  )
  const tax = subtotal * 0.1
  const discount = subtotal * 0.5
  const total = subtotal + tax - discount

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detail Orders</h4>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {transaction.details.map((line) => (
          <div
            key={`${transaction.id}-${line.name}`}
            className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-start gap-3 rounded-xl py-1.5"
          >
            <img src={line.image} alt={line.name} className="h-16 w-16 rounded-lg object-cover" />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {line.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Note : {line.note}</p>
              <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                x{line.quantity}
              </p>
            </div>

            <div className="flex h-full flex-col items-end justify-start pt-0.5">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{line.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 shrink-0 rounded-2xl bg-gray-50 p-4 dark:bg-slate-800">
        <div className="space-y-2 text-sm">
          <Row label="Sub total" value={money(subtotal)} />
          <Row label="Tax 10%" value={money(tax)} />
          <Row label="Diskon 50%" value={`-${money(discount)}`} />
        </div>

        <div className="my-4 border-t border-dashed border-gray-200 dark:border-slate-700" />

        <Row label="Total Payment" value={money(total)} strong />
      </div>

      <button
        className="mt-4 h-11 w-full rounded-lg bg-[#6066ed] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(96,102,237,0.28)] hover:bg-[#555beb]"
        type="button"
      >
        Print Invoice
      </button>
    </aside>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between ${strong ? 'text-base font-bold' : 'text-sm'}`}
    >
      <span
        className={
          strong ? 'text-gray-600 dark:text-slate-300' : 'text-gray-400 dark:text-slate-500'
        }
      >
        {label}
      </span>
      <span className={strong ? 'text-gray-900 dark:text-gray-100' : 'dark:text-slate-200'}>
        {value}
      </span>
    </div>
  )
}

function money(value: number) {
  return `$${value.toFixed(2).replace('.', ',')}`
}
