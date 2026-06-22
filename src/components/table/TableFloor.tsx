'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import CanvasControls from './CanvasControls'
import FloorTable from './FloorTable'
import type { TableItem, TableStatus } from './types'
import {
  FLOOR_SIZE,
  TABLE_DIMENSIONS,
  clampCamera,
  clampTablePosition,
  cn,
  getDefaultCamera,
  getOpeningCamera,
} from './utils'

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
  tableId: string | null
  // World-space starting position of the table being dragged (only set when
  // dragging a table in edit mode) - the basis the live drag delta is added to.
  tableStartX: number
  tableStartY: number
  // Kept in sync on every pointermove so pointerup can persist the final
  // position without having to re-derive it from the event.
  lastTableX: number
  lastTableY: number
}

type TableFloorProps = {
  activeFilter: TableStatus | null
  editMode: boolean
  selectedTableId: string | null
  tables: TableItem[]
  onAddTable: (worldX: number, worldY: number) => void
  onClearSelection: () => void
  onMoveTable: (tableId: string, x: number, y: number) => void
  onMoveTableEnd: (tableId: string, x: number, y: number) => void
  onSelectTable: (tableId: string) => void
}

export default function TableFloor({
  activeFilter,
  editMode,
  selectedTableId,
  tables,
  onAddTable,
  onClearSelection,
  onMoveTable,
  onMoveTableEnd,
  onSelectTable,
}: TableFloorProps) {
  const stageRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const userMovedRef = useRef(false)

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 })
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const updateSize = () => {
      const bounds = stage.getBoundingClientRect()
      const nextStageSize = { width: bounds.width, height: bounds.height }

      setStageSize(nextStageSize)
      setCamera((current) => {
        if (!userMovedRef.current) return getDefaultCamera(nextStageSize, tables)
        return clampCamera(current, nextStageSize)
      })
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(stage)

    return () => resizeObserver.disconnect()
    // Deliberately NOT depending on `tables` - this only needs to re-run when
    // the stage's actual DOM size changes. Re-running on every table position
    // update (e.g. during a drag) would re-center the camera mid-drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setClampedCamera = (nextCamera: Camera | ((current: Camera) => Camera)) => {
    setCamera((current) => {
      const resolved = typeof nextCamera === 'function' ? nextCamera(current) : nextCamera
      return clampCamera(resolved, stageSize)
    })
  }

  const zoomAt = (clientX: number, clientY: number, multiplier: number) => {
    const stage = stageRef.current
    if (!stage) return

    const bounds = stage.getBoundingClientRect()
    userMovedRef.current = true
    setClampedCamera((current) => {
      const nextScale = Math.max(0.5, Math.min(1.8, current.scale * multiplier))
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
    const nextCamera = getOpeningCamera(stageSize, tables)

    userMovedRef.current = true
    onClearSelection()
    setCamera(nextCamera)
  }

  const addTableAtCenter = () => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()

    // Convert the screen-space center of the visible canvas into world
    // coordinates, so the new table lands wherever the user is currently
    // looking instead of always appearing at a fixed corner they'd have to
    // pan to find. Offset by half the default (vertical) table footprint so
    // the table is centered on that point, not its top-left corner.
    const defaultDim = TABLE_DIMENSIONS.vertical
    const screenCenterX = bounds.width / 2
    const screenCenterY = bounds.height / 2
    const worldX = (screenCenterX - camera.x) / camera.scale - defaultDim.width / 2
    const worldY = (screenCenterY - camera.y) / camera.scale - defaultDim.height / 2

    const clamped = clampTablePosition(worldX, worldY, 'vertical')
    onAddTable(clamped.x, clamped.y)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.floor-controls')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    const tableElement = target.closest<HTMLButtonElement>('.floor-table')
    const tableId = tableElement ? (tableElement.dataset.id ?? null) : null
    const draggedTable = tableId ? tables.find((t) => t.id === tableId) : undefined

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      cameraX: camera.x,
      cameraY: camera.y,
      moved: false,
      tableId,
      tableStartX: draggedTable?.x ?? 0,
      tableStartY: draggedTable?.y ?? 0,
      lastTableX: draggedTable?.x ?? 0,
      lastTableY: draggedTable?.y ?? 0,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY

    if (Math.hypot(dx, dy) > 4) {
      drag.moved = true
      setIsDragging(true)

      if (editMode && drag.tableId) {
        // Screen-pixel deltas have to be divided by the camera's zoom level
        // to land in the same "world" units the table's x/y live in - the
        // table sits inside a CSS scale(camera.scale) transform, so 10
        // screen-pixels of mouse movement is only 10/scale world-units of
        // actual table movement. Skipping this division is the single most
        // common bug when dragging content inside a zoomable canvas.
        const draggedTable = tables.find((t) => t.id === drag.tableId)
        const worldDx = dx / camera.scale
        const worldDy = dy / camera.scale
        const clamped = clampTablePosition(
          drag.tableStartX + worldDx,
          drag.tableStartY + worldDy,
          draggedTable?.shape ?? 'vertical',
        )

        drag.lastTableX = clamped.x
        drag.lastTableY = clamped.y
        onMoveTable(drag.tableId, clamped.x, clamped.y)
      } else {
        userMovedRef.current = true
        setClampedCamera((current) => ({ ...current, x: drag.cameraX + dx, y: drag.cameraY + dy }))
      }
    }
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDragging(false)

    if (drag.moved && editMode && drag.tableId) {
      onMoveTableEnd(drag.tableId, drag.lastTableX, drag.lastTableY)
    } else if (!drag.moved && drag.tableId) {
      onSelectTable(drag.tableId)
    } else if (!drag.moved) {
      onClearSelection()
    }

    dragRef.current = null
  }

  const handleWheel = (event: ReactWheelEvent<HTMLElement>) => {
    event.preventDefault()
    zoomAt(event.clientX, event.clientY, event.deltaY > 0 ? 0.91 : 1.1)
  }

  return (
    <section
      className={cn(
        'relative min-h-0 flex-1 touch-none select-none overflow-hidden bg-[#f4f5f8]',
        editMode ? 'cursor-default' : 'cursor-grab',
        isDragging && !editMode && 'cursor-grabbing',
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
          width: FLOOR_SIZE.width,
          height: FLOOR_SIZE.height,
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
        }}
        aria-live="polite"
      >
        {tables.map((table) => {
          const muted = activeFilter !== null && activeFilter !== table.status

          return (
            <FloorTable
              key={table.id}
              editMode={editMode}
              muted={muted}
              selected={selectedTableId === table.id}
              table={table}
              x={table.x}
              y={table.y}
            />
          )
        })}
      </div>

      {tables.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <p className="text-sm text-slate-400">
            No tables yet.{' '}
            {editMode
              ? 'Use "Add Table" below to place your first one.'
              : 'Turn on Edit Layout to add one.'}
          </p>
        </div>
      ) : null}

      <CanvasControls
        editMode={editMode}
        onAddTable={addTableAtCenter}
        onFit={scaleToFit}
        onZoomIn={() => zoomFromCenter(1.18)}
        onZoomOut={() => zoomFromCenter(0.84)}
      />
    </section>
  )
}
