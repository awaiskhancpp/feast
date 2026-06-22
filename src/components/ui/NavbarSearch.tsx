'use client'

import {
  BarChart2,
  Clock,
  LayoutGrid,
  Moon,
  Search,
  Settings,
  Shield,
  UtensilsCrossed,
  Users,
  Bell,
  UserRound,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type JSX } from 'react'
import { cn } from '@/components/table/utils'

type SuggestionGroup = 'Pages' | 'Settings' | 'Quick Search'

interface Suggestion {
  id: string
  label: string
  description: string
  href: string
  group: SuggestionGroup
  icon: JSX.Element
  keywords: string[]
}

const STATIC_SUGGESTIONS: Suggestion[] = [
  // Pages
  {
    id: 'page-dashboard',
    label: 'Dashboard',
    description: 'Overview, sales, analytics',
    href: '/',
    group: 'Pages',
    icon: <BarChart2 className="h-4 w-4" />,
    keywords: ['dashboard', 'home', 'overview', 'analytics', 'sales', 'revenue'],
  },
  {
    id: 'page-floor-plan',
    label: 'Floor Plan',
    description: 'Tables, orders, reservations',
    href: '/table',
    group: 'Pages',
    icon: <LayoutGrid className="h-4 w-4" />,
    keywords: ['floor', 'plan', 'table', 'tables', 'orders', 'seating', 'reservations'],
  },
  {
    id: 'page-dishes',
    label: 'Dishes',
    description: 'Menu items, categories, stock',
    href: '/dishes',
    group: 'Pages',
    icon: <UtensilsCrossed className="h-4 w-4" />,
    keywords: ['dishes', 'menu', 'food', 'items', 'stock', 'categories', 'ingredients'],
  },
  {
    id: 'page-history',
    label: 'Transaction History',
    description: 'Past orders, receipts, payments',
    href: '/history',
    group: 'Pages',
    icon: <Clock className="h-4 w-4" />,
    keywords: ['history', 'transactions', 'orders', 'receipts', 'payments', 'past'],
  },
  {
    id: 'page-customers',
    label: 'Customers',
    description: 'Customer list, members, guests',
    href: '/customer',
    group: 'Pages',
    icon: <Users className="h-4 w-4" />,
    keywords: ['customers', 'clients', 'members', 'guests', 'people', 'contacts'],
  },
  {
    id: 'page-settings',
    label: 'Settings',
    description: 'App configuration',
    href: '/settings',
    group: 'Pages',
    icon: <Settings className="h-4 w-4" />,
    keywords: ['settings', 'config', 'preferences', 'options'],
  },
  // Settings sub-tabs
  {
    id: 'settings-general',
    label: 'General Settings',
    description: 'Profile, name, email, PIN',
    href: '/settings?tab=general',
    group: 'Settings',
    icon: <UserRound className="h-4 w-4" />,
    keywords: ['general', 'profile', 'name', 'email', 'phone', 'pin', 'password', 'account'],
  },
  {
    id: 'settings-team',
    label: 'Team Settings',
    description: 'Employees, roles, access',
    href: '/settings?tab=team',
    group: 'Settings',
    icon: <Users className="h-4 w-4" />,
    keywords: [
      'team',
      'employees',
      'staff',
      'roles',
      'admin',
      'cashier',
      'manager',
      'server',
      'access',
    ],
  },
  {
    id: 'settings-notifications',
    label: 'Notifications',
    description: 'Alerts, order updates, payments',
    href: '/settings?tab=notifications',
    group: 'Settings',
    icon: <Bell className="h-4 w-4" />,
    keywords: ['notifications', 'alerts', 'email', 'push', 'order', 'updates'],
  },
  {
    id: 'settings-appearance',
    label: 'Appearance',
    description: 'Theme, dark mode, accent color',
    href: '/settings?tab=appearance',
    group: 'Settings',
    icon: <Moon className="h-4 w-4" />,
    keywords: ['appearance', 'theme', 'dark', 'light', 'mode', 'color', 'accent', 'compact'],
  },
  {
    id: 'settings-privacy',
    label: 'Privacy & Security',
    description: 'PIN, 2FA, session timeout',
    href: '/settings?tab=privacy',
    group: 'Settings',
    icon: <Shield className="h-4 w-4" />,
    keywords: ['privacy', 'security', '2fa', 'two-factor', 'session', 'timeout', 'pin', 'secure'],
  },
]

const GROUP_ORDER: SuggestionGroup[] = ['Quick Search', 'Pages', 'Settings']

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function buildSuggestions(query: string): Suggestion[] {
  const q = query.trim().toLowerCase()

  // No query — show all pages as shortcuts
  if (!q) {
    return STATIC_SUGGESTIONS.filter((s) => s.group === 'Pages')
  }

  // Filter static suggestions by keyword match
  const matched = STATIC_SUGGESTIONS.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.keywords.some((kw) => kw.includes(q)),
  )

  // Dynamic "quick search" actions
  const quickSearch: Suggestion[] = [
    {
      id: 'search-dishes',
      label: `Search dishes for "${query}"`,
      description: 'Browse matching menu items',
      href: `/dishes?q=${encodeURIComponent(query)}`,
      group: 'Quick Search',
      icon: <UtensilsCrossed className="h-4 w-4" />,
      keywords: [],
    },
    {
      id: 'search-customers',
      label: `Find customer "${query}"`,
      description: 'Look up in customer list',
      href: `/customer?search=${encodeURIComponent(query)}`,
      group: 'Quick Search',
      icon: <Users className="h-4 w-4" />,
      keywords: [],
    },
  ]

  return [...quickSearch, ...matched]
}

export function NavbarSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 280)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = buildSuggestions(debouncedQuery)

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIdx(0)
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setMobileOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if ((open || mobileOpen) && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open, mobileOpen])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      setMobileOpen(false)
      setQuery('')
      router.push(href)
    },
    [router],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = suggestions[activeIdx]
      if (target) navigate(target.href)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setMobileOpen(false)
      setQuery('')
    }
  }

  // Group suggestions preserving GROUP_ORDER
  const grouped = GROUP_ORDER.reduce<Record<string, Suggestion[]>>((acc, group) => {
    const items = suggestions.filter((s) => s.group === group)
    if (items.length) acc[group] = items
    return acc
  }, {})

  const isDropdownVisible = (open || mobileOpen) && suggestions.length > 0

  const inputEl = (
    <input
      ref={inputRef}
      type="text"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        setActiveIdx(0)
      }}
      onKeyDown={handleKeyDown}
      onFocus={() => setOpen(true)}
      placeholder="Search here…"
      autoComplete="off"
      className="w-full bg-transparent py-2.5 pl-10 pr-9 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder-slate-500"
    />
  )

  const searchIcon = (
    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
      <Search className="h-4 w-4 text-gray-400" />
    </div>
  )

  const clearBtn = query ? (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()
        setQuery('')
        inputRef.current?.focus()
      }}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  ) : null

  const dropdown = isDropdownVisible ? (
    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            {group}
          </p>
          {items.map((item, idx) => {
            const flatIdx = suggestions.indexOf(item)
            const isActive = flatIdx === activeIdx
            return (
              <button
                key={item.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault()
                  navigate(item.href)
                }}
                onPointerEnter={() => setActiveIdx(flatIdx)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-800',
                )}
              >
                <span
                  className={cn(
                    'flex-shrink-0',
                    isActive ? 'text-indigo-500' : 'text-gray-400 dark:text-slate-500',
                  )}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-gray-400 dark:text-slate-500">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      ))}
      {query && (
        <p className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-400 dark:border-slate-800 dark:text-slate-600">
          ↑↓ navigate &nbsp;·&nbsp; ↵ select &nbsp;·&nbsp; Esc close
        </p>
      )}
    </div>
  ) : null

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Desktop search bar */}
      <div className="relative hidden md:block">
        <div className="relative w-44 rounded-lg border border-gray-200 bg-white lg:w-56 dark:border-slate-700 dark:bg-slate-950">
          {searchIcon}
          {inputEl}
          {clearBtn}
        </div>
        {dropdown}
      </div>

      {/* Mobile: icon only, expands overlay */}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 md:hidden dark:border-slate-700 dark:text-slate-400"
        onClick={() => setMobileOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-0 z-50 bg-white px-4 py-3 shadow-lg dark:bg-slate-900 md:hidden">
          <div className="relative rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            {searchIcon}
            {inputEl}
            {clearBtn}
          </div>
          {/* Mobile dropdown attached below */}
          {isDropdownVisible && (
            <div className="mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    {group}
                  </p>
                  {items.map((item) => {
                    const flatIdx = suggestions.indexOf(item)
                    const isActive = flatIdx === activeIdx
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault()
                          navigate(item.href)
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 text-left',
                          isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : '',
                        )}
                      >
                        <span className="flex-shrink-0 text-gray-400">{item.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                            {item.label}
                          </span>
                          <span className="block truncate text-xs text-gray-400 dark:text-slate-500">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
