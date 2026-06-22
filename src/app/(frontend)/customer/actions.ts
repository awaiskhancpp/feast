'use server'

import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@/payload.config'

export interface CreateCustomerState {
  error?: string
  success?: boolean
}

export async function createCustomer(
  _prevState: CreateCustomerState,
  formData: FormData,
): Promise<CreateCustomerState> {
  const firstName = String(formData.get('firstName') || '').trim()
  const lastName = String(formData.get('lastName') || '').trim()
  const phoneNumber = String(formData.get('phoneNumber') || '').trim()
  const address = String(formData.get('address') || '').trim()
  const status = String(formData.get('status') || 'guest')

  if (!firstName || !lastName || !phoneNumber || !address) {
    return { error: 'Please fill in every field before creating the customer.' }
  }
  if (status !== 'member' && status !== 'guest') {
    return { error: 'Invalid status.' }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    await payload.create({
      collection: 'customers',
      data: { firstName, lastName, phoneNumber, address, status },
    })
  } catch {
    return { error: 'Could not create customer. Please try again.' }
  }

  revalidatePath('/customer')
  return { success: true }
}
