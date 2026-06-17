import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Builds the href for a given page number, preserving other query params (q, sort, ...). */
  buildHref: (page: number) => string
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  const keep = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

/**
 * Plain <Link>s, not buttons with onClick - page changes are just navigations
 * to a new ?page= value, so this works without any client-side state and the
 * resulting URL is shareable/bookmarkable on its own.
 */
export function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers(currentPage, totalPages)
  const atStart = currentPage <= 1
  const atEnd = currentPage >= totalPages

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        aria-disabled={atStart}
        tabIndex={atStart ? -1 : undefined}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 ${
          atStart ? 'pointer-events-none opacity-40' : 'hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Link>

      {/* Numbered pages need room ellipsis-collapsing still doesn't guarantee on a
          phone, so below sm this collapses further to a plain "Page X of Y" label,
          keeping only the two controls (Previous/Next) actually needed to navigate. */}
      <div className="hidden items-center gap-1 sm:flex">
        {pageNumbers.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
                p === currentPage ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>
      <span className="text-sm font-medium text-gray-600 sm:hidden">
        Page {currentPage} of {totalPages}
      </span>

      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={atEnd}
        tabIndex={atEnd ? -1 : undefined}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 ${
          atEnd ? 'pointer-events-none opacity-40' : 'hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}
