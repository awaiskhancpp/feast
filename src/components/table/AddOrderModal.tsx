'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ChevronDown, Minus, Plus, X } from 'lucide-react'
import type { Customer, OrderDraft, OrderType, TableItem } from './types'
import { cn } from './utils'

type AddOrderModalProps = {
  customers: Customer[]
  open: boolean
  table: TableItem | null
  onClose: () => void
  onCreateOrder: (draft: OrderDraft) => void
}

export default function AddOrderModal({
  customers,
  open,
  table,
  onClose,
  onCreateOrder,
}: AddOrderModalProps) {
  const [orderType, setOrderType] = useState<OrderType>('dine-in')
  const [customerName, setCustomerName] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    setOrderType('dine-in')
    setCustomerName('')
    setGuestCount(2)
    setCustomerMenuOpen(false)
  }, [open, table?.id])

  const visibleCustomers = useMemo(() => {
    const query = customerName.trim().toLowerCase()
    if (!query) return customers

    return customers.filter((customer) => customer.name.toLowerCase().includes(query))
  }, [customerName, customers])

  if (!open || !table) return null

  const createOrder = () => {
    onCreateOrder({
      orderType,
      tableId: table.id,
      customerName: customerName.trim() || 'Walk-in Customer',
      guests: guestCount,
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-3 py-4 backdrop-blur-[1px] sm:px-4 sm:py-6">
      <form
        className="w-full max-w-[330px] rounded-2xl bg-white p-4 shadow-[0_18px_60px_rgba(26,31,44,0.18)] sm:p-5"
        onSubmit={(event) => {
          event.preventDefault()
          createOrder()
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-bold text-slate-950 sm:text-base">Add New Order</h2>
          <button
            className="grid h-8 w-8 place-items-center border border-primary text-primary hover:bg-[#f6f3ff]"
            type="button"
            onClick={onClose}
            aria-label="Close add order"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <OrderTypeButton
            active={orderType === 'dine-in'}
            label="Dine in"
            onClick={() => setOrderType('dine-in')}
          />
          <OrderTypeButton
            active={orderType === 'takeaway'}
            label="Take away"
            onClick={() => setOrderType('takeaway')}
          />
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-950">Table</span>
            <input
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
              value={`T-${table.tableNumber}`}
              readOnly
            />
          </label>

          <label className="relative block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-950">Customer Name</span>
            <div className="relative">
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-[#6066ed] focus:ring-1 focus:ring-[#6066ed]"
                value={customerName}
                placeholder="Walk-in Customer"
                onChange={(event) => {
                  setCustomerName(event.target.value)
                  setCustomerMenuOpen(true)
                }}
                onFocus={() => setCustomerMenuOpen(true)}
              />
              <button
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center text-[#8d70ff]"
                type="button"
                onClick={() => setCustomerMenuOpen((current) => !current)}
                aria-label="Toggle customer list"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {customerMenuOpen ? (
              <div className="absolute left-0 right-0 top-[68px] z-20 max-h-48 overflow-y-auto rounded-md bg-white py-1 shadow-[0_12px_30px_rgba(24,29,42,0.16)]">
                {visibleCustomers.length === 0 ? (
                  <p className="px-4 py-2 text-xs text-slate-400">No matching customers</p>
                ) : (
                  visibleCustomers.map((customer) => (
                    <button
                      className={cn(
                        'flex h-8 w-full items-center px-4 text-left text-xs text-slate-600 hover:bg-slate-50',
                        customer.name === customerName &&
                          'bg-slate-50 font-semibold text-slate-950',
                      )}
                      type="button"
                      key={customer.id}
                      onClick={() => {
                        setCustomerName(customer.name)
                        setCustomerMenuOpen(false)
                      }}
                    >
                      {customer.name}
                    </button>
                  ))
                )}
                <button
                  className="flex h-8 w-full items-center px-4 text-left text-xs text-slate-600 hover:bg-slate-50"
                  type="button"
                  onClick={() => setCustomerMenuOpen(false)}
                >
                  Custom...
                </button>
              </div>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-950">Guest</span>
            <div className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-2">
              <button
                className="grid h-6 w-6 place-items-center rounded bg-slate-100 text-slate-500 disabled:opacity-40"
                type="button"
                disabled={guestCount <= 1}
                onClick={() => setGuestCount((count) => Math.max(1, count - 1))}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="flex-1 text-center text-xs text-slate-600">{guestCount}</span>

              <button
                className="grid h-6 w-6 place-items-center rounded bg-[#6066ed] text-white"
                type="button"
                onClick={() => setGuestCount((count) => count + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </label>
        </div>

        <button
          className="mt-6 h-11 w-full rounded-lg bg-[#6066ed] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(96,102,237,0.28)] hover:bg-[#555beb]"
          type="submit"
        >
          Create Order
        </button>
      </form>
    </div>
  )
}

function OrderTypeButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        'h-9 rounded-md text-xs font-semibold text-slate-500 transition',
        active && 'bg-white text-[#6066ed] shadow-sm',
      )}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
