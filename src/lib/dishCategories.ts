import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Media } from '@/payload-types'

export interface CategoryOption {
  id: string
  label: string
  value: string
  icon?: number | Media
}

export async function getDishCategories(): Promise<CategoryOption[]> {
  try {
    const payloadConfig = await configPromise
    const payload = await getPayload({ config: payloadConfig })

    const result = await payload.find({
      collection: 'dish-categories',
      pagination: false,
      depth: 1,
    })

    return result.docs.map((doc: any) => ({
      id: String(doc.id),
      label: doc.name,
      value: doc.slug,
      icon: doc.icon ?? undefined,
    }))
  } catch (error) {
    console.error('Failed to fetch dish categories:', error)
    return []
  }
}

export function getDishCategoryLabel(value: string, categories: CategoryOption[]): string {
  return categories.find((c) => c.value === value)?.label ?? value
}
