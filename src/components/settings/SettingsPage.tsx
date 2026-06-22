'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SettingsMenu } from './SettingsMenu'
import { SettingsPanels } from './SettingsPanels'
import type { GeneralSettingsState, SettingsTabId } from './settingsTypes'
import {
  getGeneralSettings,
  getAppearanceSettings,
  getCurrentEmployee,
  getEmployees,
  getNotificationsSettings,
  getPrivacySettings,
  logoutCurrentEmployee,
  saveGeneralSettings,
  saveAppearanceSettings,
  saveNotificationsSettings,
  savePrivacySettings,
  subscribeToSessionChange,
  type Employee,
} from '@/lib/appSession'
import { useCurrentEmployee } from '@/lib/useCurrentEmployee'

export function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { employee: sessionEmployee } = useCurrentEmployee()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [notifications, setNotifications] = useState(getNotificationsSettings)
  const [general, setGeneral] = useState<GeneralSettingsState>(getGeneralSettings)
  const [appearance, setAppearance] = useState(getAppearanceSettings)
  const [privacy, setPrivacy] = useState(getPrivacySettings)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  const handleLogout = () => {
    logoutCurrentEmployee()
    router.replace('/login')
  }

  const handleSaved = (message: string) => {
    setSaveNotice(message)

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => setSaveNotice(null), 1800)
  }

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (
      tab === 'general' ||
      tab === 'notifications' ||
      tab === 'appearance' ||
      tab === 'privacy' ||
      tab === 'logout'
    ) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const syncEmployee = () => {
      const employee = getCurrentEmployee()
      setCurrentEmployee(employee)
      setEmployees(getEmployees())

      if (employee) {
        setGeneral((prev) => ({
          ...prev,
          employeeName: employee.name,
          employeeEmail: employee.email,
          employeePhone: employee.phone,
          employeeRole: employee.role,
          employeeAvatarUrl: employee.avatarUrl,
          employeePin: employee.pin,
        }))
      }
    }

    syncEmployee()
    return subscribeToSessionChange(syncEmployee)
  }, [sessionEmployee?.id])

  useEffect(() => {
    saveNotificationsSettings(notifications)
  }, [notifications])

  useEffect(() => {
    saveGeneralSettings(general)
  }, [general])

  useEffect(() => {
    saveAppearanceSettings(appearance)
  }, [appearance])

  useEffect(() => {
    savePrivacySettings(privacy)
  }, [privacy])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f5f7fb] px-4 pb-8 pt-2 xl:px-8 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Settings</div>
        {saveNotice ? (
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {saveNotice}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <SettingsMenu activeTab={activeTab} onSelectTab={setActiveTab} />

        <div className="min-w-0">
          <SettingsPanels
            activeTab={activeTab}
            general={general}
            setGeneral={setGeneral}
            notifications={notifications}
            setNotifications={setNotifications}
            appearance={appearance}
            setAppearance={setAppearance}
            privacy={privacy}
            setPrivacy={setPrivacy}
            currentEmployee={currentEmployee}
            employees={employees}
            refreshEmployees={() => {
              setEmployees(getEmployees())
              setCurrentEmployee(getCurrentEmployee())
            }}
            onLogout={handleLogout}
            onSaved={handleSaved}
          />
        </div>
      </div>
    </div>
  )
}
