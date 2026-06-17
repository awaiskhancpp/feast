import Image from 'next/image'
interface StatCardProps {
  label: string
  value: string | number
  trend?: {
    percentage: number
    direction: 'up' | 'down'
    label: string
  }
  icon?: React.ReactNode
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center">
        <div className="flex  items-center gap-2 ">
          <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
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
            strokeWidth="0.234023"
          />
        </svg>
      </div>

      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {trend && (
        <div className="flex items-center gap-2">
          {/* Icon instead of text arrow */}
          <div
            className={`flex gap-2 border  px-2 py-1 rounded-full ${trend.direction === 'up' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'} `}
          >
            <Image
              src={trend.direction === 'up' ? '/icons/upArrow.svg' : '/icons/downArrow.svg'}
              alt={trend.direction}
              width={14}
              height={14}
            />

            <span
              className={`text-xs font-semibold   ${
                trend.direction === 'up' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
              }`}
            >
              {trend.percentage}%
            </span>
          </div>

          <span className="text-xs text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
