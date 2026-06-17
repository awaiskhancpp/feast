import React from 'react'
import { Sidebar } from '@/components/ui/Sidebar'
import { Navbar } from '@/components/ui/Navbar'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />
        <main className="flex-1 px-4 lg:px-8 pb-8 pt-2">{children}</main>
      </div>
    </div>
  )
}
