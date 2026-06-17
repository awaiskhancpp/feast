'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsMenu } from './SettingsMenu'
import { SettingsPanels } from './SettingsPanels'
import type {
  AppearanceSettingsState,
  GeneralSettingsState,
  NotificationSettingsState,
  PrivacySettingsState,
  SettingsTabId,
} from './settingsTypes'

const defaultNotifications: NotificationSettingsState = {
  outOfStockItems: false,
  orderStatus: true,
  newOrder: false,
  payment: false,
  productPromo: true,
  emailNotifications: true,
  deliveryStatusUpdates: false,
  customerFeedback: false,
  shipmentUpdates: true,
}

const defaultGeneral: GeneralSettingsState = {
  businessName: 'Feast Kitchen',
  managerName: 'Cristina',
  email: 'cristina@feast.app',
  phone: '+92 300 1234567',
  language: 'English',
  currency: 'USD',
  timezone: 'Asia/Karachi',
}

const defaultAppearance: AppearanceSettingsState = {
  theme: 'light',
  accent: 'indigo',
  compactMode: false,
  reducedMotion: false,
}

const defaultPrivacy: PrivacySettingsState = {
  twoFactor: true,
  loginAlerts: true,
  dataSharing: false,
  securePayments: true,
  sessionTimeout: '30 minutes',
}

export function SettingsPage() {
  const router = useRouter()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTabId>('notifications')
  const [notifications, setNotifications] = useState(defaultNotifications)
  const [general, setGeneral] = useState(defaultGeneral)
  const [appearance, setAppearance] = useState(defaultAppearance)
  const [privacy, setPrivacy] = useState(defaultPrivacy)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  const handleLogout = () => {
    router.push('/onboarding')
  }

  const handleSaved = (message: string) => {
    setSaveNotice(message)

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => setSaveNotice(null), 1800)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f5f7fb] px-4 pb-8 pt-2 xl:px-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-gray-500">Settings</div>
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
            onLogout={handleLogout}
            onSaved={handleSaved}
          />
        </div>
      </div>
    </div>
  )
}
