'use client'

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

const chartData = [
  { name: 'Beef Steak', value: 230 },
  { name: 'Pizza', value: 230 },
  { name: 'BBQ Ribs', value: 230 },
  { name: 'French Fries', value: 230 },
  { name: 'Mushroom', value: 230 },
]

const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#eab308', '#a855f7']

export function TopSellingChart() {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100 ">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex gap-2 items-center">
          Top Selling Items{' '}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.00002 0.666626C3.94993 0.666626 0.666687 3.94987 0.666687 7.99996C0.666687 12.05 3.94993 15.3333 8.00002 15.3333C12.0501 15.3333 15.3334 12.05 15.3334 7.99996C15.3334 3.94987 12.0501 0.666626 8.00002 0.666626ZM8.00002 4.66663C7.63183 4.66663 7.33335 4.9651 7.33335 5.33329C7.33335 5.70148 7.63183 5.99996 8.00002 5.99996H8.00669C8.37488 5.99996 8.67335 5.70148 8.67335 5.33329C8.67335 4.9651 8.37488 4.66663 8.00669 4.66663H8.00002ZM8.66669 7.99996C8.66669 7.63177 8.36821 7.33329 8.00002 7.33329C7.63183 7.33329 7.33335 7.63177 7.33335 7.99996V10.6666C7.33335 11.0348 7.63183 11.3333 8.00002 11.3333C8.36821 11.3333 8.66669 11.0348 8.66669 10.6666V7.99996Z"
              fill="#E2E2E3"
            />
          </svg>
        </h3>
        <div className="border rounded-[9px] py-3 px-2 border-gray-200 mb-2">
          <svg
            width="13"
            height="4"
            viewBox="0 0 13 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.24023 0.117188C6.63779 0.117188 6.9758 0.257226 7.25977 0.541016C7.5437 0.824948 7.68397 1.16264 7.68359 1.55957V1.56055C7.6835 1.9581 7.54371 2.29613 7.25977 2.58008C6.97584 2.864 6.63813 3.0033 6.24121 3.00293H6.24023C5.84266 3.00284 5.50466 2.86306 5.2207 2.5791C4.93678 2.29514 4.79743 1.95752 4.79785 1.56055C4.79785 1.16295 4.93783 0.824999 5.22168 0.541016C5.50566 0.257032 5.84321 0.116759 6.24023 0.117188ZM10.9209 0.117188C11.3185 0.117188 11.6564 0.257155 11.9404 0.541016C12.2244 0.824948 12.3646 1.16264 12.3643 1.55957V1.56055C12.3642 1.95811 12.2234 2.29613 11.9395 2.58008C11.6555 2.86386 11.3178 3.00341 10.9209 3.00293C10.5232 3.00289 10.1854 2.86309 9.90137 2.5791C9.61739 2.29512 9.47712 1.95756 9.47754 1.56055C9.47754 1.1629 9.61842 0.825021 9.90234 0.541016C10.1864 0.256981 10.5238 0.116709 10.9209 0.117188ZM1.55957 0.117188H1.56055C1.95811 0.11728 2.29613 0.257068 2.58008 0.541016C2.86401 0.824947 3.00331 1.16264 3.00293 1.55957V1.56055C3.00284 1.95811 2.86305 2.29613 2.5791 2.58008C2.29514 2.86399 1.95751 3.00335 1.56055 3.00293C1.16295 3.00293 0.824996 2.86294 0.541016 2.5791C0.257038 2.29512 0.116765 1.95756 0.117188 1.56055C0.117188 1.163 0.257235 0.824976 0.541016 0.541016C0.824948 0.257083 1.16264 0.116809 1.55957 0.117188Z"
              fill="#888888"
              stroke="white"
              stroke-width="0.234023"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col  items-center justify-between">
        {/* Donut Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              startAngle={220}
              endAngle={-40}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with sales counts */}
      </div>
      <div className="space-y-3">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <div className="flex gap-2 items-center min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[idx] }}
              />
              <span className="text-sm text-gray-700 truncate">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
              {item.value} Sales
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
