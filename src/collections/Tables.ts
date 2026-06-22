import type { CollectionConfig } from 'payload'

export const Tables: CollectionConfig = {
  slug: 'tables',
  admin: {
    useAsTitle: 'tableNumber',
    defaultColumns: ['tableNumber', 'status', 'shape', 'chairs'],
  },
  fields: [
    { name: 'tableNumber', type: 'text', required: true, unique: true },
    {
      name: 'shape',
      type: 'select',
      required: true,
      defaultValue: 'vertical',
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
      ],
    },
    {
      name: 'chairs',
      type: 'number',
      required: true,
      defaultValue: 6,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Billed', value: 'billed' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Dine in', value: 'dine' },
      ],
    },
    { name: 'x', type: 'number', required: true, defaultValue: 0 },
    { name: 'y', type: 'number', required: true, defaultValue: 0 },
    { name: 'time', type: 'text' },
  ],
}
