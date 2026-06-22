'use client'

import { useEffect } from 'react'
import { applyThemePreference, getAppearanceSettings } from '@/lib/appSession'

export function ThemeBootstrap() {
  useEffect(() => {
    applyThemePreference(getAppearanceSettings().theme)
  }, [])

  return null
}
