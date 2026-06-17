'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'
import CanvasControls from './CanvasControls'
import FloorTable from './FloorTable'
import type { TableItem, TableStatus } from './types'
import { clampCamera, cn, getFloorMetrics, getOpeningCamera, getTablePosition } from './utils'

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

type TableFloorProps = {
  activeFilter: TableStatus | null
  selectedTableId: number | null
  tables: TableItem[]
  onClearSelection: () => void
  onSelectTable: (tableId: number) => void
}

export default function TableFloor({
  activeFilter,
  selectedTableId,
  tables,
  onClearSelection,
  onSelectTable,
}: TableFloorProps) {
  const stageRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const userMovedRef = useRef(false)

  const floorMetrics = useMemo(() => getFloorMetrics(tables), [tables])
  const floorSize = useMemo(
    () => ({ width: floorMetrics.width, height: floorMetrics.height }),
    [floorMetrics.height, floorMetrics.width],
  )

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
        if (!userMovedRef.current) return getOpeningCamera(nextStageSize, floorSize)
        return clampCamera(current, nextStageSize, floorSize)
      })
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(stage)

    return () => resizeObserver.disconnect()
  }, [floorSize])

  const setClampedCamera = (nextCamera: Camera | ((current: Camera) => Camera)) => {
    setCamera((current) => {
      const resolved = typeof nextCamera === 'function' ? nextCamera(current) : nextCamera
      return clampCamera(resolved, stageSize, floorSize)
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
    const nextCamera = getOpeningCamera(stageSize, floorSize)

    userMovedRef.current = true
    onClearSelection()
    setCamera(nextCamera)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.floor-controls')) return

    event.currentTarget.setPointerCapture(event.pointerId)
    const tableElement = target.closest<HTMLButtonElement>('.floor-table')

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

    if (Math.hypot(dx, dy) > 4) {
      drag.moved = true
      userMovedRef.current = true
      setIsDragging(true)
      setClampedCamera((current) => ({ ...current, x: drag.cameraX + dx, y: drag.cameraY + dy }))
    }
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDragging(false)

    if (!drag.moved && drag.tableId) {
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
          width: floorSize.width,
          height: floorSize.height,
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
        }}
        aria-live="polite"
      >
        {tables.map((table) => {
          const position = getTablePosition(table, floorMetrics)
          const muted = activeFilter !== null && activeFilter !== table.status

          return (
            <FloorTable
              key={table.id}
              muted={muted}
              selected={selectedTableId === table.id}
              table={table}
              x={position.x}
              y={position.y}
            />
          )
        })}
      </div>

      <CanvasControls
        onFit={scaleToFit}
        onZoomIn={() => zoomFromCenter(1.18)}
        onZoomOut={() => zoomFromCenter(0.84)}
      />
    </section>
  )
}
