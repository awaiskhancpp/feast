'use client'

import { useEffect, useState } from 'react'

// Recharts (and any other canvas/SVG-prop-driven chart) takes literal color
// strings, not Tailwind classes, so `dark:` variants can't reach it. This
// hook mirrors the `dark` class that `applyThemePreference` toggles on
// <html> so chart components can pick a light/dark stroke palette in JS.
// A MutationObserver (rather than the app's SESSION_EVENT) is used because
// theme changes aren't currently broadcast through that event, and this
// keeps chart components decoupled from the settings/session wiring.
export function useIsDarkMode() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setIsDark(root.classList.contains('dark'))

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return isDark
}
