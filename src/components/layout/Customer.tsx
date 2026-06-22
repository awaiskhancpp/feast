'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AddCustomerForm } from '@/components/ui/AddCustomerForm'
import Image from 'next/image'

type CustomerStatus = 'Member' | 'Guest'

export interface CustomerRow {
  id: string
  name: string
  phone: string
  address: string
  dateAdded: string
  status: CustomerStatus
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  'name-asc': 'Name (A–Z)',
  'name-desc': 'Name (Z–A)',
}

const PAGE_SIZE = 8

interface CustomerListPageProps {
  customers: CustomerRow[]
}

export default function CustomerListPage({ customers }: CustomerListPageProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortOption>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase()
    const matches = customers.filter(
      (c) => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query),
    )

    return [...matches].sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'oldest':
          return a.dateAdded.localeCompare(b.dateAdded)
        default:
          return b.dateAdded.localeCompare(a.dateAdded)
      }
    })
  }, [customers, search, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }
  function updateSort(value: SortOption) {
    setSort(value)
    setSortOpen(false)
    setPage(1)
  }

  function getPages(current: number, total: number) {
    const pages: (number | '...')[] = []
    const add = (p: number) => {
      if (!pages.includes(p)) pages.push(p)
    }
    add(1)
    if (current > 3) pages.push('...')
    for (let i = current - 1; i <= current + 1; i++) {
      if (i > 1 && i < total) add(i)
    }
    if (current < total - 2) pages.push('...')
    if (total > 1) add(total)
    return pages
  }

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 bg-gray-50 min-h-full">
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Customer List
              <Image src="/info.svg" alt="" width={15} height={15} />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep track of every customer, their orders, and preferences effortlessly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-44">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M12.75 12.75L10.4167 10.4167M12.0833 6.41667C12.0833 9.54628 9.54628 12.0833 6.41667 12.0833C3.28705 12.0833 0.75 9.54628 0.75 6.41667C0.75 3.28705 3.28705 0.75 6.41667 0.75C9.54628 0.75 12.0833 3.28705 12.0833 6.41667Z"
                    stroke="#757575"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                value={search}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2.5 5.83333C2.5 5.3731 2.8731 5 3.33333 5H13.3333C13.7936 5 14.1667 5.3731 14.1667 5.83333C14.1667 6.29357 13.7936 6.66667 13.3333 6.66667H3.33333C2.8731 6.66667 2.5 6.29357 2.5 5.83333Z"
                      fill="#757575"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0 0.833333C0 0.373096 0.373096 0 0.833333 0H15.8333C16.2936 0 16.6667 0.373096 16.6667 0.833333C16.6667 1.29357 16.2936 1.66667 15.8333 1.66667H0.833333C0.373096 1.66667 0 1.29357 0 0.833333Z"
                      fill="#757575"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5 10.8333C5 10.3731 5.3731 10 5.83333 10H10.8333C11.2936 10 11.6667 10.3731 11.6667 10.8333C11.6667 11.2936 11.2936 11.6667 10.8333 11.6667H5.83333C5.3731 11.6667 5 11.2936 5 10.8333Z"
                      fill="#757575"
                    />
                  </svg>
                  <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
                  <span className="sm:hidden">Sort by</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-44 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => updateSort(option)}
                        className={`flex h-9 w-full items-center px-3 text-left text-sm hover:bg-gray-50 ${
                          sort === option ? 'font-semibold text-violet-600' : 'text-gray-600'
                        }`}
                      >
                        {SORT_LABELS[option]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition whitespace-nowrap"
              >
                + Add Customer
              </button>
            </div>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            {search ? `No customers match "${search}".` : 'No customers yet — add your first one.'}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      'ID Customer',
                      'Customer Name',
                      'Phone Number',
                      'Address',
                      'Date Added',
                      'Status',
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 text-xs font-semibold text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-4 px-3 text-xs">{c.id}</td>
                      <td className="py-4 px-3">{c.name}</td>
                      <td className="py-4 px-3">{c.phone}</td>
                      <td className="py-4 px-3">{c.address}</td>
                      <td className="py-4 px-3">{c.dateAdded}</td>
                      <td className="py-4 px-3">
                        <Badge tone={c.status === 'Member' ? 'green' : 'red'}>{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/tablet cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
              {paginated.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.id}</p>
                    </div>
                    <Badge tone={c.status === 'Member' ? 'green' : 'red'}>{c.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Phone', c.phone],
                      ['Address', c.address],
                      ['Date Added', c.dateAdded],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between gap-3">
                        <span className="text-gray-500">{label}</span>
                        <span className="text-gray-900 text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination — compact on mobile, full on desktop */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex lg:hidden items-center justify-between w-full">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="hidden lg:flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="hidden lg:flex items-center gap-1">
                {getPages(safePage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span key={i} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${safePage === p ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="hidden lg:flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer">
        <AddCustomerForm
          onSuccess={() => {
            setModalOpen(false)
            router.refresh()
          }}
        />
      </Modal>
    </div>
  )
}
