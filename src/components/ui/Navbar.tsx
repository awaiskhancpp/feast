'use client'

import { Search, Bell } from 'lucide-react'
import Image from 'next/image'
import { NotificationBell } from './Notification'

export function Navbar() {
  return (
    // No more fixed/top-0/left-20/right-0/z-40 — that was all compensating for being
    // pulled out of flow. flex-shrink-0 keeps the height locked at 96px (h-24) even if
    // the column ever gets tight, the same guarantee `fixed` used to provide.
    <div className="h-24 w-full flex-shrink-0 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
      {/* Left Section: Greeting */}
      <div className="flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Good Morning, Cris!</h1>
        <p className="text-sm text-gray-500">
          Offer top-notch service to cater to your customers' needs.
        </p>
      </div>

      {/* Right Section: Search, Icons & Profile */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 flex-shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/person.jpg"
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="items-start">
            <p className="text-sm font-semibold text-gray-900">Cristina</p>
            <p className="text-xs text-gray-500">Cashier</p>
          </div>
          <button className="flex-shrink-0">
            <Image src="/icons/chevronDown.svg" alt="menu" width={18} height={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
