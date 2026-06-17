import { headers as getHeaders } from 'next/headers.js'

import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.css'
import Dashboard from '@/components/layout/Dashboard'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  return (
    <div className="px-4 xl:px-8 pb-8 pt-2">
      <Dashboard />
    </div>
  )
}
