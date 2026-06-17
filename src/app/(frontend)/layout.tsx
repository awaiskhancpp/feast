import React from 'react'
import { Sidebar } from '@/components/ui/Sidebar'
import { Navbar } from '@/components/ui/Navbar'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    // h-full, not h-screen/w-screen: this div fills its already-viewport-locked
    // ancestor (RootLayout's body) instead of re-anchoring to the viewport itself.
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        {/* The only element on the page that scrolls. No pt-24 needed anymore —
            Navbar is a normal in-flow sibling now, so main naturally starts after it. */}
        <main className="flex-1 overflow-y-auto px-8 pb-8 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
