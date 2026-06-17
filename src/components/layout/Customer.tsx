'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AddCustomerForm } from '@/components/ui/AddCustomerForm'
import Image from 'next/image'

type CustomerStatus = 'Member' | 'Guest'

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  dateAdded: string
  status: CustomerStatus
}

const CUSTOMERS: Customer[] = [
  {
    id: '#43178',
    name: 'Arlene McCoy',
    phone: '(480) 555-0103',
    address: '8558 Green Rd.',
    dateAdded: '2024-04-01',
    status: 'Member',
  },
  {
    id: '#22739',
    name: 'Kathryn Murphy',
    phone: '(671) 555-0110',
    address: '8080 Railroad St.',
    dateAdded: '2024-04-01',
    status: 'Member',
  },
  {
    id: '#97174',
    name: 'Devon Lane',
    phone: '(307) 555-0133',
    address: '3890 Poplar Dr.',
    dateAdded: '2024-04-02',
    status: 'Guest',
  },
  {
    id: '#22739',
    name: 'Guy Hawkins',
    phone: '(406) 555-0120',
    address: '775 Rolling Green Rd.',
    dateAdded: '2024-04-03',
    status: 'Member',
  },
  {
    id: '#39635',
    name: 'Jacob Jones',
    phone: '(316) 555-0116',
    address: '7529 E. Pecan St.',
    dateAdded: '2024-04-04',
    status: 'Guest',
  },
  {
    id: '#43178',
    name: 'Ronald Richards',
    phone: '(302) 555-0107',
    address: '7529 E. Pecan St.',
    dateAdded: '2024-04-05',
    status: 'Guest',
  },
  {
    id: '#70668',
    name: 'Dianne Russell',
    phone: '(252) 555-0126',
    address: '3605 Parker Rd.',
    dateAdded: '2024-04-06',
    status: 'Member',
  },
  {
    id: '#43756',
    name: 'Jerome Bell',
    phone: '(702) 555-0122',
    address: '8558 Green Rd.',
    dateAdded: '2024-04-07',
    status: 'Guest',
  },
]

const PAGE_SIZE = 8
const TOTAL_PAGES = 10

export default function CustomerListPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(
    () =>
      CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.id.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  )

  const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  function getPages(current: number, total: number) {
    const pages: (number | '...')[] = []

    const add = (p: number) => {
      if (!pages.includes(p)) pages.push(p)
    }

    // always first
    add(1)

    // left ellipsis
    if (current > 3) pages.push('...')

    // middle range
    for (let i = current - 1; i <= current + 1; i++) {
      if (i > 1 && i < total) add(i)
    }

    // right ellipsis
    if (current < total - 2) pages.push('...')

    // always last
    if (total > 1) add(total)

    return pages
  }
  return (
    <div className="px-6 py-6 bg-gray-50 min-h-full">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Customer List
              <Image src="/info.svg" alt="" width={15} height={15} />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep track of every customer, their orders, and preferences effortlessly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400 w-44"
              />
            </div>

            {/* Sort by */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
              <svg
                width="17"
                height="12"
                viewBox="0 0 17 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
              Sort by
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Add Customer */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
            >
              + Add Customer
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500">
                ID Customer
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500">
                Customer Name
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500">
                Phone Number
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500">Address</th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500">
                Date Added
              </th>
              <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="py-4 px-2 text-xs">{c.id}</td>
                <td className="py-4 px-2  text-black">{c.name}</td>
                <td className="py-4 px-2 text-black">{c.phone}</td>
                <td className="py-4 px-2 text-black">{c.address}</td>
                <td className="py-4 px-2 text-black">{c.dateAdded}</td>
                <td className="py-4 px-2">
                  <Badge tone={c.status === 'Member' ? 'green' : 'red'}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-black font-semibold hover:bg-gray-50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-1">
            {getPages(page, TOTAL_PAGES).map((p, i) =>
              p === '...' ? (
                <span key={i} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={i}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    page === p ? 'bg-violet-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
            disabled={page === TOTAL_PAGES}
            className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-black font-semibold hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Customer">
        <AddCustomerForm onSuccess={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
