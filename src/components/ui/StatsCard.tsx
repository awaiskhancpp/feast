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
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
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
