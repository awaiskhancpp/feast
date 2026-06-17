'use client'

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
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Sales</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm text-gray-600">Food</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-300" />
            <span className="text-sm text-gray-600">Drink</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <span className="text-xl">⋯</span>
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} />
          <Bar
            dataKey="food"
            stackId="a"
            fill="#1e40af"
            radius={[0, 0, 8, 8]}
            stroke="#ffffff"
            strokeWidth={2}
          />

          <Bar
            dataKey="drink"
            stackId="a"
            fill="#bfdbfe"
            radius={[8, 8, 0, 0]}
            stroke="#ffffff"
            strokeWidth={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
