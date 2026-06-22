import TableChairs from './TableChairs'
import { STATUS_META } from './tableData'
import type { TableItem } from './types'
import { cn, getTableDimensions, getTableSurfaceBox } from './utils'

type FloorTableProps = {
  editMode: boolean
  muted: boolean
  selected: boolean
  table: TableItem
  x: number
  y: number
}

export default function FloorTable({ editMode, muted, selected, table, x, y }: FloorTableProps) {
  const meta = STATUS_META[table.status]
  const dimensions = getTableDimensions(table.shape, table.chairs)
  const surface = getTableSurfaceBox(table.shape, table.chairs)

  return (
    <button
      className={cn(
        'floor-table absolute border-0 bg-transparent p-0 opacity-100 transition-opacity duration-150 ease-out',
        editMode ? 'cursor-move' : 'cursor-pointer',
        muted && 'opacity-[0.18]',
      )}
      type="button"
      data-id={table.id}
      style={{ left: x, top: y, width: dimensions.width, height: dimensions.height }}
      aria-label={`Table ${table.tableNumber}, ${meta.label}`}
    >
      <TableChairs shape={table.shape} chairs={table.chairs} />

      <span
        className={cn(
          'absolute rounded-[7px] bg-white shadow-[0_1px_5px_rgba(30,35,50,0.06)]',
          selected && 'shadow-[0_0_0_2px_rgba(91,95,242,0.26),0_10px_20px_rgba(91,95,242,0.12)]',
        )}
        style={surface}
      >
        <span
          className={cn(
            'absolute left-1/2 top-1/2 grid h-[35px] w-[35px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-bold tracking-normal shadow-[0_1px_0_rgba(0,0,0,0.02)]',
            meta.badgeClass,
          )}
        >
          T-{table.tableNumber}
        </span>

        {table.time && !(table.shape === 'vertical' && table.chairs <= 1) ? (
          <span className="absolute bottom-[6px] left-1/2 -translate-x-1/2 rounded bg-[#f4f3ff] px-[5px] py-[3px] text-[10px] font-medium leading-none text-[#5b5ff2]">
            {table.time}
          </span>
        ) : null}
      </span>
    </button>
  )
}
