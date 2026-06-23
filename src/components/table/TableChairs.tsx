import type { TableShape } from './types'
import { cn, getTableSeatRects } from './utils'

type TableChairsProps = {
  shape: TableShape
  chairs: number
}

const CHAIR_CLASS =
  'absolute rounded-[5px] bg-white shadow-[0_1px_5px_rgba(30,35,50,0.06)] dark:bg-slate-700 dark:shadow-none'

export default function TableChairs({ shape, chairs }: TableChairsProps) {
  const seatRects = getTableSeatRects(shape, chairs)

  return (
    <>
      {seatRects.map((seat, index) => (
        <span
          key={`${shape}-${chairs}-${index}`}
          className={cn(CHAIR_CLASS)}
          style={{
            left: seat.left,
            top: seat.top,
            width: seat.width,
            height: seat.height,
          }}
        />
      ))}
    </>
  )
}
