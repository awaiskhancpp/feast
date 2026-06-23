import type { CollectionConfig } from 'payload'

export const DishCategories: CollectionConfig = {
  slug: 'dish-categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'icon',
      label: 'Icon (Default / Inactive state)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'iconHighlighted',
      label: 'Icon (Highlighted / Active state)',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
