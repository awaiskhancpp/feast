'use client'

import { useMemo, useState } from 'react'
import AddOrderModal from '@/components/table/AddOrderModal'
import OrderMenu from '@/components/table/OrderMenu'
import TableFloor from '@/components/table/TableFloor'
import TableLegend from '@/components/table/TableLegend'
import { INITIAL_TABLES } from '@/components/table/tableData'
import { STATUS_META } from '@/components/table/tableData'
import type { OrderDraft, TableItem, TableOrder, TableStatus } from '@/components/table/types'
import { cn, countStatuses } from '@/components/table/utils'

export default function Table() {
  const [tables, setTables] = useState<TableItem[]>(() =>
    INITIAL_TABLES.map((table) => ({ ...table })),
  )
  const [activeFilter, setActiveFilter] = useState<TableStatus | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [activeOrder, setActiveOrder] = useState<TableOrder | null>(null)

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [selectedTableId, tables],
  )
  const canOpenOrder = selectedTable?.status === 'available'
  const canEditTable = selectedTable !== null && selectedTable.status !== 'available'

  const statusCounts = useMemo(() => countStatuses(tables), [tables])

  const handleCreateOrder = (draft: OrderDraft) => {
    const createdOrder: TableOrder = {
      ...draft,
      orderNumber: '#002',
      createdAt: new Date().toISOString(),
    }

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === draft.tableId
          ? { ...table, status: 'billed', time: table.time || '03:22' }
          : table,
      ),
    )
    setSelectedTableId(null)
    setActiveOrder(createdOrder)
  }

  return (
    <div className="relative flex h-[calc(100dvh-5rem)] min-h-[520px] flex-col overflow-hidden bg-[#f4f5f8] lg:h-[calc(100dvh-6rem)]">
      <TableLegend
        activeFilter={activeFilter}
        counts={statusCounts}
        onFilterChange={(status) => setActiveFilter(activeFilter === status ? null : status)}
      />

      <TableFloor
        activeFilter={activeFilter}
        selectedTableId={selectedTableId}
        tables={tables}
        onClearSelection={() => setSelectedTableId(null)}
        onSelectTable={setSelectedTableId}
      />

      <AddOrderModal
        open={canOpenOrder}
        table={canOpenOrder ? selectedTable : null}
        onClose={() => setSelectedTableId(null)}
        onCreateOrder={handleCreateOrder}
      />

      <TableStatusModal
        open={canEditTable}
        table={canEditTable ? selectedTable : null}
        onClose={() => setSelectedTableId(null)}
        onChangeStatus={(status) => {
          if (!selectedTable) return
          setTables((currentTables) =>
            currentTables.map((table) =>
              table.id === selectedTable.id
                ? { ...table, status, time: status === 'dine' ? table.time || '03:22' : undefined }
                : table,
            ),
          )
          setSelectedTableId(null)
        }}
      />

      {activeOrder ? <OrderMenu order={activeOrder} onBack={() => setActiveOrder(null)} /> : null}
    </div>
  )
}

function TableStatusModal({
  open,
  table,
  onClose,
  onChangeStatus,
}: {
  open: boolean
  table: TableItem | null
  onClose: () => void
  onChangeStatus: (status: TableStatus) => void
}) {
  if (!open || !table) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-6 backdrop-blur-[1px]">
      <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-[0_18px_60px_rgba(26,31,44,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Table T-{table.id}</h2>
            <p className="text-xs text-slate-500">Change table mode</p>
          </div>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="grid gap-2">
          {(['available', 'dine', 'reserved', 'billed'] as TableStatus[]).map((status) => {
            const meta = STATUS_META[status]
            const active = table.status === status

            return (
              <button
                key={status}
                type="button"
                className={cn(
                  'flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition',
                  active
                    ? 'border-[#6066ed] bg-[#f6f5ff]'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                )}
                onClick={() => onChangeStatus(status)}
              >
                <span className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full', meta.dotClass)} />
                  {meta.label}
                </span>
                {active ? (
                  <span className="text-xs font-semibold text-[#6066ed]">Current</span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
