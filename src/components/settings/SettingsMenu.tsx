'use client'

import Image from 'next/image'
import { cn } from '@/components/table/utils'
import type { SettingsTabId } from './settingsTypes'

type SettingsMenuProps = {
  activeTab: SettingsTabId
  onSelectTab: (tab: SettingsTabId) => void
}

const menuItems: Array<{
  id: SettingsTabId
  label: string
  icon: string
}> = [
  { id: 'general', label: 'General Settings', icon: '/icons/settingIcon.svg' },
  { id: 'workspace', label: 'Workspace Settings', icon: '/office.svg' },
  { id: 'employees', label: 'Employees', icon: '/employee.svg' },
  { id: 'notifications', label: 'Notification Settings', icon: '/icons/notificationIcon.svg' },
  { id: 'appearance', label: 'Appearance Settings', icon: '/icons/appearenceIcon.svg' },
  { id: 'privacy', label: 'Privacy & Security Settings', icon: '/icons/privacyIcon.svg' },
  { id: 'logout', label: 'Logout', icon: '/icons/logout.svg' },
]

export function SettingsMenu({ activeTab, onSelectTab }: SettingsMenuProps) {
  return (
    <aside className="xl:sticky xl:top-4 self-start">
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2" role="tablist" aria-label="Settings sections">
          {menuItems.map((item) => {
            const active = activeTab === item.id
            const isLogout = item.id === 'logout'

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                  active
                    ? 'bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-gray-100'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800',
                  isLogout &&
                    'mt-2 border-t border-gray-100 pt-4 text-red-500 dark:border-slate-800',
                  isLogout && active && 'bg-red-50 text-red-500 dark:bg-red-950/40',
                )}
              >
                <span
                  className={cn(
                    'grid h-6 w-6 flex-none place-items-center rounded-md',
                    active && !isLogout && 'text-[#6066ed]',
                    !active && !isLogout && 'text-[#8d70ff]',
                    isLogout && 'text-red-500',
                  )}
                >
                  <div className="h-4 w-4">
                    <Image src={item.icon} alt="" width={20} height={20} />
                  </div>
                </span>
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
