'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import Image from 'next/image'

interface Event {
  id: string
  time: string
  type: 'arrived' | 'booked' | 'reserved' | 'noshow'
  table: string
}

const COLORS = {
  arrived: '#22c55e', // green
  booked: '#f59e0b', // yellow/orange
  reserved: '#3b82f6', // blue
  noshow: '#a78bfa', // purple
}

const TIME_SLOTS = ['T-26', 'T-28', 'T-31', 'T-33', 'T-35', 'T-37', 'T-41', 'T-47', 'T-50']

const EVENTS: Event[] = [
  { id: '1', time: 'T-26', type: 'booked', table: '1' },
  { id: '2', time: 'T-28', type: 'arrived', table: '2' },
  { id: '3', time: 'T-31', type: 'reserved', table: '3' },
  { id: '4', time: 'T-33', type: 'booked', table: '4' },
  { id: '5', time: 'T-35', type: 'arrived', table: '5' },
  { id: '6', time: 'T-37', type: 'booked', table: '6' },
  { id: '7', time: 'T-41', type: 'reserved', table: '7' },
  { id: '8', time: 'T-47', type: 'arrived', table: '8' },
]

export default function Table() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('Dine In')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const columns = 5

  return (
    <div className="bg-gray-900 text-white p-8 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Good Morning, Cris!</h1>
          <p className="text-gray-400 text-sm">
            Offer top-notch service to cater to your customers' needs.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            Export Data
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-8 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.arrived }} />
          <span>Arrived (3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.booked }} />
          <span>Booked (3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.reserved }} />
          <span>Reserved (1)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.noshow }} />
          <span>Show In (0)</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="grid gap-6 relative"
        style={{ gridTemplateColumns: `80px repeat(${columns}, 1fr)` }}
      >
        {/* Time column header */}
        <div />

        {/* Column headers */}
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`col-${i}`} className="text-center text-gray-400 text-xs font-semibold mb-4">
            Section {i + 1}
          </div>
        ))}

        {/* Rows */}
        {TIME_SLOTS.map((timeSlot) => (
          <div key={timeSlot} className="contents">
            {/* Time label */}
            <div className="flex items-start pt-4 text-sm text-gray-400 font-semibold">
              {timeSlot}
            </div>

            {/* Event cells */}
            {Array.from({ length: columns }).map((_, colIdx) => {
              const cellEvents = EVENTS.filter(
                (e) => e.time === timeSlot && parseInt(e.table) % columns === colIdx,
              )

              return (
                <div
                  key={`${timeSlot}-${colIdx}`}
                  className="relative h-32 bg-gray-800 rounded-lg border border-gray-700 p-3 flex flex-wrap gap-2 items-center justify-center content-center"
                >
                  {cellEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        style={{ backgroundColor: COLORS[event.type] }}
                      >
                        {event.table}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">{event.type}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Add new Order</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Guest Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                <input
                  type="text"
                  placeholder="Enter guest name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guest Count</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Table */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
                <input
                  type="text"
                  placeholder="Select table"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Order Location with Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Location
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left text-gray-900 flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {selectedLocation}
                    <ChevronDown
                      size={16}
                      className={`transition ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {['Dine In', 'Take Away', 'Delivery'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedLocation(option)
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-900 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  placeholder="Add any special requests..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={3}
                />
              </div>

              {/* Create Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg"
      >
        +
      </button>
    </div>
  )
}
