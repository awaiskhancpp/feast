import type { TableItem, TableShape, TableStatus } from './types'

export const TABLE_DIMENSIONS: Record<TableShape, { width: number; height: number }> = {
  vertical: { width: 96, height: 126 },
  horizontal: { width: 148, height: 98 },
}

const FLOOR_PADDING = {
  left: 80,
  right: 80,
  top: 120,
  bottom: 90,
}

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

export function getFloorMetrics(tables: TableItem[]) {
  const bounds = tables.reduce(
    (currentBounds, table) => {
      const dimensions = TABLE_DIMENSIONS[table.shape]

      return {
        minX: Math.min(currentBounds.minX, table.x),
        minY: Math.min(currentBounds.minY, table.y),
        maxX: Math.max(currentBounds.maxX, table.x + dimensions.width),
        maxY: Math.max(currentBounds.maxY, table.y + dimensions.height),
      }
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  )

  const safeBounds = Number.isFinite(bounds.minX)
    ? bounds
    : { minX: 0, minY: 0, maxX: 0, maxY: 0 }

  return {
    minX: safeBounds.minX,
    minY: safeBounds.minY,
    width: safeBounds.maxX - safeBounds.minX + FLOOR_PADDING.left + FLOOR_PADDING.right,
    height: safeBounds.maxY - safeBounds.minY + FLOOR_PADDING.top + FLOOR_PADDING.bottom,
    padding: FLOOR_PADDING,
  }
}

export function getTablePosition(table: TableItem, metrics: ReturnType<typeof getFloorMetrics>) {
  return {
    x: table.x - metrics.minX + metrics.padding.left,
    y: table.y - metrics.minY + metrics.padding.top,
  }
}

export function clampCamera(
  camera: { x: number; y: number; scale: number },
  stageSize: { width: number; height: number },
  floorSize: { width: number; height: number },
) {
  if (stageSize.width === 0 || stageSize.height === 0) return camera

  const scaledWidth = floorSize.width * camera.scale
  const scaledHeight = floorSize.height * camera.scale
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
  floorSize: { width: number; height: number },
) {
  if (stageSize.width === 0 || stageSize.height === 0) {
    return { x: 0, y: 0, scale: 1 }
  }

  const scale = Math.min(
    1,
    Math.max(0.72, Math.min((stageSize.width - 48) / floorSize.width, (stageSize.height - 36) / floorSize.height)),
  )

  return {
    scale,
    x: (stageSize.width - floorSize.width * scale) / 2,
    y: Math.max(8, (stageSize.height - floorSize.height * scale) / 2),
  }
}
