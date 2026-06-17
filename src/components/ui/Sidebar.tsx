'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const sidebarItems = [
  {
    id: 'dashboard',
    icon: '/icons/homeHighlighted.svg',
    active: '/icons/homeIcon.svg',
    label: 'Dashboard',
    href: '/',
  },
  {
    id: 'products',
    icon: '/icons/gridIcon.svg',
    active: '/icons/gridHighlighted.svg',
    label: 'Products',
    href: '#',
  },
  {
    id: 'reservation',
    icon: '/icons/clockIcon.svg',
    active: '/icons/clockHighlighted.svg',
    label: 'Reservation',
    href: '#',
  },
  {
    id: 'user',
    icon: '/icons/userIcon.svg',
    active: '/icons/userHighlighted.svg',
    label: 'User',
    href: '#',
  },
  {
    id: 'setting',
    icon: '/icons/settingsIcon.svg',
    active: '/icons/settingsHighlighted.svg',
    label: 'Settings',
    href: '#',
  },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [isOpen, setIsOpen] = useState(true)

  return (
    // No more fixed/left-0/top-0, no more separate "Content offset" spacer fragment.
    // h-full (was h-screen) matches the stretched height of its flex-row parent.
    // flex-shrink-0 means the row can never squeeze this below its w-20/w-0 width —
    // the single source of truth for the sidebar's width now lives in exactly one
    // place, and Navbar/main automatically get the correct remaining space for free.
    <div
      className={`h-full flex-shrink-0 transition-all duration-300 ${
        isOpen ? 'w-20' : 'w-0'
      } flex flex-col items-center py-6 gap-4 overflow-hidden`}
    >
      {/* Logo/Brand */}
      <div className="w-12 h-12 relative flex-shrink-0 mb-4">
        <Image src="/icons/loginIcon.svg" alt="Logo" fill className="object-contain" />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-3 flex-1">
        {sidebarItems.map((item) => {
          const isActive = activeItem === item.id

          return (
            <Link key={item.id} href={item.href}>
              <button
                onClick={() => setActiveItem(item.id)}
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 relative group flex-shrink-0"
                title={item.label}
              >
                <div className="w-6 h-6 relative">
                  <Image
                    src={isActive ? item.active : item.icon}
                    alt={item.label}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {item.label}
                </div>
              </button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
