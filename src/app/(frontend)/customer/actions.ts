'use server'

import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@/payload.config'
import { isRequired, isValidName, isValidUSPhone, normalizeUSPhone } from '@/lib/validation'
import { isDuplicateKeyError } from '@/lib/payloadErrors'

export interface CreateCustomerState {
  error?: string
  success?: boolean
}

async function findCustomerByPhone(
  payload: Awaited<ReturnType<typeof getPayload>>,
  phoneNumber: string,
) {
  // Same reasoning as the dish-name check: compare normalized digits in JS
  // rather than the raw stored string, so "(319) 555-0115" and
  // "319-555-0115" are recognized as the same number.
  const existing = await payload.find({
    collection: 'customers',
    limit: 0,
    pagination: false,
    select: { phoneNumber: true },
  })

  const normalized = normalizeUSPhone(phoneNumber)
  return existing.docs.find((doc) => normalizeUSPhone(doc.phoneNumber) === normalized)
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

  if (!isValidName(firstName) || !isValidName(lastName)) {
    return { error: 'Please enter a valid first and last name.' }
  }
  if (!isValidUSPhone(phoneNumber)) {
    return { error: 'Please enter a valid US phone number.' }
  }
  if (!isRequired(address) || address.length < 5) {
    return { error: 'Please enter a valid address.' }
  }
  if (status !== 'member' && status !== 'guest') {
    return { error: 'Invalid status.' }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  if (await findCustomerByPhone(payload, phoneNumber)) {
    return { error: 'A customer with this phone number already exists.' }
  }

  try {
    await payload.create({
      collection: 'customers',
      data: { firstName, lastName, phoneNumber, address, status },
    })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: 'A customer with this phone number already exists.' }
    }
    return { error: 'Could not create customer. Please try again.' }
  }

  revalidatePath('/customer')
  return { success: true }
}
