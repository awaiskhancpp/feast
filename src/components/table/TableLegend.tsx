import { STATUS_META, STATUS_ORDER } from './tableData'
import type { TableStatus } from './types'
import { cn } from './utils'

type TableLegendProps = {
  activeFilter: TableStatus | null
  counts: Record<TableStatus, number>
  onFilterChange: (status: TableStatus) => void
}

export default function TableLegend({ activeFilter, counts, onFilterChange }: TableLegendProps) {
  return (
    <nav
      className="relative z-10 flex min-h-14 items-center gap-[22px] overflow-x-auto whitespace-nowrap bg-white px-[18px] py-2.5 shadow-[0_1px_0_rgba(20,25,35,0.08)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[720px]:min-h-[50px] max-[720px]:gap-4 max-[720px]:px-3.5"
      aria-label="Table status filters"
    >
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status]
        const active = activeFilter === status

        return (
          <button
            className={cn(
              'inline-flex min-w-max cursor-pointer items-center gap-[7px] rounded-full border-0 bg-transparent py-1 text-xs font-medium leading-tight text-[#555b66] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273] max-[720px]:text-[11px]',
              active && 'text-[#1f2530]',
            )}
            type="button"
            key={status}
            aria-pressed={active}
            onClick={() => onFilterChange(status)}
          >
            <span className={cn('h-[11px] w-[11px] flex-none rounded-full', meta.dotClass)} />
            <span>
              {meta.label} : {counts[status]}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
