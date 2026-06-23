import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@/payload.config'
import { getDishCategories } from '@/lib/dishCategories'
import DishesListPage, { type DishRow } from '@/components/layout/Dishes'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

interface DishesPageProps {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>
}

export default async function Dishes({ searchParams }: DishesPageProps) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const category = params.category ?? 'all'
  const page = Math.max(1, Number(params.page) || 1)

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [categories] = await Promise.all([getDishCategories()])

  const filters: Where[] = []
  if (query) filters.push({ name: { contains: query } })
  if (category !== 'all') filters.push({ 'category.slug': { equals: category } })

  const result = await payload.find({
    collection: 'dishes',
    where: filters.length ? { and: filters } : undefined,
    sort: 'name',
    page,
    limit: PAGE_SIZE,
    depth: 1,
  })

  const dishes: DishRow[] = result.docs.map((doc) => ({
    id: String(doc.id),
    name: doc.name,
    category:
      typeof doc.category === 'object' && doc.category !== null
        ? String((doc.category as { id: number }).id)
        : String(doc.category ?? ''),
    price: doc.price,
    description: doc.description,
    inStock: doc.inStock ?? true,
    imageUrl: typeof doc.image === 'object' && doc.image?.url ? doc.image.url : undefined,
  }))

  return (
    <DishesListPage
      dishes={dishes}
      categories={categories} // ← was missing
      currentPage={result.page ?? 1}
      totalPages={result.totalPages || 1}
      query={query}
      category={category}
    />
  )
}
