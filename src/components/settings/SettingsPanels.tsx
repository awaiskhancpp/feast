'use client'

import Image from 'next/image'
import {
  Camera,
  Check,
  KeyRound,
  Monitor,
  MoonStar,
  Palette,
  Save,
  ShieldCheck,
  SunMedium,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  useEffect,
  useState,
  type Dispatch,
  type InputHTMLAttributes,
  type SetStateAction,
} from 'react'
import { cn } from '@/components/table/utils'
import {
  createEmployee,
  fileToDataUrl,
  updateEmployee,
  type Employee,
  type EmployeeRole,
} from '@/lib/appSession'
import {
  isValidEmail,
  isValidName,
  isValidPin,
  isValidUSPhone,
  validateImageFile,
} from '@/lib/validation'
import type {
  AppearanceSettingsState,
  GeneralSettingsState,
  NotificationKey,
  NotificationSettingsState,
  PrivacySettingsState,
  SettingsTabId,
  SessionTimeout,
  ThemeMode,
  AccentTone,
} from './settingsTypes'

type SettingsPanelsProps = {
  activeTab: SettingsTabId
  general: GeneralSettingsState
  setGeneral: Dispatch<SetStateAction<GeneralSettingsState>>
  notifications: NotificationSettingsState
  setNotifications: Dispatch<SetStateAction<NotificationSettingsState>>
  appearance: AppearanceSettingsState
  setAppearance: Dispatch<SetStateAction<AppearanceSettingsState>>
  privacy: PrivacySettingsState
  setPrivacy: Dispatch<SetStateAction<PrivacySettingsState>>
  currentEmployee: Employee | null
  employees: Employee[]
  refreshEmployees: () => void
  onLogout: () => void
  onSaved: (message: string) => void
}

const notificationRows: Array<{
  key: NotificationKey
  title: string
  description: string
}> = [
  {
    key: 'outOfStockItems',
    title: 'Out of Stock Items',
    description: 'Notify me when items stock will run out soon',
  },
  {
    key: 'orderStatus',
    title: 'Order Status',
    description: 'Switch this on to get notifications every time a new order is made',
  },
  {
    key: 'newOrder',
    title: 'New Order',
    description: 'Notify me when new order activity comes in',
  },
  {
    key: 'payment',
    title: 'Payment',
    description: 'Activate this to get updates on successful and failed payments',
  },
  {
    key: 'productPromo',
    title: 'Product Promo',
    description: 'Notify me when any payment activity has been confirmed',
  },
  {
    key: 'emailNotifications',
    title: 'Email Notifications',
    description: 'Notify me when items stock will run out soon',
  },
  {
    key: 'deliveryStatusUpdates',
    title: 'Delivery Status Updates',
    description: 'Switch on notifications for updates on order delivery statuses',
  },
  {
    key: 'customerFeedback',
    title: 'Customer Feedback',
    description: 'Enable this to be alerted when customers provide feedback or reviews',
  },
  {
    key: 'shipmentUpdates',
    title: 'Shipment Updates',
    description: 'Turn this on to receive updates on the status of your deliveries',
  },
]

const themeOptions: Array<{
  key: ThemeMode
  label: string
  description: string
  icon: typeof SunMedium
}> = [
  { key: 'light', label: 'Light', description: 'Bright UI for daytime work', icon: SunMedium },
  { key: 'dark', label: 'Dark', description: 'Low-light friendly workspace', icon: MoonStar },
  { key: 'system', label: 'System', description: 'Follow the device theme', icon: Monitor },
]

const accentOptions: Array<{
  key: AccentTone
  label: string
  color: string
}> = [
  { key: 'indigo', label: 'Indigo', color: '#6066ed' },
  { key: 'violet', label: 'Violet', color: '#8d70ff' },
  { key: 'emerald', label: 'Emerald', color: '#10b981' },
  { key: 'amber', label: 'Amber', color: '#f59e0b' },
]

const timeoutOptions: SessionTimeout[] = ['15 minutes', '30 minutes', '1 hour', '4 hours']

const roleOptions: Array<{ value: EmployeeRole; label: string; description: string }> = [
  { value: 'admin', label: 'Admin', description: 'Can manage users and settings' },
  { value: 'manager', label: 'Manager', description: 'Can oversee operations' },
  { value: 'cashier', label: 'Cashier', description: 'Handles checkout and orders' },
  { value: 'server', label: 'Server', description: 'Handles tables and floor service' },
]

type EmployeeFormState = {
  name: string
  email: string
  phone: string
  role: EmployeeRole
}

export function SettingsPanels({
  activeTab,
  general,
  setGeneral,
  notifications,
  setNotifications,
  appearance,
  setAppearance,
  privacy,
  setPrivacy,
  currentEmployee,
  employees,
  refreshEmployees,
  onLogout,
  onSaved,
}: SettingsPanelsProps) {
  switch (activeTab) {
    case 'general':
      return (
        <GeneralSettingsPanel
          general={general}
          setGeneral={setGeneral}
          currentEmployee={currentEmployee}
          employees={employees}
          refreshEmployees={refreshEmployees}
          onSaved={onSaved}
        />
      )
    case 'notifications':
      return (
        <NotificationSettingsPanel
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )
    case 'appearance':
      return (
        <AppearanceSettingsPanel
          appearance={appearance}
          setAppearance={setAppearance}
          onSaved={onSaved}
        />
      )
    case 'privacy':
      return <PrivacySettingsPanel privacy={privacy} setPrivacy={setPrivacy} onSaved={onSaved} />
    case 'logout':
      return <LogoutSettingsPanel onLogout={onLogout} />
  }

  return null
}

function GeneralSettingsPanel({
  general,
  setGeneral,
  currentEmployee,
  employees,
  refreshEmployees,
  onSaved,
}: {
  general: GeneralSettingsState
  setGeneral: Dispatch<SetStateAction<GeneralSettingsState>>
  currentEmployee: Employee | null
  employees: Employee[]
  refreshEmployees: () => void
  onSaved: (message: string) => void
}) {
  const [profileError, setProfileError] = useState('')
  const [createError, setCreateError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [employeeSaving, setEmployeeSaving] = useState(false)
  const [employeePreview, setEmployeePreview] = useState<string>('')
  const [newEmployee, setNewEmployee] = useState<EmployeeFormState>({
    name: '',
    email: '',
    phone: '',
    role: 'cashier',
  })
  const [newEmployeeAvatar, setNewEmployeeAvatar] = useState<File | null>(null)

  useEffect(() => {
    if (currentEmployee) {
      setGeneral((prev) => ({
        ...prev,
        employeeName: currentEmployee.name,
        employeeEmail: currentEmployee.email,
        employeePhone: currentEmployee.phone,
        employeeRole: currentEmployee.role,
        employeeAvatarUrl: currentEmployee.avatarUrl,
        employeePin: currentEmployee.pin,
      }))
    }
  }, [currentEmployee, setGeneral])

  const profileAvatar = general.employeeAvatarUrl || currentEmployee?.avatarUrl || '/person.jpg'
  const canEditTeam = currentEmployee?.role === 'admin'

  async function handleProfilePhoto(file: File | null) {
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setProfileError(validation.message ?? 'Invalid image.')
      return
    }

    const dataUrl = await fileToDataUrl(file)
    setGeneral((prev) => ({ ...prev, employeeAvatarUrl: dataUrl }))
    setProfileError('')
  }

  async function handleCreateEmployeePhoto(file: File | null) {
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setCreateError(validation.message ?? 'Invalid image.')
      return
    }

    const dataUrl = await fileToDataUrl(file)
    setEmployeePreview(dataUrl)
    setNewEmployeeAvatar(file)
    setCreateError('')
  }

  async function saveProfile() {
    if (!currentEmployee) return

    const name = general.employeeName.trim()
    const email = general.employeeEmail.trim()
    const phone = general.employeePhone.trim()
    const pin = general.employeePin.trim()
    const role =
      currentEmployee.role === 'admin'
        ? (general.employeeRole as EmployeeRole) || currentEmployee.role
        : currentEmployee.role
    const avatarUrl = general.employeeAvatarUrl || currentEmployee.avatarUrl || '/person.jpg'

    if (!isValidName(name)) {
      setProfileError('Enter a valid employee name.')
      return
    }
    if (!isValidEmail(email)) {
      setProfileError('Enter a valid email address.')
      return
    }
    if (!isValidUSPhone(phone)) {
      setProfileError('Enter a valid US phone number.')
      return
    }
    if (!isValidPin(pin)) {
      setProfileError('PIN must be exactly 6 digits.')
      return
    }

    setProfileSaving(true)
    try {
      updateEmployee(currentEmployee.id, {
        name,
        email,
        phone,
        role,
        avatarUrl,
        pin,
      })
      refreshEmployees()
      setProfileError('')
      onSaved('Personal settings saved')
    } finally {
      setProfileSaving(false)
    }
  }

  async function createTeamMember() {
    const name = newEmployee.name.trim()
    const email = newEmployee.email.trim()
    const phone = newEmployee.phone.trim()

    if (!canEditTeam) {
      setCreateError('Only admins can create employees.')
      return
    }
    if (!isValidName(name)) {
      setCreateError('Enter a valid employee name.')
      return
    }
    if (!isValidEmail(email)) {
      setCreateError('Enter a valid employee email.')
      return
    }
    if (!isValidUSPhone(phone)) {
      setCreateError('Enter a valid US phone number.')
      return
    }

    let avatarUrl = '/person.jpg'
    if (newEmployeeAvatar) {
      const validation = validateImageFile(newEmployeeAvatar)
      if (!validation.valid) {
        setCreateError(validation.message ?? 'Invalid image.')
        return
      }
      avatarUrl = employeePreview || (await fileToDataUrl(newEmployeeAvatar))
    }

    setEmployeeSaving(true)
    try {
      createEmployee({
        name,
        email,
        phone,
        role: newEmployee.role,
        avatarUrl,
      })
      refreshEmployees()
      setNewEmployee({ name: '', email: '', phone: '', role: 'cashier' })
      setNewEmployeeAvatar(null)
      setEmployeePreview('')
      setCreateError('')
      onSaved('Employee created with PIN 000000')
    } finally {
      setEmployeeSaving(false)
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:min-h-[590px] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            General Settings
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Manage the logged-in staff profile, PIN, and workspace details.
          </p>
        </div>

        <button
          onClick={saveProfile}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6066ed] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#555beb]"
          type="button"
          disabled={profileSaving}
        >
          <Save className="h-4 w-4" />
          {profileSaving ? 'Saving...' : 'Save profile'}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#6066ed]/10 text-[#6066ed]">
            <Image
              src={profileAvatar}
              alt={general.employeeName || currentEmployee?.name || 'Profile photo'}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              unoptimized={profileAvatar.startsWith('data:')}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {general.employeeName || currentEmployee?.name || 'Staff profile'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {general.employeeRole || currentEmployee?.role || 'cashier'}
            </p>
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Camera className="h-4 w-4" />
            Change photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleProfilePhoto(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Employee Name"
            value={general.employeeName}
            onChange={(value) => setGeneral((prev) => ({ ...prev, employeeName: value }))}
          />
          <Field
            label="Employee Email"
            value={general.employeeEmail}
            onChange={(value) => setGeneral((prev) => ({ ...prev, employeeEmail: value }))}
          />
          <Field
            label="Phone Number"
            value={general.employeePhone}
            onChange={(value) => setGeneral((prev) => ({ ...prev, employeePhone: value }))}
          />
          <Field
            label="PIN"
            value={general.employeePin}
            onChange={(value) =>
              setGeneral((prev) => ({ ...prev, employeePin: value.replace(/\D/g, '').slice(0, 6) }))
            }
            type="password"
            inputMode="numeric"
            maxLength={6}
          />
          <SelectField
            label="Role"
            value={
              currentEmployee?.role === 'admin'
                ? general.employeeRole || currentEmployee.role || 'cashier'
                : currentEmployee?.role || 'cashier'
            }
            onChange={(value) => setGeneral((prev) => ({ ...prev, employeeRole: value }))}
            options={roleOptions.map((option) => option.value)}
            className="sm:col-span-2"
            helper={
              currentEmployee?.role === 'admin'
                ? 'Admins can change any staff role.'
                : 'Only admins can change staff roles.'
            }
            disabled={currentEmployee?.role !== 'admin'}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#6066ed]" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Workspace details
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                This information is stored locally for the dashboard.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field
              label="Business Name"
              value={general.businessName}
              onChange={(value) => setGeneral((prev) => ({ ...prev, businessName: value }))}
            />
            <Field
              label="Business Email"
              value={general.email}
              onChange={(value) => setGeneral((prev) => ({ ...prev, email: value }))}
            />
            <Field
              label="Business Phone"
              value={general.phone}
              onChange={(value) => setGeneral((prev) => ({ ...prev, phone: value }))}
            />
            <SelectField
              label="Language"
              value={general.language}
              onChange={(value) => setGeneral((prev) => ({ ...prev, language: value }))}
              options={['English', 'Arabic', 'French']}
            />
            <SelectField
              label="Currency"
              value={general.currency}
              onChange={(value) => setGeneral((prev) => ({ ...prev, currency: value }))}
              options={['USD', 'PKR', 'AED']}
            />
            <SelectField
              label="Time Zone"
              value={general.timezone}
              onChange={(value) => setGeneral((prev) => ({ ...prev, timezone: value }))}
              options={['America/New_York', 'Asia/Karachi', 'Asia/Dubai', 'UTC']}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Team members</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {employees.length} staff account{employees.length === 1 ? '' : 's'} stored locally.
              </p>
            </div>
            <Users className="h-5 w-5 text-[#6066ed]" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={employee.avatarUrl || '/person.jpg'}
                    alt={employee.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                    unoptimized={employee.avatarUrl.startsWith('data:')}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {employee.name}
                    </p>
                    <p className="text-xs capitalize text-gray-500 dark:text-slate-400">
                      {employee.role}
                    </p>
                  </div>
                </div>
                <p className="mt-3 truncate text-xs text-gray-500 dark:text-slate-400">
                  {employee.email}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  PIN: {employee.pin === '000000' ? '000000' : '******'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {canEditTeam ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Add new employee
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Every new employee starts with PIN <span className="font-semibold">000000</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={createTeamMember}
              disabled={employeeSaving}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6066ed] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#555beb] disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {employeeSaving ? 'Creating...' : 'Create employee'}
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Employee Name"
                value={newEmployee.name}
                onChange={(value) => setNewEmployee((prev) => ({ ...prev, name: value }))}
              />
              <Field
                label="Employee Email"
                value={newEmployee.email}
                onChange={(value) => setNewEmployee((prev) => ({ ...prev, email: value }))}
              />
              <Field
                label="Phone Number"
                value={newEmployee.phone}
                onChange={(value) => setNewEmployee((prev) => ({ ...prev, phone: value }))}
              />
              <SelectField
                label="Role"
                value={newEmployee.role}
                onChange={(value) =>
                  setNewEmployee((prev) => ({ ...prev, role: value as EmployeeRole }))
                }
                options={roleOptions.map((option) => option.value)}
                helper="Choose the new employee's access level."
              />
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                Profile picture
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                  {employeePreview ? (
                    <Image
                      src={employeePreview}
                      alt="New employee preview"
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      unoptimized={employeePreview.startsWith('data:')}
                    />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleCreateEmployeePhoto(event.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          </div>

          {createError ? <p className="mt-3 text-sm text-red-600">{createError}</p> : null}
        </div>
      ) : null}

      {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
    </section>
  )
}

function NotificationSettingsPanel({
  notifications,
  setNotifications,
}: {
  notifications: NotificationSettingsState
  setNotifications: Dispatch<SetStateAction<NotificationSettingsState>>
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:min-h-[590px] dark:border-slate-800 dark:bg-slate-900">
      <div className="divide-y divide-gray-100 dark:divide-slate-800">
        {notificationRows.map((row) => {
          const enabled = notifications[row.key]

          return (
            <div key={row.key} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {row.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-slate-400">
                  {row.description}
                </p>
              </div>
              <ToggleSwitch
                checked={enabled}
                onChange={() =>
                  setNotifications((prev) => ({ ...prev, [row.key]: !prev[row.key] }))
                }
                label={row.title}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AppearanceSettingsPanel({
  appearance,
  setAppearance,
  onSaved,
}: {
  appearance: AppearanceSettingsState
  setAppearance: Dispatch<SetStateAction<AppearanceSettingsState>>
  onSaved: (message: string) => void
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:min-h-[590px] dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Appearance Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Choose the look and feel that helps your team move quickly.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {themeOptions.map((option) => {
          const active = appearance.theme === option.key
          const Icon = option.icon

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setAppearance((prev) => ({ ...prev, theme: option.key }))}
              className={cn(
                'rounded-2xl border p-4 text-left transition',
                active
                  ? 'border-[#6066ed] bg-[#6066ed]/5'
                  : 'border-gray-100 bg-gray-50 hover:bg-gray-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl',
                    active
                      ? 'bg-[#6066ed] text-white'
                      : 'bg-white text-[#6066ed] dark:bg-slate-900',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{option.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Accent Color</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Pick the highlight color used across the workspace.
            </p>
          </div>
          <Palette className="h-5 w-5 text-[#6066ed]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {accentOptions.map((option) => {
            const active = appearance.accent === option.key

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setAppearance((prev) => ({ ...prev, accent: option.key }))}
                className={cn(
                  'flex min-w-[96px] items-center gap-2 rounded-xl border px-3 py-2 text-sm transition',
                  active
                    ? 'border-gray-300 bg-white text-gray-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100'
                    : 'border-transparent bg-white/70 text-gray-600 hover:bg-white dark:bg-slate-900 dark:text-slate-300',
                )}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                {option.label}
                {active ? <Check className="ml-auto h-4 w-4 text-[#6066ed]" /> : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ToggleRow
          title="Compact Mode"
          description="Reduce spacing to show more information on screen."
          checked={appearance.compactMode}
          onToggle={() => setAppearance((prev) => ({ ...prev, compactMode: !prev.compactMode }))}
        />
        <ToggleRow
          title="Reduced Motion"
          description="Minimize animations across the interface."
          checked={appearance.reducedMotion}
          onToggle={() =>
            setAppearance((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))
          }
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6066ed] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#555beb]"
          type="button"
          onClick={() => onSaved('Appearance settings saved')}
        >
          <Save className="h-4 w-4" />
          Save changes
        </button>
      </div>
    </section>
  )
}

function PrivacySettingsPanel({
  privacy,
  setPrivacy,
  onSaved,
}: {
  privacy: PrivacySettingsState
  setPrivacy: Dispatch<SetStateAction<PrivacySettingsState>>
  onSaved: (message: string) => void
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:min-h-[590px] dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Privacy & Security Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Protect access and control how the app handles staff sessions.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <ToggleRow
          title="Two-factor Authentication"
          description="Require an extra verification step when signing in."
          checked={privacy.twoFactor}
          onToggle={() => setPrivacy((prev) => ({ ...prev, twoFactor: !prev.twoFactor }))}
        />
        <ToggleRow
          title="Login Alerts"
          description="Receive updates when someone signs into the dashboard."
          checked={privacy.loginAlerts}
          onToggle={() => setPrivacy((prev) => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
        />
        <ToggleRow
          title="Data Sharing"
          description="Allow the app to share anonymous diagnostics for support."
          checked={privacy.dataSharing}
          onToggle={() => setPrivacy((prev) => ({ ...prev, dataSharing: !prev.dataSharing }))}
        />
        <ToggleRow
          title="Secure Payments"
          description="Require an extra check before sensitive payment actions."
          checked={privacy.securePayments}
          onToggle={() => setPrivacy((prev) => ({ ...prev, securePayments: !prev.securePayments }))}
        />

        <SelectField
          label="Session Timeout"
          value={privacy.sessionTimeout}
          onChange={(value) =>
            setPrivacy((prev) => ({ ...prev, sessionTimeout: value as SessionTimeout }))
          }
          options={timeoutOptions}
          helper="Automatic sign-out helps keep the terminal secure."
        />

        <div className="flex justify-end pt-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6066ed] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#555beb]"
            type="button"
            onClick={() => onSaved('Privacy settings saved')}
          >
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </div>
    </section>
  )
}

function LogoutSettingsPanel({ onLogout }: { onLogout: () => void }) {
  return (
    <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:min-h-[590px] dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <KeyRound className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Logout</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-slate-400">
          Sign out of the current session and return to the login screen.
        </p>
        <button
          onClick={onLogout}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-red-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
          type="button"
        >
          Sign Out
        </button>
      </div>
    </section>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-slate-400">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onToggle} label={title} />
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 rounded-full transition',
        checked ? 'bg-[#6066ed]' : 'bg-gray-200',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition',
          checked ? 'left-5' : 'left-0.5',
        )}
      />
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  maxLength,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
      <input
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#6066ed] focus:ring-2 focus:ring-[#6066ed]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:placeholder:text-slate-500"
        value={value}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  helper,
  className,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  helper?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <label className={cn('space-y-1.5', className)}>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
      <select
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#6066ed] focus:ring-2 focus:ring-[#6066ed]/20 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helper ? <p className="text-xs text-gray-500 dark:text-slate-400">{helper}</p> : null}
    </label>
  )
}
