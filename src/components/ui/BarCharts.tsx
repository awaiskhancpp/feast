'use client'
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useIsDarkMode } from '@/lib/useisDarkMode'

const chartData = [
  { month: 'Jan', food: 250, drink: 150 },
  { month: 'Feb', food: 380, drink: 220 },
  { month: 'Mar', food: 280, drink: 170 },
  { month: 'Apr', food: 340, drink: 210 },
  { month: 'May', food: 200, drink: 150 },
  { month: 'Jun', food: 540, drink: 330, highlight: true },
  { month: 'Jul', food: 450, drink: 300 },
  { month: 'Aug', food: 300, drink: 200 },
  { month: 'Sep', food: 360, drink: 240 },
  { month: 'Oct', food: 420, drink: 280 },
  { month: 'Nov', food: 390, drink: 260 },
  { month: 'Dec', food: 310, drink: 190 },
]

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = data.food + data.drink
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700">
        <p className="font-semibold">${total.toLocaleString()}</p>
        <p className="text-xs text-gray-300">{data.month} 2024</p>
      </div>
    )
  }
  return null
}

export function MonthlySalesChart() {
  const [isMobile, setIsMobile] = useState(false)
  const isDark = useIsDarkMode()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Sales</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm text-gray-600 dark:text-slate-300">Food</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-300" />
            <span className="text-sm text-gray-600 dark:text-slate-300">Drink</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
            <span className="text-xl">⋯</span>
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: isMobile ? 5 : 30,
            left: isMobile ? -20 : 0,
            bottom: 0,
          }}
          barCategoryGap={isMobile ? '30%' : '15%'}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#1e293b' : '#f0f0f0'}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            interval={isMobile ? 1 : 0}
            stroke={isDark ? '#64748b' : '#9ca3af'}
            style={{ fontSize: '12px' }}
            axisLine={{ stroke: isDark ? '#334155' : '#e5e7eb' }}
          />
          <YAxis
            hide={isMobile}
            stroke={isDark ? '#64748b' : '#9ca3af'}
            style={{ fontSize: '12px' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
          <Bar
            dataKey="food"
            stackId="a"
            fill="#1e40af"
            radius={[0, 0, 8, 8]}
            stroke={isDark ? '#0f172a' : '#ffffff'}
            strokeWidth={2}
          />

          <Bar
            dataKey="drink"
            stackId="a"
            fill="#bfdbfe"
            radius={[8, 8, 0, 0]}
            stroke={isDark ? '#0f172a' : '#ffffff'}
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
