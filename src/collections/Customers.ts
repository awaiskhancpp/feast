import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'lastName', 'phoneNumber', 'status'],
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'phoneNumber', type: 'text', required: true },
    { name: 'address', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'guest',
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Guest', value: 'guest' },
      ],
    },
  ],
}
