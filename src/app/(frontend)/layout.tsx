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

  React.useEffect(() => {
    if (ready && !employee) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`)
    }
  }, [employee, pathname, ready, router])

  if (!ready || !employee) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7fb] text-sm font-medium text-gray-500">
        Loading workspace...
      </div>
    )
  }

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {/* overflow-x-clip only on the right column, NOT the outer wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-x-clip">
        <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
