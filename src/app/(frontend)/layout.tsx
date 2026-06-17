'use client'
import React, { useState } from 'react'
import { Sidebar } from '@/components/ui/Sidebar'
import { Navbar } from '@/components/ui/Navbar'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

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
