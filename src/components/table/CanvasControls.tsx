'use client'

import { useState } from 'react'
import { LocateFixed } from 'lucide-react'
import { cn } from './utils'

type CanvasControlsProps = {
  editMode: boolean
  onAddTable: (chairs: number) => void
  onFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

const CHAIR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function CanvasControls({
  editMode,
  onAddTable,
  onFit,
  onZoomIn,
  onZoomOut,
}: CanvasControlsProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [chairs, setChairs] = useState(4)

  const btnClass =
    'grid h-6 w-6 cursor-pointer place-items-center rounded-sm border-0 bg-white/90 font-sans text-lg font-bold leading-none text-[#6e5df5] shadow-[0_1px_5px_rgba(25,30,45,0.08)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]'

  return (
    <div
      className="floor-controls pointer-events-none absolute bottom-3.5 right-[18px] z-[8] grid justify-items-end gap-2 max-[720px]:bottom-3 max-[720px]:right-3"
      aria-label="Canvas controls"
    >
      {editMode ? (
        <div className="pointer-events-auto relative grid justify-items-end gap-2">
          {pickerOpen ? (
            <div className="mb-1 w-52 rounded-2xl bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.14)] dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Chairs
                </p>
                <span className="rounded-full bg-[#6066ed]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6066ed]">
                  Vertical default
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {CHAIR_OPTIONS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setChairs(count)}
                    className={cn(
                      'h-9 rounded-lg text-xs font-semibold transition',
                      chairs === count
                        ? 'bg-[#6066ed] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddTable(chairs)
                  setPickerOpen(false)
                }}
                className="mt-3 h-9 w-full rounded-xl bg-[#6066ed] text-xs font-semibold text-white hover:bg-[#555beb]"
              >
                Add Table
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className={cn(
              'rounded-full px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(96,102,237,0.28)] transition',
              pickerOpen ? 'bg-[#555beb]' : 'bg-[#6066ed] hover:bg-[#555beb]',
            )}
          >
            {pickerOpen ? 'Close' : 'Add Table'}
          </button>
        </div>
      ) : null}

      <div className="pointer-events-auto grid gap-1.5">
        <button className={btnClass} type="button" aria-label="Zoom in" onClick={onZoomIn}>
          +
        </button>
        <button className={btnClass} type="button" aria-label="Zoom out" onClick={onZoomOut}>
          -
        </button>
      </div>

      <div className="pointer-events-auto inline-flex items-center gap-1.5">
        <span className="text-[9px] font-semibold text-[#171b24] dark:text-slate-300">
          Scale To Fit
        </span>
        <button
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-[#030713] text-white shadow-[0_5px_12px_rgba(2,7,19,0.18)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]"
          type="button"
          aria-label="Scale to fit"
          onClick={onFit}
        >
          <LocateFixed className="h-4 w-4 text-[#8b7cff]" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}
