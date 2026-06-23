'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UtensilsCrossed } from 'lucide-react'

const sidebarItems = [
  {
    id: 'dashboard',
    icon: '/icons/homeHighlighted.svg',
    active: '/icons/homeIcon.svg',
    label: 'Dashboard',
    href: '/',
  },
  {
    id: 'floor-plan',
    icon: '/icons/gridIcon.svg',
    active: '/icons/gridHighlighted.svg',
    label: 'Floor Plan',
    href: '/table',
  },
  {
    id: 'dishes',
    // No SVG asset exists for dishes yet in /public/icons, so we use a
    // lucide icon here. Add a real SVG to /public/icons/ later and swap
    // this to the same Image-src pattern the other entries use.
    lucideIcon: UtensilsCrossed,
    label: 'Dishes',
    href: '/dishes',
  },
  {
    id: 'history',
    icon: '/icons/clockIcon.svg',
    active: '/icons/clockHighlighted.svg',
    label: 'Transaction History',
    href: '/history',
  },
  {
    id: 'customer',
    icon: '/icons/userIcon.svg',
    active: '/icons/userHighlighted.svg',
    label: 'Customers',
    href: '/customer',
  },
  {
    id: 'setting',
    icon: '/icons/settingsIcon.svg',
    active: '/icons/settingsHighlighted.svg',
    label: 'Settings',
    href: '/settings',
  },
]

import { cn } from '@/components/table/utils'

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    const current = pathname.replace(/\/$/, '')
    const target = href.replace(/\/$/, '')
    if (target === '/') return current === '/'
    return current === target || current.startsWith(target + '/')
  }

  return (
    <div className="flex h-full w-14 flex-col items-center gap-4 border-r border-gray-200 bg-white py-5 xl:w-18 dark:border-slate-800 dark:bg-slate-900">
      <div onClick={onClose} className="w-10 h-10 xl:w-11 xl:h-11 relative flex-shrink-0 mb-4">
        <Image src="/icons/loginIcon.svg" alt="Logo" fill className="object-contain" />
      </div>
      <nav className="flex flex-col gap-3 flex-1">
        {sidebarItems.map((item) => {
          const active = isActive(item.href)
          const LucideIcon = item.lucideIcon

          return (
            <Link key={item.id} href={item.href} onClick={() => onClose?.()}>
              <button
                className={cn(
                  'relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 group',
                  active && 'bg-[#f0f1ff] dark:bg-indigo-950/50',
                )}
                title={item.label}
              >
                {LucideIcon ? (
                  <LucideIcon
                    className={`h-6 w-6 font-bold transition-colors ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:text-slate-400 dark:group-hover:text-slate-200'}`}
                    strokeWidth={3.0}
                  />
                ) : (
                  <div className="w-6 h-6 relative">
                    <Image
                      src={active ? item.active! : item.icon!}
                      alt={item.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="absolute left-16 z-10 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
                  {item.label}
                </div>
              </button>
            </Link>
          )
        })}
      </nav>
      <div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM10.9066 8.27123C11.3138 8.03191 11.7926 7.94443 12.2581 8.02428C12.7236 8.10413 13.1459 8.34615 13.45 8.70749C13.7542 9.06883 13.9207 9.52615 13.92 9.99847L13.92 9.99996C13.92 10.4691 13.5549 10.9582 12.8653 11.4179C12.5509 11.6275 12.2294 11.7889 11.9826 11.8986C11.8606 11.9529 11.7603 11.9929 11.6929 12.0186C11.663 12.03 11.6329 12.041 11.6027 12.0516C11.0794 12.2267 10.7968 12.7926 10.9713 13.3162C11.146 13.8401 11.7123 14.1233 12.2362 13.9486L12.4049 13.8876C12.5015 13.8508 12.6356 13.7971 12.7949 13.7263C13.1105 13.586 13.5391 13.3724 13.9747 13.082C14.7849 12.5419 15.9195 11.5312 15.92 10.0009C15.9213 9.05644 15.5883 8.14201 14.9801 7.41949C14.3717 6.69682 13.5273 6.21277 12.5962 6.05307C11.6652 5.89337 10.7077 6.06833 9.89327 6.54696C9.07886 7.02559 8.46013 7.77701 8.14666 8.66812C7.96339 9.18911 8.23716 9.76002 8.75815 9.9433C9.27914 10.1266 9.85006 9.85279 10.0333 9.33181C10.1901 8.88625 10.4994 8.51054 10.9066 8.27123ZM12 16C11.4477 16 11 16.4477 11 17C11 17.5522 11.4477 18 12 18H12.01C12.5623 18 13.01 17.5522 13.01 17C13.01 16.4477 12.5623 16 12.01 16H12Z"
            fill="#969696"
          />
        </svg>
      </div>
    </div>
  )
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean
  onClose?: () => void
}) {
  return (
    <>
      <div className="hidden md:block sticky top-0 h-screen flex-shrink-0 z-100">
        <SidebarContent />
      </div>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}
      <div
        className={`fixed left-0 top-0 h-full z-50 md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent onClose={onClose} />
      </div>
    </>
  )
}
