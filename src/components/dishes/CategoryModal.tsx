'use client'

import { useActionState, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { createDishCategory, type CategoryFormState } from '@/app/(frontend)/dishes/actions'
import { UploadCloud, X } from 'lucide-react'

const initialState: CategoryFormState = {}

interface IconUploadProps {
  name: string
  id: string
  label: string
  hint: string
  required?: boolean
}

function IconUploadField({ name, id, label, hint, required }: IconUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  // Single ref — this input never leaves the DOM, so its File is always available to the form
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
  }

  const remove = () => {
    setFileName(null)
    setPreview(null)
    // Clear the actual file input value so the browser/form treats it as empty
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
        <span className="ml-1 text-xs font-normal text-gray-400 dark:text-slate-500">{hint}</span>
      </label>

      {/*
        ALWAYS in the DOM. This is what the form actually submits.
        The label/dropzone and the preview are purely cosmetic — they trigger or display this input.
        required is only enforced by the browser when no file is chosen yet.
      */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        name={name}
        accept="image/*,.svg"
        required={required && !preview}
        onChange={handleChange}
        className="hidden"
      />

      {!preview ? (
        /* Dropzone — clicking the label triggers the hidden input above via htmlFor */
        <label
          htmlFor={id}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-6 text-sm text-gray-500 transition hover:border-primary/50 hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-primary/40"
        >
          <UploadCloud className="h-8 w-8 text-gray-400 dark:text-slate-500" />
          <span className="font-medium">Click to upload</span>
          <span className="text-xs">SVG, PNG or WEBP (max 2 MB)</span>
        </label>
      ) : (
        /* Preview row — no new <input> here, the ref input above still holds the file */
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-800">
            <img src={preview} alt="" className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {fileName}
            </p>
            <label htmlFor={id} className="cursor-pointer text-xs text-primary hover:underline">
              Change file
            </label>
          </div>
          <button
            type="button"
            onClick={remove}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

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
            className="w-full rounded-lg border px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Slug</label>
          <input
            name="slug"
            required
            placeholder="appetizers"
            pattern="^[a-z0-9-]+$"
            title="Lowercase letters, numbers and hyphens only"
            className="w-full rounded-lg border px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
          />
          <p className="mt-1 text-xs text-gray-400">Lowercase, numbers, hyphens only.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <IconUploadField
            id="icon-default"
            name="icon"
            label="Default Icon"
            hint="(inactive state)"
            required
          />
          <IconUploadField
            id="icon-highlighted"
            name="iconHighlighted"
            label="Highlighted Icon"
            hint="(active State)"
            required
          />
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500">
          Upload two SVGs — default (dark/gray) shown when inactive, highlighted (white) shown when
          selected.
        </p>

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" text={isPending ? 'Saving…' : 'Add Category'} disabled={isPending} />
      </form>
    </Modal>
  )
}
