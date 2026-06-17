'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

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
    href: '/table',
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
  const pathname = usePathname()
  const normalize = (path: string) => path.replace(/\/$/, '')

  const isActive = (href: string) => {
    const current = pathname.replace(/\/$/, '')
    const target = href.replace(/\/$/, '')

    if (target === '') return current === ''
    if (target === '/') return current === '/'

    return current === target || current.startsWith(target + '/')
  }

  return (
    <div className="sticky top-0 h-screen w-14 xl:w-18 flex-shrink-0 flex flex-col items-center py-6 gap-4 bg-white border-r border-gray-200 overflow-hidden">
      <div className="w-10 h-10 xl:w-11 xl:h-11 relative flex-shrink-0 mb-4">
        <Image src="/icons/loginIcon.svg" alt="Logo" fill className="object-contain" />
      </div>

      <nav className="flex flex-col gap-3 flex-1">
        {sidebarItems.map((item) => {
          const active = isActive(item.href)

          return (
            <Link key={item.id} href={item.href}>
              <button
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 relative group flex-shrink-0"
                title={item.label}
              >
                <div className="w-6 h-6 relative">
                  <Image
                    src={active ? item.active : item.icon}
                    alt={item.label}
                    fill
                    className="object-contain"
                  />
                </div>

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
