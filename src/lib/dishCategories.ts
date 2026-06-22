// Matches the category set OrderMenu already renders icons for. 'all' is a
// client-side filter value only, not a real stored category, so it isn't
// listed here.
export const DISH_CATEGORIES = [
  { label: 'Appetizers', value: 'appetizers' },
  { label: 'Drink', value: 'drink' },
  { label: 'Desserts', value: 'desserts' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Main Courses', value: 'main' },
  { label: 'Salads', value: 'salads' },
  { label: 'Seafood', value: 'seafood' },
  { label: 'Soup', value: 'soup' },
] as const

export type DishCategoryValue = (typeof DISH_CATEGORIES)[number]['value']

export function dishCategoryLabel(value: string) {
  return DISH_CATEGORIES.find((c) => c.value === value)?.label ?? value
}
