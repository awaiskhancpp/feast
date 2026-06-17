'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'

type NotificationType = 'payment-received' | 'discount' | 'new-order' | 'payment-success'
import Image from 'next/image'
interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  time: string
  unread: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'payment-received',
    title: 'Payment received for Order #002',
    time: '1 minutes ago',
    unread: false,
  },
  {
    id: '2',
    type: 'discount',
    title: 'Discount applied for Order #003',
    time: '2 minutes ago',
    unread: true,
  },
  {
    id: '3',
    type: 'new-order',
    title: 'You have a new order for Order #005',
    time: '16 minutes ago',
    unread: true,
  },
  {
    id: '4',
    type: 'payment-success',
    title: 'Payment successfull for Order #007',
    time: '1 hours ago',
    unread: false,
  },
  {
    id: '5',
    type: 'payment-received',
    title: 'Payment received for Order #008',
    time: '1 hours ago',
    unread: false,
  },
]

const iconStyles: Record<NotificationType, { icon: string; bg: string }> = {
  'payment-received': { icon: '/paymentReceived.svg', bg: 'bg-orange-50' },
  discount: { icon: '/discount.svg', bg: 'bg-violet-50' },
  'new-order': { icon: '/order.svg', bg: 'bg-rose-50' },
  'payment-success': { icon: '/paymentSuccessful.svg', bg: 'bg-emerald-50' },
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const rootRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-violet-200 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full mt-2 w-[400px] origin-top-right rounded-2xl border border-gray-100 bg-white shadow-xl transition-all duration-150 z-50 ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Notifications</h3>
          <button
            onClick={markAllAsRead}
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {notifications.map((n) => {
            const { icon, bg } = iconStyles[n.type]
            return (
              <div
                key={n.id}
                className={`group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50 ${
                  n.unread ? 'bg-violet-50/70' : 'bg-white'
                }`}
              >
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${bg}`}
                >
                  <Image src={icon} alt="" width={24} height={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-gray-900">{n.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{n.time}</p>
                </div>
                {n.unread && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
