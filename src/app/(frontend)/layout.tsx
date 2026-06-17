'use client'
import React from 'react'
import { Sidebar } from '@/components/ui/Sidebar'
import { Navbar } from '@/components/ui/Navbar'
import { useState } from 'react'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="flex h-full w-full overflow-x-clip">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onMenuClick={() => setMobileOpen((prev) => !prev)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
