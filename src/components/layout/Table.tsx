'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
} from 'react'

type TableStatus = 'available' | 'billed' | 'reserved' | 'dine'
type TableShape = 'vertical' | 'horizontal'

type TableItem = {
  id: number
  x: number
  y: number
  shape: TableShape
  status: TableStatus
  time?: string
}

type Camera = {
  x: number
  y: number
  scale: number
}

type Size = {
  width: number
  height: number
}

type DragState = {
  pointerId: number
  startX: number
  startY: number
  cameraX: number
  cameraY: number
  moved: boolean
  tableId: number | null
}

const MAP_SIZE: Size = { width: 1880, height: 1260 }

const STATUS_META: Record<
  TableStatus,
  {
    label: string
    color: string
    short: string
    dotClass: string
    badgeClass: string
  }
> = {
  available: {
    label: 'Available',
    color: '#5b5ff2',
    short: 'Avail',
    dotClass: 'bg-[#5b5ff2]',
    badgeClass: 'bg-[#5b5ff2] text-white',
  },
  billed: {
    label: 'Billed',
    color: '#07c85f',
    short: 'Bill',
    dotClass: 'bg-[#07c85f]',
    badgeClass: 'bg-[#07c85f] text-white',
  },
  reserved: {
    label: 'Reserved',
    color: '#f0b83f',
    short: 'Res',
    dotClass: 'bg-[#f0b83f]',
    badgeClass: 'bg-[#f0b83f] text-white',
  },
  dine: {
    label: 'Dine in',
    color: '#f4f5f9',
    short: 'Dine',
    dotClass: 'bg-[#f4f5f9] ring-1 ring-slate-200/70',
    badgeClass: 'bg-[#f4f5f9] text-[#858b96]',
  },
}

const STATUS_ORDER: TableStatus[] = ['available', 'billed', 'reserved', 'dine']

const MANUAL_TABLES: TableItem[] = [
  { id: 24, x: 4, y: 38, shape: 'horizontal', status: 'available' },
  { id: 25, x: 352, y: -70, shape: 'vertical', status: 'available' },
  { id: 26, x: 130, y: 130, shape: 'vertical', status: 'dine', time: '03:22' },
  { id: 27, x: 212, y: 30, shape: 'vertical', status: 'reserved' },
  { id: 28, x: 336, y: 92, shape: 'vertical', status: 'dine' },
  { id: 29, x: 486, y: 92, shape: 'vertical', status: 'reserved' },
  { id: 30, x: 610, y: 32, shape: 'vertical', status: 'reserved' },
  { id: 31, x: 734, y: 92, shape: 'vertical', status: 'reserved' },
  { id: 32, x: 940, y: 38, shape: 'horizontal', status: 'billed' },
  { id: 33, x: -28, y: 222, shape: 'horizontal', status: 'dine', time: '03:22' },
  { id: 34, x: 240, y: 290, shape: 'vertical', status: 'billed' },
  { id: 35, x: 386, y: 222, shape: 'horizontal', status: 'dine', time: '03:22' },
]

export default function RestaurantTableCanvas() {
  const stageRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const userMovedRef = useRef(false)

  const [tables, setTables] = useState<TableItem[]>(() => createInitialTables())
  const [camera, setCamera] = useState<Camera>({ x: -72, y: -44, scale: 1 })
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 })
  const [activeFilter, setActiveFilter] = useState<TableStatus | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedId) ?? null,
    [selectedId, tables],
  )

  const counts = useMemo(() => countStatuses(tables), [tables])

  const menuPosition = useMemo(() => {
    if (!selectedTable || stageSize.width === 0) return null

    const tableWidth = selectedTable.shape === 'horizontal' ? 148 : 96
    const centerX = camera.x + (selectedTable.x + tableWidth / 2) * camera.scale
    const topY = camera.y + selectedTable.y * camera.scale
    const menuHalf = Math.min(130, (stageSize.width - 28) / 2)
    const safeX = Math.max(menuHalf + 8, Math.min(stageSize.width - menuHalf - 8, centerX))
    const safeY = Math.max(84, topY)

    return { left: safeX, top: safeY }
  }, [camera, selectedTable, stageSize.width])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const updateSize = () => {
      const bounds = stage.getBoundingClientRect()
      const nextSize = { width: bounds.width, height: bounds.height }
      setStageSize(nextSize)
      setCamera((current) => {
        if (!userMovedRef.current) return openingCamera(nextSize)
        return clampCamera(current, nextSize)
      })
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(stage)

    return () => resizeObserver.disconnect()
  }, [])

  const setClampedCamera = (nextCamera: Camera | ((current: Camera) => Camera)) => {
    setCamera((current) => {
      const resolved = typeof nextCamera === 'function' ? nextCamera(current) : nextCamera
      return clampCamera(resolved, stageSize)
    })
  }

  const closeMenu = () => {
    setSelectedId(null)
  }

  const updateTableStatus = (status: TableStatus) => {
    if (!selectedTable) return

    setTables((currentTables) =>
      currentTables.map((table) =>
        table.id === selectedTable.id
          ? { ...table, status, time: status === 'dine' ? table.time || '03:22' : undefined }
          : table,
      ),
    )
  }

  const zoomAt = (clientX: number, clientY: number, multiplier: number) => {
    const stage = stageRef.current
    if (!stage) return

    const bounds = stage.getBoundingClientRect()
    userMovedRef.current = true
    setClampedCamera((current) => {
      const nextScale = Math.max(0.35, Math.min(1.85, current.scale * multiplier))
      const pointerX = clientX - bounds.left
      const pointerY = clientY - bounds.top
      const worldX = (pointerX - current.x) / current.scale
      const worldY = (pointerY - current.y) / current.scale

      return {
        scale: nextScale,
        x: pointerX - worldX * nextScale,
        y: pointerY - worldY * nextScale,
      }
    })
  }

  const zoomFromCenter = (multiplier: number) => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    zoomAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, multiplier)
  }

  const scaleToFit = () => {
    const stage = stageRef.current
    if (!stage) return

    const bounds = stage.getBoundingClientRect()
    const padding = bounds.width < 700 ? 22 : 42
    const rawScale = Math.min(
      (bounds.width - padding * 2) / MAP_SIZE.width,
      (bounds.height - padding * 2) / MAP_SIZE.height,
      1,
    )
    const scale = Math.max(0.35, rawScale)

    userMovedRef.current = true
    closeMenu()
    setCamera({
      scale,
      x: (bounds.width - MAP_SIZE.width * scale) / 2,
      y: (bounds.height - MAP_SIZE.height * scale) / 2,
    })
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.rtc-controls') || target.closest('.rtc-table-menu')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    const tableElement = target.closest<HTMLButtonElement>('.rtc-table')

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cameraX: camera.x,
      cameraY: camera.y,
      moved: false,
      tableId: tableElement ? Number(tableElement.dataset.id) : null,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    const moved = Math.hypot(dx, dy) > 4

    if (moved) {
      drag.moved = true
      userMovedRef.current = true
      setIsDragging(true)
      if (selectedId !== null) closeMenu()
      setClampedCamera((current) => ({ ...current, x: drag.cameraX + dx, y: drag.cameraY + dy }))
    }
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDragging(false)

    if (!drag.moved && drag.tableId) {
      setSelectedId(drag.tableId)
    } else if (!drag.moved) {
      closeMenu()
    }

    dragRef.current = null
  }

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault()
    zoomAt(event.clientX, event.clientY, event.deltaY > 0 ? 0.91 : 1.1)
  }

  return (
    <main className="flex h-[100dvh] min-h-[520px] flex-col overflow-hidden bg-[#f4f5f8] font-sans text-[#555b66] antialiased max-[720px]:min-h-[480px]">
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
              onClick={() => setActiveFilter(active ? null : status)}
            >
              <span className={cn('h-[11px] w-[11px] flex-none rounded-full', meta.dotClass)} />
              <span>
                {meta.label} : {counts[status]}
              </span>
            </button>
          )
        })}
      </nav>

      <section
        className={cn(
          'relative min-h-0 flex-1 touch-none select-none overflow-hidden bg-[#f4f5f8] cursor-grab',
          isDragging && 'cursor-grabbing',
        )}
        ref={stageRef}
        aria-label="Draggable restaurant table canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setIsDragging(false)
          dragRef.current = null
        }}
        onWheel={handleWheel}
      >
        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{
            width: MAP_SIZE.width,
            height: MAP_SIZE.height,
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
          }}
          aria-live="polite"
        >
          {tables.map((table) => {
            const meta = STATUS_META[table.status]
            const muted = activeFilter !== null && activeFilter !== table.status
            const selected = selectedId === table.id

            return (
              <button
                className={cn(
                  'rtc-table absolute cursor-pointer border-0 bg-transparent p-0 opacity-100 transition-opacity duration-150 ease-out',
                  table.shape === 'horizontal' ? 'h-[98px] w-[148px]' : 'h-[126px] w-24',
                  muted && 'opacity-[0.18]',
                )}
                type="button"
                key={table.id}
                data-id={table.id}
                style={{ left: table.x, top: table.y }}
                aria-label={`Table ${table.id}, ${meta.label}`}
              >
                <Chairs shape={table.shape} />
                <span
                  className={cn(
                    'absolute rounded-[7px] bg-white shadow-[0_1px_5px_rgba(30,35,50,0.06)]',
                    table.shape === 'horizontal'
                      ? 'left-[27px] top-6 h-[51px] w-[94px]'
                      : 'left-[22px] top-[21px] h-[84px] w-[52px]',
                    selected &&
                      'shadow-[0_0_0_2px_rgba(91,95,242,0.26),0_10px_20px_rgba(91,95,242,0.12)]',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1/2 grid h-[35px] w-[35px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-bold tracking-normal shadow-[0_1px_0_rgba(0,0,0,0.02)]',
                      table.shape === 'horizontal' ? 'left-[48px]' : 'left-1/2',
                      meta.badgeClass,
                    )}
                  >
                    T-{table.id}
                  </span>
                  {table.time ? (
                    <span
                      className={cn(
                        'absolute rounded bg-[#f4f3ff] px-[5px] py-[3px] text-[10px] font-medium leading-none text-[#5b5ff2]',
                        table.shape === 'horizontal'
                          ? 'left-1/2 top-[58px] -translate-x-1/2'
                          : 'bottom-[15px] left-1/2 -translate-x-1/2',
                      )}
                    >
                      {table.time}
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>

        {selectedTable && menuPosition ? (
          <div
            className="rtc-table-menu absolute z-20 w-[min(260px,calc(100vw-28px))] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-lg bg-white/95 p-2.5 shadow-[0_12px_30px_rgba(24,29,42,0.14)] max-[720px]:p-[9px]"
            role="dialog"
            aria-label="Table actions"
            style={{ left: menuPosition.left, top: menuPosition.top }}
          >
            <div className="mb-[9px] flex items-center justify-between gap-2.5 text-xs font-bold text-[#242a35]">
              <span>T-{selectedTable.id}</span>
              <span className="font-semibold text-[#7a818d]">
                {STATUS_META[selectedTable.status].label}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {STATUS_ORDER.map((status) => {
                const meta = STATUS_META[status]
                const active = status === selectedTable.status

                return (
                  <button
                    className={cn(
                      'h-8 min-w-0 cursor-pointer rounded-md border border-[rgba(121,128,145,0.18)] bg-white text-[10px] font-bold leading-none text-[#565d68] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]',
                      active && 'text-[#1e2430]',
                    )}
                    type="button"
                    key={status}
                    style={
                      active
                        ? ({
                            borderColor: meta.color,
                            boxShadow: `inset 0 0 0 1px ${meta.color}`,
                          } as CSSProperties)
                        : undefined
                    }
                    onClick={() => updateTableStatus(status)}
                  >
                    {meta.short}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div
          className="rtc-controls pointer-events-none absolute bottom-3.5 right-[18px] z-[8] grid justify-items-end gap-2 max-[720px]:bottom-3 max-[720px]:right-3"
          aria-label="Canvas controls"
        >
          <div className="pointer-events-auto grid gap-1.5">
            <button
              className="grid h-6 w-6 cursor-pointer place-items-center rounded-sm border-0 bg-white/90 font-sans text-lg font-bold leading-none text-[#6e5df5] shadow-[0_1px_5px_rgba(25,30,45,0.08)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]"
              type="button"
              aria-label="Zoom in"
              onClick={() => zoomFromCenter(1.18)}
            >
              +
            </button>
            <button
              className="grid h-6 w-6 cursor-pointer place-items-center rounded-sm border-0 bg-white/90 font-sans text-lg font-bold leading-none text-[#6e5df5] shadow-[0_1px_5px_rgba(25,30,45,0.08)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]"
              type="button"
              aria-label="Zoom out"
              onClick={() => zoomFromCenter(0.84)}
            >
              -
            </button>
          </div>

          <div className="pointer-events-auto inline-flex items-center gap-1.5">
            <span className="text-[9px] font-semibold text-[#171b24]">Scale To Fit</span>
            <button
              className="relative h-7 w-7 cursor-pointer rounded-full border-0 bg-[#030713] shadow-[0_5px_12px_rgba(2,7,19,0.18)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#5b5ff273]"
              type="button"
              aria-label="Scale to fit"
              onClick={scaleToFit}
            >
              <span className="absolute inset-2 rounded-full border border-white" />
              <span className="absolute inset-3 rounded-full border border-[#7d6cff] bg-[#7d6cff]" />
              <span className="absolute inset-1.5" aria-hidden="true">
                <span className="absolute bottom-0 left-1/2 top-0 w-px bg-white/70" />
                <span className="absolute left-0 right-0 top-1/2 h-px bg-white/70" />
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function Chairs({ shape }: { shape: TableShape }) {
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

function createInitialTables() {
  return MANUAL_TABLES.map((table) => ({ ...table }))
}

function countStatuses(tables: TableItem[]) {
  return tables.reduce<Record<TableStatus, number>>(
    (counts, table) => {
      counts[table.status] += 1
      return counts
    },
    { available: 0, billed: 0, reserved: 0, dine: 0 },
  )
}

function openingCamera(stageSize: Size): Camera {
  const desktopScale = Math.min(1, Math.max(0.72, stageSize.width / 900))
  const compact = stageSize.width < 560

  return {
    x: compact ? 4 : -72,
    y: compact ? -8 : -44,
    scale: desktopScale,
  }
}

function clampCamera(camera: Camera, stageSize: Size): Camera {
  if (stageSize.width === 0 || stageSize.height === 0) return camera

  const scaledWidth = MAP_SIZE.width * camera.scale
  const scaledHeight = MAP_SIZE.height * camera.scale
  const edge = 90
  const minX = Math.min(edge, stageSize.width - scaledWidth - edge)
  const minY = Math.min(edge, stageSize.height - scaledHeight - edge)

  return {
    ...camera,
    x: Math.max(minX, Math.min(edge, camera.x)),
    y: Math.max(minY, Math.min(edge, camera.y)),
  }
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
