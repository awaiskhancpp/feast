'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import AddOrderModal from '@/components/table/AddOrderModal'
import OrderMenu from '@/components/table/OrderMenu'
import TableFloor from '@/components/table/TableFloor'
import TableLegend from '@/components/table/TableLegend'
import { STATUS_META } from '@/components/table/tableData'
import type {
  Customer,
  MenuItem,
  OrderDraft,
  TableItem,
  TableOrder,
  TableStatus,
  TableShape,
} from '@/components/table/types'
import { cn, countStatuses, clampTablePosition } from '@/components/table/utils'
import {
  createTable,
  updateTablePosition,
  updateTableStatus,
  updateTableShape,
} from '@/app/(frontend)/table/actions'

interface TableProps {
  initialTables: TableItem[]
  customers: Customer[]
  dishes: MenuItem[]
  // Simple shape — only id+label needed; count computed in OrderMenu
  categories: { id: string; label: string }[]
}

// NOT async — client components cannot be async
export default function Table({ initialTables, customers, dishes, categories }: TableProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [tables, setTables] = useState<TableItem[]>(initialTables)
  const [activeFilter, setActiveFilter] = useState<TableStatus | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [activeOrder, setActiveOrder] = useState<TableOrder | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    setTables(initialTables)
  }, [initialTables])

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [selectedTableId, tables],
  )
  const canOpenOrder = !editMode && selectedTable?.status === 'available'
  const canEditTable = !editMode && selectedTable !== null && selectedTable.status !== 'available'

  const statusCounts = useMemo(() => countStatuses(tables), [tables])

  function handleAddTable(worldX: number, worldY: number, shape: TableShape, chairs: number) {
    startTransition(async () => {
      const result = await createTable(worldX, worldY, shape, chairs)
      if (result.table) {
        setTables((current) => [...current, result.table!])
      }
      router.refresh()
    })
  }

  function handleMoveTable(tableId: string, x: number, y: number) {
    setTables((current) => current.map((t) => (t.id === tableId ? { ...t, x, y } : t)))
  }

  function handleMoveTableEnd(tableId: string, x: number, y: number) {
    startTransition(async () => {
      await updateTablePosition(tableId, x, y)
      router.refresh()
    })
  }

  function handleRotateTable(tableId: string) {
    const table = tables.find((t) => t.id === tableId)
    if (!table) return

    const newShape: TableShape = table.shape === 'vertical' ? 'horizontal' : 'vertical'
    const clamped = clampTablePosition(table.x, table.y, newShape, table.chairs)

    setTables((current) =>
      current.map((t) =>
        t.id === tableId ? { ...t, shape: newShape, x: clamped.x, y: clamped.y } : t,
      ),
    )

    startTransition(async () => {
      await updateTableShape(tableId, newShape, clamped.x, clamped.y)
      router.refresh()
    })
  }

  function handleChangeStatus(status: TableStatus) {
    if (!selectedTable) return
    const time = status === 'dine' ? selectedTable.time || '03:22' : undefined

    setTables((current) =>
      current.map((t) => (t.id === selectedTable.id ? { ...t, status, time } : t)),
    )
    setSelectedTableId(null)

    startTransition(async () => {
      await updateTableStatus(selectedTable.id, status, time)
      router.refresh()
    })
  }

  function handleCreateOrder(draft: OrderDraft) {
    const createdOrder: TableOrder = {
      ...draft,
      orderNumber: `#${String(Date.now()).slice(-3)}`,
      createdAt: new Date().toISOString(),
    }

    const time = '03:22'
    setTables((current) =>
      current.map((table) =>
        table.id === draft.tableId
          ? { ...table, status: 'billed', time: table.time || time }
          : table,
      ),
    )
    setSelectedTableId(null)
    setActiveOrder(createdOrder)

    startTransition(async () => {
      await updateTableStatus(draft.tableId, 'billed', time)
      router.refresh()
    })
  }

  return (
    <div className="relative flex h-[calc(100dvh-5rem)] min-h-[520px] flex-col overflow-hidden bg-[#f4f5f8] lg:h-[calc(100dvh-6rem)] dark:bg-slate-950">
      <TableLegend
        activeFilter={activeFilter}
        counts={statusCounts}
        onFilterChange={(status) => setActiveFilter(activeFilter === status ? null : status)}
      />

      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2 sm:px-[18px] dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {editMode
            ? 'Drag a table to reposition it, or add a new one.'
            : 'Tap a table to view or start an order.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setEditMode((current) => !current)
            setSelectedTableId(null)
          }}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            editMode
              ? 'bg-[#6066ed] text-white'
              : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
          )}
        >
          {editMode ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editMode ? 'Done Editing' : 'Edit Layout'}
        </button>
      </div>

      <TableFloor
        activeFilter={activeFilter}
        editMode={editMode}
        selectedTableId={selectedTableId}
        tables={tables}
        onAddTable={handleAddTable}
        onClearSelection={() => setSelectedTableId(null)}
        onMoveTable={handleMoveTable}
        onMoveTableEnd={handleMoveTableEnd}
        onRotateTable={handleRotateTable}
        onSelectTable={setSelectedTableId}
      />

      <AddOrderModal
        customers={customers}
        open={canOpenOrder}
        table={canOpenOrder ? selectedTable : null}
        onClose={() => setSelectedTableId(null)}
        onCreateOrder={handleCreateOrder}
      />

      <TableStatusModal
        open={canEditTable}
        table={canEditTable ? selectedTable : null}
        onClose={() => setSelectedTableId(null)}
        onChangeStatus={handleChangeStatus}
      />

      {activeOrder ? (
        <OrderMenu
          dishes={dishes}
          order={activeOrder}
          categories={categories}
          onBack={() => setActiveOrder(null)}
        />
      ) : null}
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
      <div className="w-full max-w-[320px] rounded-2xl bg-white p-5 shadow-[0_18px_60px_rgba(26,31,44,0.18)] dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-gray-100">
              Table T-{table.tableNumber}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Change table mode</p>
          </div>
          <button
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            type="button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
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
                    ? 'border-[#6066ed] bg-[#f6f5ff] dark:bg-indigo-950/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
                )}
                onClick={() => onChangeStatus(status)}
              >
                <span className="flex items-center gap-2 dark:text-slate-200">
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
