'use server'

import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import config from '@/payload.config'

import { isPositiveMoney, isRequired } from '@/lib/validation'
import { isDuplicateKeyError } from '@/lib/payloadErrors'

export interface DishFormState {
  error?: string
  success?: boolean
}

export interface CategoryFormState {
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
  const uniqueName = `${Date.now()}-${file.name}`
  const mediaDoc = await payload.create({
    collection: 'media',
    data: { alt: altText },
    file: { data: buffer, mimetype: file.type, name: uniqueName, size: file.size },
  })
  return mediaDoc.id
}

function readDishFields(formData: FormData) {
  return {
    name: String(formData.get('name') || '').trim(),
    category: Number(formData.get('category')),
    price: Number(formData.get('price')),
    description: String(formData.get('description') || '').trim(),
    inStock: formData.get('inStock') === 'on',
  }
}
export async function createDishCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = String(formData.get('name') || '').trim()
  const slug = String(formData.get('slug') || '').trim()

  const iconFile = formData.get('icon')
  const iconHighlightedFile = formData.get('iconHighlighted')

  if (!name || !slug) {
    return { error: 'Name and slug are required.' }
  }

  if (!(iconFile instanceof File) || iconFile.size === 0) {
    return { error: 'Default icon is required.' }
  }

  if (!(iconHighlightedFile instanceof File) || iconHighlightedFile.size === 0) {
    return { error: 'Highlighted icon is required.' }
  }

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Upload default icon
    const iconBuffer = Buffer.from(await iconFile.arrayBuffer())
    const iconMedia = await payload.create({
      collection: 'media',
      data: { alt: name },
      file: {
        data: iconBuffer,
        mimetype: iconFile.type,
        name: iconFile.name,
        size: iconFile.size,
      },
    })

    // Upload highlighted icon
    const highlightedBuffer = Buffer.from(await iconHighlightedFile.arrayBuffer())
    const iconHighlightedMedia = await payload.create({
      collection: 'media',
      data: { alt: `${name} highlighted` },
      file: {
        data: highlightedBuffer,
        mimetype: iconHighlightedFile.type,
        name: iconHighlightedFile.name,
        size: iconHighlightedFile.size,
      },
    })

    await payload.create({
      collection: 'dish-categories',
      data: {
        name,
        slug,
        icon: iconMedia.id,
        iconHighlighted: iconHighlightedMedia.id,
      },
    })

    revalidatePath('/dishes')

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create category.' }
  }
}

async function findDishByName(
  payload: Awaited<ReturnType<typeof getPayload>>,
  name: string,
  excludeId?: string,
) {
  // Payload's `where: { name: { equals } }` is case-sensitive on Postgres, so
  // "Bruschetta" wouldn't catch a duplicate "bruschetta". Fetching just the
  // id/name columns and comparing in JS keeps this correct without depending
  // on adapter-specific case-insensitive operators, and dish catalogs are
  // small enough that this stays cheap.
  const existing = await payload.find({
    collection: 'dishes',
    limit: 0,
    pagination: false,
    select: { name: true },
  })

  const normalized = name.trim().toLowerCase()
  return existing.docs.find(
    (doc) => String(doc.id) !== excludeId && doc.name.trim().toLowerCase() === normalized,
  )
}

export async function createDish(_prev: DishFormState, formData: FormData): Promise<DishFormState> {
  const { name, category, price, description, inStock } = readDishFields(formData)

  if (!isRequired(name) || !category || !isRequired(description) || !isPositiveMoney(price)) {
    return { error: 'Please fill in every field with a valid positive price.' }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  if (await findDishByName(payload, name)) {
    return { error: `A dish named "${name}" already exists.` }
  }

  try {
    const image = await uploadImageIfPresent(payload, formData, name)
    await payload.create({
      collection: 'dishes',
      data: {
        name,
        category,
        price,
        description,
        inStock,
        image,
      },
    })
  } catch (error) {
    // The pre-check above closes the common case; this catches the rare
    // race where two submissions for the same name land at almost the same
    // moment, so the unique constraint is still the actual source of truth.
    if (isDuplicateKeyError(error)) {
      return { error: `A dish named "${name}" already exists.` }
    }
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

  if (!isRequired(name) || !category || !isRequired(description) || !isPositiveMoney(price)) {
    return { error: 'Please fill in every field with a valid positive price.' }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  if (await findDishByName(payload, name, dishId)) {
    return { error: `A dish named "${name}" already exists.` }
  }

  try {
    const image = await uploadImageIfPresent(payload, formData, name)
    await payload.update({
      collection: 'dishes',
      id: dishId,
      data: image
        ? { name, category, price, description, inStock, image }
        : { name, category, price, description, inStock },
    })
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: `A dish named "${name}" already exists.` }
    }
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
