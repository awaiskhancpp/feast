'use client'

import { useMemo, useState } from 'react'
import AddOrderModal from '@/components/table/AddOrderModal'
import OrderMenu from '@/components/table/OrderMenu'
import TableFloor from '@/components/table/TableFloor'
import TableLegend from '@/components/table/TableLegend'
import { INITIAL_TABLES } from '@/components/table/tableData'
import type { OrderDraft, TableItem, TableOrder, TableStatus } from '@/components/table/types'
import { countStatuses } from '@/components/table/utils'

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
        open={selectedTable !== null}
        table={selectedTable}
        onClose={() => setSelectedTableId(null)}
        onCreateOrder={handleCreateOrder}
      />

      {activeOrder ? <OrderMenu order={activeOrder} onBack={() => setActiveOrder(null)} /> : null}
    </div>
  )
}
