'use client'

import { useActionState, useEffect, useState } from 'react'
import type { CategoryOption } from '@/lib/dishCategories'
import { createDish, updateDish, type DishFormState } from '@/app/(frontend)/dishes/actions'
import { Button } from '@/components/ui/button'

const initialState: DishFormState = {}

export interface DishDefaults {
  id: string
  name: string
  category: string
  price: number
  description: string
  inStock: boolean
  imageUrl?: string
}

interface DishFormProps {
  categories: CategoryOption[]
  defaults?: DishDefaults
  onSuccess: () => void
}

export function DishForm({ categories, defaults, onSuccess }: DishFormProps) {
  const action = defaults ? updateDish.bind(null, defaults.id) : createDish
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [preview, setPreview] = useState<string | undefined>(defaults?.imageUrl)

  useEffect(() => {
    if (state.success) onSuccess()
  }, [state.success, onSuccess])

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Dish Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaults?.name}
          placeholder="Bruschetta"
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:placeholder-slate-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={defaults?.category ?? categories[0]?.id}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="price"
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Price ($)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={defaults?.price}
            placeholder="6.50"
            required
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaults?.description}
          rows={3}
          placeholder="Toasted bread topped with a mix of fresh tomatoes, basil, and olive oil."
          required
          minLength={10}
          className="w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:placeholder-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="image"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300"
        >
          Photo{' '}
          {defaults && (
            <span className="font-normal text-gray-400 dark:text-slate-500">
              (leave empty to keep current)
            </span>
          )}
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setPreview(URL.createObjectURL(file))
          }}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 dark:text-slate-300"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="mt-2 h-24 w-24 rounded-lg object-cover" />
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
        <input
          type="checkbox"
          name="inStock"
          defaultChecked={defaults?.inStock ?? true}
          className="h-4 w-4 rounded accent-primary"
        />
        In stock (visible on the order screen)
      </label>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <Button
        type="submit"
        text={isPending ? 'Saving...' : defaults ? 'Save Changes' : 'Add Dish'}
        disabled={isPending}
      />
    </form>
  )
}
