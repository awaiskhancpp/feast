'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { createDishCategory, type CategoryFormState } from '@/app/(frontend)/dishes/actions'
import { UploadCloud, X } from 'lucide-react'
import { useState } from 'react'

const initialState: CategoryFormState = {}

export function CategoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(createDishCategory, initialState)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setPreview(URL.createObjectURL(file))
    }
  }

  const removeFile = () => {
    setFileName(null)
    setPreview(null)
    // also reset the file input value
    const input = document.getElementById('icon-upload') as HTMLInputElement
    if (input) input.value = ''
  }
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
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
            Icon
          </label>

          {!preview ? (
            <label
              htmlFor="icon-upload"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-sm text-gray-500 transition hover:border-primary/50 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-primary/40"
            >
              <UploadCloud className="h-10 w-10 text-gray-400 dark:text-slate-500" />
              <span className="font-medium">Click to upload</span>
              <span className="text-xs">PNG, JPG, SVG or WEBP (max 2MB)</span>
              <input
                id="icon-upload"
                type="file"
                name="icon"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800">
                <img src={preview} alt="Icon preview" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Uploaded successfully</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
              <input
                id="icon-upload"
                type="file"
                name="icon"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
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
