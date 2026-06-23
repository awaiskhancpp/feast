'use client'

import { useEffect, useRef } from 'react'
import type { Transaction } from '@/components/transaction/transactionTypes'

type InvoiceProps = {
  transaction: Transaction
  customer?: { name: string; isMember: boolean } | null
  tableNumber?: string
}

export default function Invoice({ transaction, customer, tableNumber }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const subtotal = transaction.details.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', '') || '0')
    return sum + price * item.quantity
  }, 0)

  const discount = customer?.isMember ? subtotal * 0.5 : 0
  const tax = subtotal * 0.1
  const total = subtotal + tax - discount

  const printInvoice = () => {
    window.print()
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @page { 
        size: A4 portrait; 
        margin: 15mm; 
      }
      @media print {
        body * { visibility: hidden; }
        .invoice, .invoice * { visibility: visible; }
        .invoice { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: 100%; 
        }
        .no-print { display: none !important; }
      }
    `
    document.head.appendChild(style)

    // Proper cleanup
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div
      ref={invoiceRef}
      className="invoice max-w-[210mm] mx-auto bg-white p-8 shadow-xl text-sm print:shadow-none"
    >
      {/* Header */}
      <div className="flex justify-between border-b pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">INVOICE</h1>
          <p className="text-gray-500 mt-1">FEAST Restaurant</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg">#{transaction.order}</div>
          <div className="text-gray-500">{new Date().toLocaleDateString('en-US')}</div>
        </div>
      </div>

      {/* Customer & Table Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="uppercase text-xs tracking-widest text-gray-500 mb-1">Billed To</div>
          <div className="font-medium">{customer?.name || 'Walk-in Customer'}</div>
          {customer?.isMember && (
            <div className="text-sm text-emerald-600 font-medium">⭐ Member</div>
          )}
        </div>
        <div className="text-right">
          <div className="uppercase text-xs tracking-widest text-gray-500 mb-1">Table</div>
          <div className="font-medium">{tableNumber || transaction.table}</div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-widest text-gray-500">
            <th className="py-3">Item</th>
            <th className="py-3 text-center">Qty</th>
            <th className="py-3 text-right">Rate</th>
            <th className="py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transaction.details.map((item, idx) => {
            const price = parseFloat(item.price.replace('$', '') || '0')
            const amount = price * item.quantity
            return (
              <tr key={idx} className="border-b last:border-none">
                <td className="py-4 font-medium">{item.name}</td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right">${price.toFixed(2)}</td>
                <td className="py-4 text-right font-medium">${amount.toFixed(2)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div className="ml-auto w-80 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {customer?.isMember && (
          <div className="flex justify-between text-emerald-600">
            <span>Member Discount (50%)</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3 flex justify-between font-bold text-base">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-500 no-print">
        Thank you for dining with us!
        <br />
        Payment due within 14 days
      </div>

      {/* Print Button - Hidden when printing */}
      <button
        onClick={printInvoice}
        className="no-print mt-8 w-full bg-[#6066ed] hover:bg-[#4f54e0] text-white py-3 rounded-lg font-semibold transition"
      >
        Print Invoice
      </button>
    </div>
  )
}
