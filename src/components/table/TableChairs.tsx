import type { TableShape } from './types'
import { cn } from './utils'

type TableChairsProps = {
  shape: TableShape
}

export default function TableChairs({ shape }: TableChairsProps) {
  const chairClass = 'absolute rounded-[5px] bg-white shadow-[0_1px_5px_rgba(30,35,50,0.06)]'

  if (shape === 'horizontal') {
    return (
      <>
        <span className={cn(chairClass, 'left-[26px] top-0 h-4 w-[29px]')} />
        <span className={cn(chairClass, 'left-[60px] top-0 h-4 w-[29px]')} />
        <span className={cn(chairClass, 'left-[94px] top-0 h-4 w-[29px]')} />
        <span className={cn(chairClass, 'bottom-0 left-[26px] h-4 w-[29px]')} />
        <span className={cn(chairClass, 'bottom-0 left-[60px] h-4 w-[29px]')} />
        <span className={cn(chairClass, 'bottom-0 left-[94px] h-4 w-[29px]')} />
        <span className={cn(chairClass, 'left-0 top-[34px] h-[31px] w-4')} />
        <span className={cn(chairClass, 'right-0 top-[34px] h-[31px] w-4')} />
      </>
    )
  }

  return (
    <>
      <span className={cn(chairClass, 'left-8 top-0 h-4 w-[31px]')} />
      <span className={cn(chairClass, 'bottom-0 left-8 h-4 w-[31px]')} />
      <span className={cn(chairClass, 'left-0.5 top-[35px] h-[31px] w-[17px]')} />
      <span className={cn(chairClass, 'left-0.5 top-[70px] h-[31px] w-[17px]')} />
      <span className={cn(chairClass, 'right-0.5 top-[35px] h-[31px] w-[17px]')} />
      <span className={cn(chairClass, 'right-0.5 top-[70px] h-[31px] w-[17px]')} />
    </>
  )
}
