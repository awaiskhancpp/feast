'use server'

import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@/payload.config'
import type { TableItem, TableShape, TableStatus } from '@/components/table/types'

async function getNextTableNumber(payload: Awaited<ReturnType<typeof getPayload>>) {
  const existing = await payload.find({
    collection: 'tables',
    limit: 0, // count only, we just need totalDocs-style scanning below
    sort: '-tableNumber',
  })

  const numericLabels = existing.docs
    .map((doc) => parseInt(doc.tableNumber, 10))
    .filter((n) => !Number.isNaN(n))

  const next = numericLabels.length ? Math.max(...numericLabels) + 1 : 1
  return String(next)
}

export async function createTable(
  x: number,
  y: number,
  shape: TableShape,
  chairs: number, // ← add this param
): Promise<{ table?: TableItem; error?: string }> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const tableNumber = await getNextTableNumber(payload)
    const doc = await payload.create({
      collection: 'tables',
      data: { tableNumber, x, y, shape, chairs, status: 'available' }, // ← add chairs
    })

    revalidatePath('/table')
    return {
      table: {
        id: String(doc.id),
        tableNumber: doc.tableNumber,
        x: doc.x,
        y: doc.y,
        shape: doc.shape as TableShape,
        chairs: doc.chairs, // ← add this line
        status: doc.status as TableStatus,
      },
    }
  } catch {
    return { error: 'Could not create the table.' }
  }
}

export async function updateTablePosition(
  tableId: string,
  x: number,
  y: number,
): Promise<{ error?: string }> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    await payload.update({ collection: 'tables', id: tableId, data: { x, y } })
  } catch {
    return { error: 'Could not save the table position.' }
  }

  revalidatePath('/table')
  return {}
}

export async function updateTableStatus(
  tableId: string,
  status: TableStatus,
  time?: string,
): Promise<{ error?: string }> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    await payload.update({
      collection: 'tables',
      id: tableId,
      data: { status, time: time ?? null },
    })
  } catch {
    return { error: 'Could not update the table status.' }
  }

  revalidatePath('/table')
  return {}
}

export async function deleteTable(tableId: string): Promise<{ error?: string }> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    await payload.delete({ collection: 'tables', id: tableId })
  } catch {
    return { error: 'Could not delete the table.' }
  }

  revalidatePath('/table')
  return {}
}
