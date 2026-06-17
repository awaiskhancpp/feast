'use client'

import { useState } from 'react'
import { TransactionDetailsPanel } from '@/components/ui/TransactionsDetailPanel'
import { TransactionTable } from '@/components/ui/TransactionTable'
import { transactions } from '@/components/ui/transactionData'
import type { Transaction } from '@/components/ui/transactionTypes'

export default function TransactionHistory() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(
    transactions.find((transaction) => transaction.order === '#002') ?? transactions[0] ?? null,
  )

  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-2 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div className="min-w-0">
        <TransactionTable
          selectedTransactionId={selectedTransaction?.id ?? null}
          onSelectTransaction={setSelectedTransaction}
        />
      </div>
      <div className="min-w-0 xl:self-stretch">
        <TransactionDetailsPanel transaction={selectedTransaction} />
      </div>
    </div>
  )
}
