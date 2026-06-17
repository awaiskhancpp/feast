import { LocateFixed } from 'lucide-react'

type CanvasControlsProps = {
  onFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export default function CanvasControls({ onFit, onZoomIn, onZoomOut }: CanvasControlsProps) {
  const buttonClass =
    'grid h-6 w-6 cursor-pointer place-items-center rounded-sm border-0 bg-white/90 font-sans text-lg font-bold leading-none text-[#6e5df5] shadow-[0_1px_5px_rgba(25,30,45,0.08)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]'

  return (
    <div
      className="floor-controls pointer-events-none absolute bottom-3.5 right-[18px] z-[8] grid justify-items-end gap-2 max-[720px]:bottom-3 max-[720px]:right-3"
      aria-label="Canvas controls"
    >
      <div className="pointer-events-auto grid gap-1.5">
        <button className={buttonClass} type="button" aria-label="Zoom in" onClick={onZoomIn}>
          +
        </button>
        <button className={buttonClass} type="button" aria-label="Zoom out" onClick={onZoomOut}>
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
