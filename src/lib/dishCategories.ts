import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export interface CategoryOption {
  id: string
  label: string
  value: string // slug
  iconUrl?: string // default (gray/dark) state SVG URL
  iconHighlightedUrl?: string // active/highlighted (white) state SVG URL
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
      iconUrl:
        typeof doc.icon === 'object' && doc.icon !== null && doc.icon.url
          ? String(doc.icon.url)
          : undefined,
      iconHighlightedUrl:
        typeof doc.iconHighlighted === 'object' &&
        doc.iconHighlighted !== null &&
        doc.iconHighlighted.url
          ? String(doc.iconHighlighted.url)
          : undefined,
    }))
  } catch (error) {
    console.error('Failed to fetch dish categories:', error)
    return []
  }
}

export function getDishCategoryLabel(value: string, categories: CategoryOption[]): string {
  return categories.find((c) => c.value === value)?.label ?? value
}
