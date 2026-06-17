import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import './styles.css'
import { StatCard } from '@/components/ui/StatsCard'
import { MonthlySalesChart } from '@/components/ui/BarCharts'
import { TopSellingChart } from '@/components/ui/TopSellingChart'
import { TransactionTable } from '@/components/ui/TransactionTable'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <StatCard
            label="Total Earning"
            value="$20,245"
            trend={{ percentage: 12, direction: 'up', label: '$19,054 Last month' }}
          />
        </div>
        <div className="col-span-3">
          <StatCard
            label="In Progress"
            value="15 Sales"
            trend={{ percentage: 14, direction: 'down', label: '26 Sales yesterday' }}
          />
        </div>
        <div className="col-span-3">
          <StatCard
            label="Store Visitors"
            value="132 Visitors"
            trend={{ percentage: 16, direction: 'down', label: '150 visitors yesterday' }}
          />
        </div>
        <div className="col-span-3 row-span-2">
          <TopSellingChart />
        </div>
        <div className="col-span-9">
          <MonthlySalesChart />
        </div>
      </div>
      <TransactionTable />
    </div>
  )
}
