'use server'

import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@/payload.config'
import { DISH_CATEGORIES, type DishCategoryValue } from '@/lib/dishCategories'
import { isPositiveMoney, isRequired } from '@/lib/validation'

export interface DishFormState {
  error?: string
  success?: boolean
}

async function uploadImageIfPresent(
  payload: Awaited<ReturnType<typeof getPayload>>,
  formData: FormData,
  altText: string,
): Promise<number | undefined> {
  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) return undefined

  const buffer = Buffer.from(await file.arrayBuffer())
  const mediaDoc = await payload.create({
    collection: 'media',
    data: { alt: altText },
    file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
  })
  return mediaDoc.id
}

function isDishCategory(value: string): value is DishCategoryValue {
  return DISH_CATEGORIES.some((c) => c.value === value)
}

function readDishFields(formData: FormData) {
  return {
    name: String(formData.get('name') || '').trim(),
    category: String(formData.get('category') || ''),
    price: Number(formData.get('price')),
    description: String(formData.get('description') || '').trim(),
    inStock: formData.get('inStock') === 'on',
  }
}

export async function createDish(_prev: DishFormState, formData: FormData): Promise<DishFormState> {
  const { name, category, price, description, inStock } = readDishFields(formData)

  if (
    !isRequired(name) ||
    !isDishCategory(category) ||
    !isRequired(description) ||
    !isPositiveMoney(price)
  ) {
    return { error: 'Please fill in every field with a valid positive price.' }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const image = await uploadImageIfPresent(payload, formData, name)
    await payload.create({
      collection: 'dishes',
      data: { name, category, price, description, inStock, image },
    })
  } catch {
    return { error: 'Could not create the dish. Please try again.' }
  }

  revalidatePath('/dishes')
  return { success: true }
}

export async function updateDish(
  dishId: string,
  _prev: DishFormState,
  formData: FormData,
): Promise<DishFormState> {
  const { name, category, price, description, inStock } = readDishFields(formData)

  if (
    !isRequired(name) ||
    !isDishCategory(category) ||
    !isRequired(description) ||
    !isPositiveMoney(price)
  ) {
    return { error: 'Please fill in every field with a valid positive price.' }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const image = await uploadImageIfPresent(payload, formData, name)
    await payload.update({
      collection: 'dishes',
      id: dishId,
      data: image
        ? { name, category, price, description, inStock, image }
        : { name, category, price, description, inStock },
    })
  } catch {
    return { error: 'Could not update the dish. Please try again.' }
  }

  revalidatePath('/dishes')
  return { success: true }
}

export async function deleteDish(dishId: string): Promise<{ error?: string }> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    await payload.delete({ collection: 'dishes', id: dishId })
  } catch {
    return { error: 'Could not delete the dish.' }
  }

  revalidatePath('/dishes')
  return {}
}
