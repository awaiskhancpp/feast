'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  /** Override the default max-width (e.g. 'max-w-lg') for wider modal content. */
  widthClassName?: string
}

/**
 * Generic dialog shell. The floor-plan "Add New Order" modal, the menu's
 * "Detail Product" modal, and this "Add Customer" modal all need the same
 * backdrop/Escape/scroll-lock behavior - that behavior lives here once
 * instead of being re-implemented per feature.
 */
export function Modal({ open, onClose, title, children, widthClassName = 'max-w-md' }: ModalProps) {
  // Now that the page itself scrolls (rather than a contained `main`), a modal
  // needs to explicitly lock body scroll itself, or the page behind it scrolls too.
  useEffect(() => {
    if (!open) return

    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onEscape)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${widthClassName}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
