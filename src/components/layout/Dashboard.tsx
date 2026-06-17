import { StatCard } from '@/components/ui/StatsCard'
import { MonthlySalesChart } from '@/components/ui/BarCharts'
import { TopSellingChart } from '@/components/ui/TopSellingChart'
import { TransactionTable } from '@/components/transaction/TransactionTable'
import Image from 'next/image'

export default function Dashboard() {
  return (
    <div className="space-y-6 pt-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Card 1 — sm: full, md: half, lg: 3/12 */}
        <div className="lg:col-span-3">
          <StatCard
            label="Total Earning"
            value="$20,245"
            trend={{ percentage: 12, direction: 'up', label: '$19,054 Last month' }}
            icon={<Image src="/info.svg" alt="" width={15} height={15} />}
          />
        </div>

        {/* Card 2 — sm: full, md: half, lg: 3/12 */}
        <div className="lg:col-span-3">
          <StatCard
            label="In Progress"
            value="15 Sales"
            trend={{ percentage: 14, direction: 'down', label: '26 Sales yesterday' }}
            icon={<Image src="/info.svg" alt="" width={15} height={15} />}
          />
        </div>

        {/* Card 3 — sm: full, md: full row, lg: 3/12 */}
        <div className="md:col-span-2 lg:col-span-3">
          <StatCard
            label="Store Visitors"
            value="132 Visitors"
            trend={{ percentage: 16, direction: 'down', label: '150 visitors yesterday' }}
            icon={<Image src="/info.svg" alt="" width={15} height={15} />}
          />
        </div>

        {/* Top Selling — sm: full, md: full row, lg: 3/12 spanning 2 rows */}
        <div className="md:col-span-2 lg:col-span-3 lg:row-span-2">
          <TopSellingChart />
        </div>

        {/* Monthly Sales — sm: full, md: full row, lg: 9/12 */}
        <div className="md:col-span-2 lg:col-span-9">
          <MonthlySalesChart />
        </div>
      </div>

      <TransactionTable />
    </div>
  )
}
