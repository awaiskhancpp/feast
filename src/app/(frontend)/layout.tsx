'use client'
import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Navbar } from '@/components/ui/Navbar'
import { useCurrentEmployee } from '@/lib/useCurrentEmployee'
import { useSessionTimeout } from '@/lib/useSessionTimeout'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { employee, ready } = useCurrentEmployee()
  useSessionTimeout(employee)

  // Paths that should not show Sidebar/Navbar
  const isAuthRoute = pathname === '/login' || pathname === '/onboarding'

  React.useEffect(() => {
    if (ready && !employee && !isAuthRoute) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`)
    }
  }, [employee, pathname, ready, router, isAuthRoute])

  // Still show loading for auth routes if not ready
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7fb] text-sm font-medium text-gray-500">
        Loading workspace...
      </div>
    )
  }

  // If on auth route, just render children (no Sidebar/Navbar)
  if (isAuthRoute) {
    return children
  }

  // If not on auth route but no employee, redirect to login (handled by useEffect above)
  if (!employee) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7fb] text-sm font-medium text-gray-500">
        Loading workspace...
      </div>
    )
  }

  // Authenticated user on non-auth route: show full layout
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-x-clip">
        <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
