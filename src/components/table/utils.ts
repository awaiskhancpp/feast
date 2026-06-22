import type { TableItem, TableShape, TableStatus } from './types'

export type TableSeatRect = {
  left: number
  top: number
  width: number
  height: number
}

export function normalizeChairCount(chairs: number) {
  return Math.min(8, Math.max(1, Math.round(chairs || 1)))
}

export function getTableDimensions(shape: TableShape, chairs: number) {
  const count = normalizeChairCount(chairs)

  if (shape === 'horizontal') {
    return { width: 96 + Math.max(0, count - 2) * 14, height: 98 }
  }

  return { width: 96, height: 76 + Math.max(0, count - 2) * 14 }
}

export function getTableSurfaceBox(shape: TableShape, chairs: number) {
  const count = normalizeChairCount(chairs)
  const dimensions = getTableDimensions(shape, count)

  if (shape === 'horizontal') {
    const width = Math.min(dimensions.width - 24, 68 + Math.max(0, count - 2) * 12)
    const height = Math.min(51, dimensions.height - 24)
    return {
      left: (dimensions.width - width) / 2,
      top: (dimensions.height - height) / 2,
      width,
      height,
    }
  }

  const width = Math.min(52, dimensions.width - 28)
  const height = Math.min(dimensions.height - 20, 36 + Math.max(0, count - 2) * 12)

  return {
    left: (dimensions.width - width) / 2,
    top: (dimensions.height - height) / 2,
    width,
    height,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export function getTableSeatRects(shape: TableShape, chairs: number) {
  const count = normalizeChairCount(chairs)
  const dimensions = getTableDimensions(shape, count)
  const seats: TableSeatRect[] = []

  if (shape === 'horizontal') {
    const sideSeat = { width: 16, height: 31 }
    const edgeSeat = { width: 29, height: 16 }
    const middleY = Math.round((dimensions.height - sideSeat.height) / 2)

    seats.push({ left: 0, top: middleY, ...sideSeat })
    if (count === 1) return seats

    seats.push({ left: dimensions.width - sideSeat.width, top: middleY, ...sideSeat })

    const extraSeats = count - 2
    const topCount = Math.ceil(extraSeats / 2)
    const bottomCount = extraSeats - topCount

    const addRow = (total: number, top: number) => {
      if (total <= 0) return
      const spacing = dimensions.width / (total + 1)
      for (let index = 0; index < total; index += 1) {
        const left = clamp(
          spacing * (index + 1) - edgeSeat.width / 2,
          16,
          dimensions.width - edgeSeat.width - 16,
        )
        seats.push({ left, top, ...edgeSeat })
      }
    }

    addRow(topCount, 0)
    addRow(bottomCount, dimensions.height - edgeSeat.height)
    return seats
  }

  const topSeat = { width: 31, height: 16 }
  const sideSeat = { width: 16, height: 28 }
  const middleX = Math.round((dimensions.width - topSeat.width) / 2)

  seats.push({ left: middleX, top: 0, ...topSeat })
  if (count === 1) return seats

  seats.push({ left: middleX, top: dimensions.height - topSeat.height, ...topSeat })

  const extraSeats = count - 2
  const leftCount = Math.ceil(extraSeats / 2)
  const rightCount = extraSeats - leftCount

  const addColumn = (total: number, left: number) => {
    if (total <= 0) return
    const spacing = dimensions.height / (total + 1)
    for (let index = 0; index < total; index += 1) {
      const top = clamp(
        spacing * (index + 1) - sideSeat.height / 2,
        16,
        dimensions.height - sideSeat.height - 16,
      )
      seats.push({ left, top, ...sideSeat })
    }
  }

  addColumn(leftCount, 0)
  addColumn(rightCount, dimensions.width - sideSeat.width)
  return seats
}

export const FLOOR_SIZE = { width: 2200, height: 1400 }

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function countStatuses(tables: TableItem[]) {
  return tables.reduce<Record<TableStatus, number>>(
    (counts, table) => {
      counts[table.status] += 1
      return counts
    },
    { available: 0, billed: 0, reserved: 0, dine: 0 },
  )
}

export function clampTablePosition(x: number, y: number, shape: TableShape, chairs: number) {
  const dim = getTableDimensions(shape, chairs)
  return {
    x: Math.max(0, Math.min(x, FLOOR_SIZE.width - dim.width)),
    y: Math.max(0, Math.min(y, FLOOR_SIZE.height - dim.height)),
  }
}

function getContentBounds(tables: TableItem[]) {
  if (tables.length === 0) {
    return { minX: 0, minY: 0, maxX: FLOOR_SIZE.width, maxY: FLOOR_SIZE.height }
  }
  return tables.reduce(
    (bounds, table) => {
      const dim = getTableDimensions(table.shape, table.chairs)
      return {
        minX: Math.min(bounds.minX, table.x),
        minY: Math.min(bounds.minY, table.y),
        maxX: Math.max(bounds.maxX, table.x + dim.width),
        maxY: Math.max(bounds.maxY, table.y + dim.height),
      }
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  )
}

export function clampCamera(
  camera: { x: number; y: number; scale: number },
  stageSize: { width: number; height: number },
) {
  if (stageSize.width === 0 || stageSize.height === 0) return camera

  const scaledWidth = FLOOR_SIZE.width * camera.scale
  const scaledHeight = FLOOR_SIZE.height * camera.scale
  const edge = 70
  const minX = Math.min(edge, stageSize.width - scaledWidth - edge)
  const minY = Math.min(edge, stageSize.height - scaledHeight - edge)

  return {
    ...camera,
    x: Math.max(minX, Math.min(edge, camera.x)),
    y: Math.max(minY, Math.min(edge, camera.y)),
  }
}

export function getOpeningCamera(
  stageSize: { width: number; height: number },
  tables: TableItem[],
) {
  if (stageSize.width === 0 || stageSize.height === 0) return { x: 0, y: 0, scale: 1 }

  const bounds = getContentBounds(tables)
  const contentWidth = Math.max(1, bounds.maxX - bounds.minX)
  const contentHeight = Math.max(1, bounds.maxY - bounds.minY)
  const margin = 56

  const scale = Math.min(
    1.4,
    Math.max(
      0.4,
      Math.min(
        (stageSize.width - margin * 2) / contentWidth,
        (stageSize.height - margin * 2) / contentHeight,
      ),
    ),
  )

  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2

  return {
    scale,
    x: stageSize.width / 2 - centerX * scale,
    y: stageSize.height / 2 - centerY * scale,
  }
}

export function getDefaultCamera(
  stageSize: { width: number; height: number },
  tables: TableItem[],
) {
  if (stageSize.width === 0 || stageSize.height === 0) return { x: 0, y: 0, scale: 1 }

  const scale = 0.95
  const bounds = getContentBounds(tables)
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2

  return {
    scale,
    x: stageSize.width / 2 - centerX * scale,
    y: stageSize.height / 2 - centerY * scale,
  }
}
