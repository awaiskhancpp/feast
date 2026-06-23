import type { CollectionConfig } from 'payload'

export const Dishes: CollectionConfig = {
  slug: 'dishes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'price'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'category', type: 'relationship', required: true, relationTo: 'dish-categories' },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'description', type: 'textarea', required: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    // Lets a dish be hidden from the order screen without deleting it
    // (86'd item, seasonal item, etc.) - cheaper than a hard delete.
    { name: 'inStock', type: 'checkbox', defaultValue: true },
  ],
}
