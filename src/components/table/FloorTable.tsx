import { RotateCcw } from 'lucide-react'
import TableChairs from './TableChairs'
import { STATUS_META } from './tableData'
import type { TableItem } from './types'
import { getTableDimensions, getTableSurfaceBox, cn } from './utils'

type FloorTableProps = {
  editMode: boolean
  muted: boolean
  selected: boolean
  table: TableItem
  x: number
  y: number
  onRotate: (tableId: string) => void
}

export default function FloorTable({
  editMode,
  muted,
  selected,
  table,
  x,
  y,
  onRotate,
}: FloorTableProps) {
  const meta = STATUS_META[table.status]
  const dimensions = getTableDimensions(table.shape, table.chairs)
  // Same dimensions feeding both this and TableChairs' getTableSeatRects, so
  // the surface box and the seats always scale together. A separate,
  // hand-tuned/bucketed size here (as a prior version of this file had) drifts
  // from the seats at chair counts the buckets weren't tuned for - e.g. every
  // vertical table with 5-8 chairs got the same fixed surface size, while the
  // seats themselves kept spreading out across the full table height, so the
  // higher-capacity tables ended up with seats visibly detached from the card.
  const surface = getTableSurfaceBox(table.shape, table.chairs)

  return (
    <div
      className={cn(
        'floor-table absolute opacity-100 transition-opacity duration-150 ease-out',
        muted && 'opacity-[0.18]',
      )}
      data-id={table.id}
      style={{ left: x, top: y, width: dimensions.width, height: dimensions.height }}
    >
      {/* The actual clickable table button */}
      <button
        className={cn(
          'absolute inset-0 border-0 bg-transparent p-0',
          editMode ? 'cursor-move' : 'cursor-pointer',
        )}
        type="button"
        data-id={table.id}
        aria-label={`Table ${table.tableNumber}, ${meta.label}`}
      >
        <TableChairs shape={table.shape} chairs={table.chairs} />

        <span
          className={cn(
            'absolute rounded-[7px] bg-white shadow-[0_1px_5px_rgba(30,35,50,0.06)] dark:bg-slate-700 dark:shadow-none',
            selected &&
              'shadow-[0_0_0_2px_rgba(91,95,242,0.26),0_10px_20px_rgba(91,95,242,0.12)] dark:shadow-[0_0_0_2px_rgba(96,102,237,0.6)]',
          )}
          style={surface}
        >
          <span
            className={cn(
              'absolute left-1/2 top-1/2 grid h-[35px] w-[35px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-bold tracking-normal',
              meta.badgeClass,
            )}
          >
            T-{table.tableNumber}
          </span>

          {table.time && !(table.shape === 'vertical' && table.chairs <= 2) ? (
            <span className="absolute bottom-[6px] left-1/2 -translate-x-1/2 rounded bg-[#f4f3ff] px-[5px] py-[3px] text-[10px] font-medium leading-none text-[#5b5ff2] dark:bg-indigo-950 dark:text-indigo-300">
              {table.time}
            </span>
          ) : null}
        </span>
      </button>

      {/* Rotate icon — appears on top of the table when selected, always (edit mode or not).
          Rendered as a sibling outside the main button so it gets its own pointer events
          and doesn't trigger the parent's drag/select handlers. */}
      {selected ? (
        <button
          type="button"
          aria-label="Rotate table"
          onClick={(e) => {
            e.stopPropagation()
            onRotate(table.id)
          }}
          className="absolute -right-3 -top-3 z-10 grid h-7 w-7 place-items-center rounded-full bg-[#6066ed] text-white shadow-[0_4px_12px_rgba(96,102,237,0.5)] hover:bg-[#555beb] transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}
