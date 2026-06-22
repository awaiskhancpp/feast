import type { TableItem, TableShape, TableStatus } from './types'

// Returns the bounding-box size for a table given its orientation and chair
// count. Every other measurement in the codebase derives from this — chairs,
// surface position in FloorTable, canvas clamping — so there's one place to
// change if the visual design changes.
export function getTableDimensions(shape: TableShape, chairs: number) {
  if (shape === 'horizontal') {
    if (chairs <= 2) return { width: 100, height: 98 }
    if (chairs <= 4) return { width: 120, height: 98 }
    return { width: 148, height: 98 } // 8 chairs
  }
  // vertical
  if (chairs <= 2) return { width: 96, height: 76 }
  if (chairs <= 4) return { width: 96, height: 100 }
  return { width: 96, height: 126 } // 6 chairs
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
