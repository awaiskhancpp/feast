'use client'

import { useState } from 'react'
import { LocateFixed } from 'lucide-react'
import type { TableShape } from './types'
import { cn } from './utils'

type CanvasControlsProps = {
  editMode: boolean
  onAddTable: (shape: TableShape, chairs: number) => void
  onFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

const VERTICAL_CHAIR_OPTIONS = [2, 4, 6]
const HORIZONTAL_CHAIR_OPTIONS = [2, 4, 8]

export default function CanvasControls({
  editMode,
  onAddTable,
  onFit,
  onZoomIn,
  onZoomOut,
}: CanvasControlsProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [shape, setShape] = useState<TableShape>('vertical')
  const [chairs, setChairs] = useState(6)

  const btnClass =
    'grid h-6 w-6 cursor-pointer place-items-center rounded-sm border-0 bg-white/90 font-sans text-lg font-bold leading-none text-[#6e5df5] shadow-[0_1px_5px_rgba(25,30,45,0.08)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]'

  function selectShape(next: TableShape) {
    setShape(next)
    // Reset chairs to the default for that orientation so it's never in an
    // impossible state (e.g. "6 chairs" while horizontal is selected).
    setChairs(next === 'horizontal' ? 8 : 6)
  }

  const chairOptions = shape === 'horizontal' ? HORIZONTAL_CHAIR_OPTIONS : VERTICAL_CHAIR_OPTIONS

  return (
    <div
      className="floor-controls pointer-events-none absolute bottom-3.5 right-[18px] z-[8] grid justify-items-end gap-2 max-[720px]:bottom-3 max-[720px]:right-3"
      aria-label="Canvas controls"
    >
      {editMode ? (
        <div className="pointer-events-auto relative grid justify-items-end gap-2">
          {/* Shape + chairs picker popover */}
          {pickerOpen ? (
            <div className="mb-1 w-44 rounded-2xl bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Shape
              </p>
              <div className="mb-3 grid grid-cols-2 gap-1">
                {(['vertical', 'horizontal'] as TableShape[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectShape(s)}
                    className={cn(
                      'h-8 rounded-lg text-xs font-semibold capitalize transition',
                      shape === s
                        ? 'bg-[#6066ed] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Chairs
              </p>
              <div className="mb-3 flex gap-1">
                {chairOptions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setChairs(n)}
                    className={cn(
                      'h-8 flex-1 rounded-lg text-xs font-semibold transition',
                      chairs === n
                        ? 'bg-[#6066ed] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddTable(shape, chairs)
                  setPickerOpen(false)
                }}
                className="h-9 w-full rounded-xl bg-[#6066ed] text-xs font-semibold text-white hover:bg-[#555beb]"
              >
                Place Table
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(96,102,237,0.28)] transition',
              pickerOpen ? 'bg-[#555beb]' : 'bg-[#6066ed] hover:bg-[#555beb]',
            )}
          >
            {pickerOpen ? '✕ Cancel' : '+ Add Table'}
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
        <span className="text-[9px] font-semibold text-[#171b24]">Scale To Fit</span>
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
