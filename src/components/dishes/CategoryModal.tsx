'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { createDishCategory, type CategoryFormState } from '@/app/(frontend)/dishes/actions'

const initialState: CategoryFormState = {}

export function CategoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createDishCategory, initialState)

  return (
    <Modal open={open} onClose={onClose} title="Add Dish Category">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <input
            name="name"
            required
            placeholder="Appetizers"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Slug</label>
          <input
            name="slug"
            required
            placeholder="appetizers"
            pattern="^[a-z0-9-]+$"
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Icon</label>
          <input type="file" name="icon" accept="image/*" required className="w-full" />
        </div>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button
          type="submit"
          text={isPending ? 'Saving...' : 'Add Category'}
          disabled={isPending}
        />
      </form>
    </Modal>
  )
}
