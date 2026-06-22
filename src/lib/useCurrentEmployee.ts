'use client'

import { useEffect, useState } from 'react'
import {
  applyThemePreference,
  getAppearanceSettings,
  getCurrentEmployee,
  subscribeToSessionChange,
  type Employee,
} from './appSession'

export function useCurrentEmployee() {
  const [ready, setReady] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    const sync = () => {
      setEmployee(getCurrentEmployee())
      applyThemePreference(getAppearanceSettings().theme)
      setReady(true)
    }

    sync()
    return subscribeToSessionChange(sync)
  }, [])

  return { employee, ready }
}
