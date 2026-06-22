import type { TableShape } from './types'
import { cn } from './utils'

type TableChairsProps = {
  shape: TableShape
  chairs: number
}

const C = 'absolute rounded-[5px] bg-white shadow-[0_1px_5px_rgba(30,35,50,0.06)]'

export default function TableChairs({ shape, chairs }: TableChairsProps) {
  if (shape === 'horizontal') {
    // 2 chairs — one on each end, like a small café table turned sideways
    if (chairs <= 2) {
      return (
        <>
          <span className={cn(C, 'left-0 top-[34px] h-[31px] w-4')} />
          <span className={cn(C, 'right-0 top-[34px] h-[31px] w-4')} />
        </>
      )
    }
    // 4 chairs — 2 top, 2 bottom, no end caps
    if (chairs <= 4) {
      return (
        <>
          <span className={cn(C, 'left-[26px] top-0 h-4 w-[29px]')} />
          <span className={cn(C, 'left-[65px] top-0 h-4 w-[29px]')} />
          <span className={cn(C, 'bottom-0 left-[26px] h-4 w-[29px]')} />
          <span className={cn(C, 'bottom-0 left-[65px] h-4 w-[29px]')} />
        </>
      )
    }
    // 8 chairs — 3 top, 3 bottom, 1 each end
    return (
      <>
        <span className={cn(C, 'left-[26px] top-0 h-4 w-[29px]')} />
        <span className={cn(C, 'left-[60px] top-0 h-4 w-[29px]')} />
        <span className={cn(C, 'left-[94px] top-0 h-4 w-[29px]')} />
        <span className={cn(C, 'bottom-0 left-[26px] h-4 w-[29px]')} />
        <span className={cn(C, 'bottom-0 left-[60px] h-4 w-[29px]')} />
        <span className={cn(C, 'bottom-0 left-[94px] h-4 w-[29px]')} />
        <span className={cn(C, 'left-0 top-[34px] h-[31px] w-4')} />
        <span className={cn(C, 'right-0 top-[34px] h-[31px] w-4')} />
      </>
    )
  }

  // vertical
  // 2 chairs — top and bottom only
  if (chairs <= 2) {
    return (
      <>
        <span className={cn(C, 'left-8 top-0 h-4 w-[31px]')} />
        <span className={cn(C, 'bottom-0 left-8 h-4 w-[31px]')} />
      </>
    )
  }
  // 4 chairs — top, bottom, 1 per side
  if (chairs <= 4) {
    return (
      <>
        <span className={cn(C, 'left-8 top-0 h-4 w-[31px]')} />
        <span className={cn(C, 'bottom-0 left-8 h-4 w-[31px]')} />
        <span className={cn(C, 'left-0.5 top-[34px] h-[28px] w-[17px]')} />
        <span className={cn(C, 'right-0.5 top-[34px] h-[28px] w-[17px]')} />
      </>
    )
  }
  // 6 chairs — top, bottom, 2 per side
  return (
    <>
      <span className={cn(C, 'left-8 top-0 h-4 w-[31px]')} />
      <span className={cn(C, 'bottom-0 left-8 h-4 w-[31px]')} />
      <span className={cn(C, 'left-0.5 top-[35px] h-[31px] w-[17px]')} />
      <span className={cn(C, 'left-0.5 top-[70px] h-[31px] w-[17px]')} />
      <span className={cn(C, 'right-0.5 top-[35px] h-[31px] w-[17px]')} />
      <span className={cn(C, 'right-0.5 top-[70px] h-[31px] w-[17px]')} />
    </>
  )
}
