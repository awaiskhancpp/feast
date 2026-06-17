import React from 'react'
import { Sidebar } from '@/components/ui/Sidebar'
import { Navbar } from '@/components/ui/Navbar'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full overflow-x-clip">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
