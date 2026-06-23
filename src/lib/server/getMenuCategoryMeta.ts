import 'server-only'

import { getDishCategories } from '@/lib/dishCategories'

export async function getMenuCategoryMeta() {
  const categories = await getDishCategories()

  return [
    {
      id: 'all',
      label: 'All Menu',
    },
    ...categories.map((c) => ({
      id: c.value,
      label: c.label,
    })),
  ]
}
