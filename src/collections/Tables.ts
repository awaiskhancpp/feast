import type { CollectionConfig } from 'payload'

export const Tables: CollectionConfig = {
  slug: 'tables',
  admin: {
    useAsTitle: 'tableNumber',
    defaultColumns: ['tableNumber', 'status', 'shape'],
  },
  fields: [
    // Separate from Payload's own `id` on purpose: the doc id is the stable
    // identity used for updates/deletes, tableNumber is just the "T-24" label
    // staff see - decoupling them means renumbering a table is just an edit,
    // never a primary-key change.
    { name: 'tableNumber', type: 'text', required: true, unique: true },
    {
      name: 'shape',
      type: 'select',
      required: true,
      defaultValue: 'vertical',
      options: [
        { label: 'Vertical (4-seat)', value: 'vertical' },
        { label: 'Horizontal (8-seat)', value: 'horizontal' },
      ],
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
    // Canvas-space coordinates (top-left corner) within the fixed floor.
    { name: 'x', type: 'number', required: true, defaultValue: 0 },
    { name: 'y', type: 'number', required: true, defaultValue: 0 },
    { name: 'time', type: 'text' },
  ],
}
