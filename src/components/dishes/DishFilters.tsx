'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { DISH_CATEGORIES } from '@/lib/dishCategories'

interface DishFiltersProps {
  initialQuery: string
  initialCategory: string
}

export function DishFilters({ initialQuery, initialCategory }: DishFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [, startTransition] = useTransition()

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) params.set('q', query)
      else params.delete('q')
      params.delete('page')
      startTransition(() => router.replace(`${pathname}?${params.toString()}`))
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete('category')
    else params.set('category', value)
    params.delete('page')
    startTransition(() => router.replace(`${pathname}?${params.toString()}`))
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search dishes..."
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:placeholder:text-slate-500"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            initialCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {DISH_CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              initialCategory === c.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
