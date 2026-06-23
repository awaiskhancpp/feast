'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { DishForm, type DishDefaults } from '@/components/dishes/DishForm'
import { DishFilters } from '@/components/dishes/DishFilters'
import { deleteDish } from '@/app/(frontend)/dishes/actions'
import type { CategoryOption } from '@/lib/dishCategories'
import { CategoryModal } from '@/components/dishes/CategoryModal'
export interface DishRow {
  id: string
  name: string
  category: string
  price: number
  description: string
  inStock: boolean
  imageUrl?: string
}

interface DishesListPageProps {
  dishes: DishRow[]
  categories: CategoryOption[]
  currentPage: number
  totalPages: number
  query: string
  category: string
}

export default function DishesListPage({
  dishes,
  categories,
  currentPage,
  totalPages,
  query,
  category,
}: DishesListPageProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DishDefaults | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  function buildHref(page: number) {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category !== 'all') params.set('category', category)
    if (page > 1) params.set('page', String(page))
    const qs = params.toString()
    return qs ? `/dishes?${qs}` : '/dishes'
  }

  function openEdit(dish: DishRow) {
    setEditing({
      id: dish.id,
      name: dish.name,
      category: dish.category,
      price: dish.price,
      description: dish.description,
      inStock: dish.inStock,
      imageUrl: dish.imageUrl,
    })
    setFormOpen(true)
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return
    startTransition(() => {
      deleteDish(id)
    })
  }
  const categoryLabel = (value: string) => categories.find((c) => c.value === value)?.label ?? value

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 bg-gray-50 min-h-full dark:bg-slate-950">
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dishes</h2>
            <p className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">
              Manage every item on the menu — name, price, photo, and availability.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg border"
              onClick={() => setCategoryModalOpen(true)}
            >
              Manage Categories
            </button>
            <button
              onClick={() => {
                setEditing(undefined)
                setFormOpen(true)
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition whitespace-nowrap"
            >
              + Add Dish
            </button>
          </div>
        </div>

        <div className="mb-6">
          <DishFilters initialQuery={query} initialCategory={category} categories={categories} />
        </div>

        {dishes.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-slate-400">
            {query
              ? `No dishes match "${query}".`
              : 'No dishes yet — add the first one to the menu.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900 ${
                    isPending ? 'opacity-60' : ''
                  }`}
                >
                  <div className="relative h-42 w-full bg-gray-100 dark:bg-slate-800">
                    {dish.imageUrl ? (
                      <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-slate-500">
                        No photo
                      </div>
                    )}
                    {!dish.inStock && (
                      <span className="absolute left-2 top-2">
                        <Badge tone="gray">Out of stock</Badge>
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {dish.name}
                      </h3>
                      <span className="text-sm font-bold text-primary">
                        ${dish.price.toFixed(2)}
                      </span>
                    </div>
                    {/* <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                      {categoryLabel(dish.category)}
                    </p> */}
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">
                      {dish.description}
                    </p>
                  </div>

                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(dish)}
                      aria-label={`Edit ${dish.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-gray-600 shadow hover:bg-white dark:bg-slate-800/95 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id, dish.name)}
                      aria-label={`Delete ${dish.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-red-500 shadow hover:bg-white dark:bg-slate-800/95 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} buildHref={buildHref} />
            </div>
          </>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit Dish' : 'Add Dish'}
      >
        <DishForm categories={categories} defaults={editing} onSuccess={() => setFormOpen(false)} />
      </Modal>
      <CategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
    </div>
  )
}
