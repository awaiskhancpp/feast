import React from 'react'
import './(frontend)/styles.css'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    // h-full on html resolves against the viewport (the one special case where a
    // percentage height on the root element is allowed to do that). body and main
    // each inherit 100% of a definite ancestor height, so there's exactly one place
    // — this file — that "knows" about the actual viewport. Nothing downstream needs
    // h-screen/100vh and its scrollbar-width quirks.
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">
        <main className="h-full">{children}</main>
      </body>
    </html>
  )
}
