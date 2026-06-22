'use client'

import { LogOut, Settings, UserRound } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logoutCurrentEmployee } from '@/lib/appSession'
import { useCurrentEmployee } from '@/lib/useCurrentEmployee'
import { NotificationBell } from './Notification'
import { NavbarSearch } from './NavbarSearch'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const { employee } = useCurrentEmployee()
  const [profileOpen, setProfileOpen] = useState(false)
  const hour = new Date().getHours()
  let greeting = 'Good Evening'
  if (hour >= 5 && hour < 12) greeting = 'Good Morning'
  else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon'
  else if (hour >= 17 && hour < 21) greeting = 'Good Evening'
  else greeting = 'Good Night'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = employee?.name ?? 'Staff'
  const roleLabel = employee?.role
    ? employee.role.charAt(0).toUpperCase() + employee.role.slice(1)
    : 'Cashier'
  const avatarUrl = employee?.avatarUrl || '/person.jpg'

  function goToPersonalSettings() {
    setProfileOpen(false)
    router.push('/settings?tab=general')
  }

  function handleLogout() {
    setProfileOpen(false)
    logoutCurrentEmployee()
    router.replace('/login')
  }

  return (
    <div className="sticky top-0 z-40 h-20 w-full border-b border-gray-200 bg-white px-4 flex items-center justify-between lg:h-24 lg:px-8 dark:border-slate-800 dark:bg-slate-900">
      <button onClick={onMenuClick} className="md:hidden mr-3">
        <Image src="/icons/loginIcon.svg" alt="Menu" width={36} height={36} />
      </button>
      <div className="flex-shrink-0 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 lg:text-lg dark:text-gray-100">
          {greeting}, {displayName.split(' ')[0]}!
        </h1>
        <p className="hidden text-sm text-gray-500 lg:block dark:text-slate-400">
          Offer top-notch service to cater to your customers' needs.
        </p>
      </div>

      <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
        <NavbarSearch />

        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>

        <div
          className="relative flex flex-shrink-0 items-center gap-2 border-l border-gray-200 pl-2 lg:gap-3 lg:pl-4 dark:border-slate-800"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6066ed]/40 lg:h-10 lg:w-10"
            aria-label="Open profile menu"
          >
            <Image
              src={avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized={avatarUrl.startsWith('data:')}
            />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{roleLabel}</p>
          </div>
          <button
            type="button"
            className="hidden flex-shrink-0 rounded-md p-1 hover:bg-gray-50 lg:block dark:hover:bg-slate-800"
            onClick={() => setProfileOpen((open) => !open)}
            aria-label="Open profile menu"
          >
            <Image src="/icons/chevronDown.svg" alt="menu" width={18} height={18} />
          </button>

          {profileOpen ? (
            <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-gray-100 px-4 py-3 lg:hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{roleLabel}</p>
              </div>
              <button
                type="button"
                onClick={goToPersonalSettings}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                <UserRound className="h-4 w-4 text-[#6066ed]" />
                Personal settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  router.push('/settings')
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4 text-[#6066ed]" />
                Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/40"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
