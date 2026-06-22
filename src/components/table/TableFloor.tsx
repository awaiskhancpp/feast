'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import CanvasControls from './CanvasControls'
import FloorTable from './FloorTable'
import type { TableItem, TableShape, TableStatus } from './types'
import {
  FLOOR_SIZE,
  clampCamera,
  clampTablePosition,
  cn,
  getDefaultCamera,
  getOpeningCamera,
  getTableDimensions,
} from './utils'

type Camera = { x: number; y: number; scale: number }
type Size = { width: number; height: number }

type DragState = {
  pointerId: number
  startX: number
  startY: number
  cameraX: number
  cameraY: number
  moved: boolean
  tableId: string | null
  tableStartX: number
  tableStartY: number
  lastTableX: number
  lastTableY: number
}

type TableFloorProps = {
  activeFilter: TableStatus | null
  editMode: boolean
  selectedTableId: string | null
  tables: TableItem[]
  onAddTable: (worldX: number, worldY: number, shape: TableShape, chairs: number) => void
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setClampedCamera = (next: Camera | ((c: Camera) => Camera)) => {
    setCamera((current) => {
      const resolved = typeof next === 'function' ? next(current) : next
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
      const px = clientX - bounds.left
      const py = clientY - bounds.top
      const wx = (px - current.x) / current.scale
      const wy = (py - current.y) / current.scale
      return { scale: nextScale, x: px - wx * nextScale, y: py - wy * nextScale }
    })
  }

  const zoomFromCenter = (multiplier: number) => {
    const stage = stageRef.current
    if (!stage) return
    const b = stage.getBoundingClientRect()
    zoomAt(b.left + b.width / 2, b.top + b.height / 2, multiplier)
  }

  const scaleToFit = () => {
    userMovedRef.current = true
    onClearSelection()
    setCamera(getOpeningCamera(stageSize, tables))
  }

  // Called by CanvasControls after the user picks chairs. Tables now start
  // vertical by default; rotation lives in the table edit modal.
  const addTableAtCenter = (chairs: number) => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    const dim = getTableDimensions('vertical', chairs)
    const worldX = (bounds.width / 2 - camera.x) / camera.scale - dim.width / 2
    const worldY = (bounds.height / 2 - camera.y) / camera.scale - dim.height / 2
    const clamped = clampTablePosition(worldX, worldY, 'vertical', chairs)
    onAddTable(clamped.x, clamped.y, 'vertical', chairs)
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
        const draggedTable = tables.find((t) => t.id === drag.tableId)
        const clamped = clampTablePosition(
          drag.tableStartX + dx / camera.scale,
          drag.tableStartY + dy / camera.scale,
          draggedTable?.shape ?? 'vertical',
          draggedTable?.chairs ?? 6,
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
        {tables.map((table) => (
          <FloorTable
            key={table.id}
            editMode={editMode}
            muted={activeFilter !== null && activeFilter !== table.status}
            selected={selectedTableId === table.id}
            table={table}
            x={table.x}
            y={table.y}
          />
        ))}
      </div>

      {tables.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <p className="text-sm text-slate-400">
            {editMode
              ? 'Click "+ Add Table" to place your first table.'
              : 'Turn on Edit Layout to add tables.'}
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
