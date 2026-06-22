import type { Viewport } from 'next'
import React from 'react'
import { ThemeBootstrap } from '@/components/layout/ThemeBootstrap'
import './(frontend)/styles.css'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html lang="en">
      <body className="w-full bg-[#f5f7fb] text-gray-900 dark:bg-slate-950 dark:text-gray-100">
        <ThemeBootstrap />
        <main>{children}</main>
      </body>
    </html>
  )
}
