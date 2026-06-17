'use client'

import { Search } from 'lucide-react'
import Image from 'next/image'
import { NotificationBell } from './Notification'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const hour = new Date().getHours()
  let greeting = 'Good Evening'
  if (hour >= 5 && hour < 12) greeting = 'Good Morning'
  else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon'
  else if (hour >= 17 && hour < 21) greeting = 'Good Evening'
  else greeting = 'Good Night'

  return (
    <div className="sticky top-0 z-40 h-20 lg:h-24 w-full bg-white border-b border-gray-200 px-4 lg:px-8 flex items-center justify-between">
      <button onClick={onMenuClick} className="md:hidden mr-3">
        <Image src="/icons/loginIcon.svg" alt="Menu" width={36} height={36} />
      </button>
      <div className="flex-shrink-0 min-w-0">
        <h1 className="text-base lg:text-lg font-semibold text-gray-900">{greeting}, Cris!</h1>
        <p className="hidden lg:block text-sm text-gray-500">
          Offer top-notch service to cater to your customers' needs.
        </p>
      </div>

      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 lg:w-56"
          />
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>

        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 flex-shrink-0">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/person.jpg"
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-900">Cristina</p>
            <p className="text-xs text-gray-500">Cashier</p>
          </div>
          <button className="hidden lg:block flex-shrink-0">
            <Image src="/icons/chevronDown.svg" alt="menu" width={18} height={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
