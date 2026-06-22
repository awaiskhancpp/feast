'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCurrentEmployeeActivityAt,
  getPrivacySettings,
  getSessionTimeoutMs,
  logoutCurrentEmployee,
  touchCurrentEmployeeSession,
  type Employee,
} from './appSession'

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const

export function useSessionTimeout(employee: Employee | null) {
  const router = useRouter()

  useEffect(() => {
    if (!employee) return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const clearScheduledLogout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const logout = () => {
      clearScheduledLogout()
      logoutCurrentEmployee()
      router.replace('/login')
    }

    const scheduleLogout = () => {
      clearScheduledLogout()

      const timeoutMs = getSessionTimeoutMs(getPrivacySettings().sessionTimeout)
      const lastActiveAt = getCurrentEmployeeActivityAt() ?? Date.now()
      const remaining = timeoutMs - (Date.now() - lastActiveAt)

      if (remaining <= 0) {
        logout()
        return
      }

      timeoutId = setTimeout(logout, remaining)
    }

    const markActivity = () => {
      touchCurrentEmployeeSession()
      scheduleLogout()
    }

    if (!getCurrentEmployeeActivityAt()) {
      touchCurrentEmployeeSession()
    }
    scheduleLogout()

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true })
    })
    document.addEventListener('visibilitychange', markActivity)

    return () => {
      clearScheduledLogout()
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity)
      })
      document.removeEventListener('visibilitychange', markActivity)
    }
  }, [employee, router])
}
