import type {
  AppearanceSettingsState,
  GeneralSettingsState,
  NotificationSettingsState,
  PrivacySettingsState,
  ThemeMode,
} from '@/components/settings/settingsTypes'

export type EmployeeRole = 'admin' | 'manager' | 'cashier' | 'server'

export type Employee = {
  id: string
  name: string
  role: EmployeeRole
  email: string
  phone: string
  pin: string
  avatarUrl: string
  createdAt: string
  active: boolean
}

export type LoginResult =
  | { status: 'success'; employee: Employee }
  | { status: 'multiple'; employees: Employee[] }
  | { status: 'invalid' }

const EMPLOYEES_KEY = 'feast.employees'
const SESSION_KEY = 'feast.currentEmployeeId'
const SESSION_ACTIVITY_KEY = 'feast.currentEmployeeLastActiveAt'
const GENERAL_KEY = 'feast.settings.general'
const NOTIFICATIONS_KEY = 'feast.settings.notifications'
const APPEARANCE_KEY = 'feast.settings.appearance'
const PRIVACY_KEY = 'feast.settings.privacy'
const SESSION_EVENT = 'feast-session-change'

const defaultEmployee: Employee = {
  id: 'employee-cristina-admin',
  name: 'Cristina',
  role: 'admin',
  email: 'cristina@feast.app',
  phone: '(212) 555-0198',
  pin: '000000',
  avatarUrl: '/person.jpg',
  createdAt: '2026-01-01T00:00:00.000Z',
  active: true,
}

export const defaultNotifications: NotificationSettingsState = {
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

export const defaultGeneralSettings: GeneralSettingsState = {
  businessName: 'Feast Kitchen',
  employeeName: '',
  employeeEmail: '',
  employeePhone: '',
  employeeRole: '',
  employeeAvatarUrl: '/person.jpg',
  employeePin: '000000',
  email: 'hello@feast.app',
  phone: '(212) 555-0182',
  language: 'English',
  currency: 'USD',
  timezone: 'America/New_York',
}

export const defaultAppearance: AppearanceSettingsState = {
  theme: 'light',
  accent: 'indigo',
  compactMode: false,
  reducedMotion: false,
}

export const defaultPrivacy: PrivacySettingsState = {
  twoFactor: true,
  loginAlerts: true,
  dataSharing: false,
  securePayments: true,
  sessionTimeout: '30 minutes',
}

function hasStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function emitSessionChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SESSION_EVENT))
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (!hasStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

type SessionTimeout = '15 minutes' | '30 minutes' | '1 hour' | '4 hours'

const SESSION_TIMEOUTS: Record<SessionTimeout, number> = {
  '15 minutes': 15 * 60 * 1000,
  '30 minutes': 30 * 60 * 1000,
  '1 hour': 60 * 60 * 1000,
  '4 hours': 4 * 60 * 60 * 1000,
}

export function getSessionTimeoutMs(timeout: SessionTimeout): number {
  return SESSION_TIMEOUTS[timeout]
}
export function getCurrentEmployeeActivityAt() {
  if (!hasStorage()) return null

  const raw = window.localStorage.getItem(SESSION_ACTIVITY_KEY)
  if (!raw) return null

  const timestamp = Number(raw)
  return Number.isFinite(timestamp) ? timestamp : null
}

export function touchCurrentEmployeeSession() {
  if (!hasStorage()) return
  window.localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now()))
}

export function isCurrentEmployeeSessionExpired(timeout: SessionTimeout) {
  const lastActiveAt = getCurrentEmployeeActivityAt()
  if (!lastActiveAt) return false

  return Date.now() - lastActiveAt >= getSessionTimeoutMs(timeout)
}

export function subscribeToSessionChange(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener(SESSION_EVENT, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(SESSION_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function getEmployees() {
  const employees = readJson<Employee[]>(EMPLOYEES_KEY, [])

  if (employees.length > 0) return employees

  writeJson(EMPLOYEES_KEY, [defaultEmployee])
  return [defaultEmployee]
}

export function saveEmployees(employees: Employee[]) {
  writeJson(EMPLOYEES_KEY, employees)
  emitSessionChange()
}

export function getCurrentEmployee() {
  if (!hasStorage()) return null

  const employeeId = window.localStorage.getItem(SESSION_KEY)
  if (!employeeId) return null

  const employee = getEmployees().find(
    (candidate) => candidate.id === employeeId && candidate.active,
  )
  if (!employee) return null

  if (isCurrentEmployeeSessionExpired(getPrivacySettings().sessionTimeout)) {
    logoutCurrentEmployee()
    return null
  }

  return employee
}

export function loginWithPin(pin: string): LoginResult {
  const matches = getEmployees().filter((employee) => employee.active && employee.pin === pin)

  if (matches.length === 0) return { status: 'invalid' }
  if (matches.length > 1) return { status: 'multiple', employees: matches }

  setCurrentEmployee(matches[0].id)
  return { status: 'success', employee: matches[0] }
}

export function loginEmployee(employeeId: string, pin: string): LoginResult {
  const employee = getEmployees().find(
    (candidate) => candidate.id === employeeId && candidate.active && candidate.pin === pin,
  )

  if (!employee) return { status: 'invalid' }

  setCurrentEmployee(employee.id)
  return { status: 'success', employee }
}

export function setCurrentEmployee(employeeId: string) {
  if (!hasStorage()) return
  window.localStorage.setItem(SESSION_KEY, employeeId)
  touchCurrentEmployeeSession()
  emitSessionChange()
}

export function logoutCurrentEmployee() {
  if (!hasStorage()) return
  window.localStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem(SESSION_ACTIVITY_KEY)
  emitSessionChange()
}

export function createEmployee(input: {
  name: string
  role: EmployeeRole
  email: string
  phone: string
  avatarUrl?: string
}) {
  const employee: Employee = {
    id: `employee-${Date.now()}`,
    name: input.name.trim(),
    role: input.role,
    email: input.email.trim(),
    phone: input.phone.trim(),
    pin: '000000',
    avatarUrl: input.avatarUrl || '/person.jpg',
    createdAt: new Date().toISOString(),
    active: true,
  }

  saveEmployees([...getEmployees(), employee])
  return employee
}

export function updateEmployee(employeeId: string, updates: Partial<Employee>) {
  const employees = getEmployees()
  const nextEmployees = employees.map((employee) =>
    employee.id === employeeId ? { ...employee, ...updates } : employee,
  )

  saveEmployees(nextEmployees)
  return nextEmployees.find((employee) => employee.id === employeeId) ?? null
}

export function getNotificationsSettings() {
  return readJson<NotificationSettingsState>(NOTIFICATIONS_KEY, defaultNotifications)
}

export function saveNotificationsSettings(settings: NotificationSettingsState) {
  writeJson(NOTIFICATIONS_KEY, settings)
}

export function getGeneralSettings() {
  return readJson<GeneralSettingsState>(GENERAL_KEY, defaultGeneralSettings)
}

export function saveGeneralSettings(settings: GeneralSettingsState) {
  writeJson(GENERAL_KEY, settings)
}

export function getAppearanceSettings() {
  return readJson<AppearanceSettingsState>(APPEARANCE_KEY, defaultAppearance)
}

export function saveAppearanceSettings(settings: AppearanceSettingsState) {
  writeJson(APPEARANCE_KEY, settings)
  applyThemePreference(settings.theme)
}

export function getPrivacySettings() {
  return readJson<PrivacySettingsState>(PRIVACY_KEY, defaultPrivacy)
}

export function savePrivacySettings(settings: PrivacySettingsState) {
  writeJson(PRIVACY_KEY, settings)
}

export function applyThemePreference(theme: ThemeMode) {
  if (typeof window === 'undefined') return

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldUseDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', shouldUseDark)
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}
