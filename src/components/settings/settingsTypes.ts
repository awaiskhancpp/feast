export type SettingsTabId = 'general' | 'notifications' | 'appearance' | 'privacy' | 'logout'

export type NotificationKey =
  | 'outOfStockItems'
  | 'orderStatus'
  | 'newOrder'
  | 'payment'
  | 'productPromo'
  | 'emailNotifications'
  | 'deliveryStatusUpdates'
  | 'customerFeedback'
  | 'shipmentUpdates'

export type NotificationSettingsState = Record<NotificationKey, boolean>

export type GeneralSettingsState = {
  businessName: string
  employeeName: string
  employeeEmail: string
  employeePhone: string
  employeeRole: string
  employeeAvatarUrl: string
  employeePin: string
  email: string
  phone: string
  language: string
  currency: string
  timezone: string
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentTone = 'indigo' | 'violet' | 'emerald' | 'amber'

export type AppearanceSettingsState = {
  theme: ThemeMode
  accent: AccentTone
  compactMode: boolean
  reducedMotion: boolean
}

export type SessionTimeout = '15 minutes' | '30 minutes' | '1 hour' | '4 hours'

export type PrivacySettingsState = {
  twoFactor: boolean
  loginAlerts: boolean
  dataSharing: boolean
  securePayments: boolean
  sessionTimeout: SessionTimeout
}
