import type { Viewport } from 'next'
import React from 'react'
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
      <body className=" w-full ">
        <main>{children}</main>
      </body>
    </html>
  )
}
