import type { TableItem, TableShape, TableStatus } from './types'

export const TABLE_DIMENSIONS: Record<TableShape, { width: number; height: number }> = {
  vertical: { width: 96, height: 126 },
  horizontal: { width: 148, height: 98 },
}

// Fixed virtual canvas, in world units. Table x/y are absolute coordinates
// inside this space - they are NOT derived from the current set of tables.
//
// The previous version computed a bounding box from every table's position
// and rendered each table relative to that box's origin. That's fine for a
// static, read-only floor plan, but it breaks the moment tables become
// draggable: dragging one table past the existing min/max edge shifts the
// box, which silently repositions every *other* table on screen too (they're
// all measured relative to the same shifting origin). A fixed coordinate
// frame guarantees moving one table can never move any other table.
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

// Keeps a table's drop position fully on the fixed canvas, accounting for
// its own footprint so it can't be dragged so far that part of it renders
// outside the floor entirely.
export function clampTablePosition(x: number, y: number, shape: TableShape) {
  const dim = TABLE_DIMENSIONS[shape]
  return {
    x: Math.max(0, Math.min(x, FLOOR_SIZE.width - dim.width)),
    y: Math.max(0, Math.min(y, FLOOR_SIZE.height - dim.height)),
  }
}

// Bounding box of the *current* tables - used only to frame the camera
// (initial view + "Scale to Fit"), never to position the tables themselves.
function getContentBounds(tables: TableItem[]) {
  if (tables.length === 0) {
    return { minX: 0, minY: 0, maxX: FLOOR_SIZE.width, maxY: FLOOR_SIZE.height }
  }

  return tables.reduce(
    (bounds, table) => {
      const dim = TABLE_DIMENSIONS[table.shape]
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

// "Scale to Fit" - frames exactly the current tables' bounding box. This is
// the one place it's still correct to shrink-to-fit everything, since it's
// an explicit, opt-in action rather than the default view.
export function getOpeningCamera(
  stageSize: { width: number; height: number },
  tables: TableItem[],
) {
  if (stageSize.width === 0 || stageSize.height === 0) {
    return { x: 0, y: 0, scale: 1 }
  }

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

// Default view on first mount: a fixed, realistic scale (not shrunk to fit
// everything), centered on wherever the current tables actually are. This is
// the direct fix for "the canvas is too big, all tables are seen at once" -
// panning is required to see tables further from center, the way walking
// into a real restaurant doesn't show you every table from the host stand.
export function getDefaultCamera(
  stageSize: { width: number; height: number },
  tables: TableItem[],
) {
  if (stageSize.width === 0 || stageSize.height === 0) {
    return { x: 0, y: 0, scale: 1 }
  }

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
