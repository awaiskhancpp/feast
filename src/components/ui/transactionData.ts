import type { Transaction } from './transactionTypes'

export const transactions: Transaction[] = [
  {
    id: '1',
    order: '#001',
    date: '2024-05-01',
    table: 'T-4',
    items: 12,
    amount: '$24.00',
    status: 'Success',
    details: [
      {
        name: 'Bruschetta',
        note: 'Not Spicy',
        quantity: 2,
        price: '$6.50',
        image:
          'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Garlic Bread',
        note: 'Not Spicy',
        quantity: 1,
        price: '$5.00',
        image:
          'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Coffee',
        note: 'Hot',
        quantity: 2,
        price: '$6.00',
        image:
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=240&q=80',
      },
    ],
  },
  {
    id: '2',
    order: '#002',
    date: '2024-05-01',
    table: 'T-10',
    items: 7,
    amount: '$32.71',
    status: 'Success',
    details: [
      {
        name: 'Calamary',
        note: 'Spicy Lv.5',
        quantity: 2,
        price: '$16.00',
        image:
          'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Chicken Wings',
        note: 'Spicy Lv.2',
        quantity: 2,
        price: '$19.00',
        image:
          'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Nachos',
        note: 'Not Spicy',
        quantity: 1,
        price: '$7.50',
        image:
          'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Onion Rings',
        note: 'Spicy Lv.5',
        quantity: 2,
        price: '$12.00',
        image:
          'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=240&q=80',
      },
    ],
  },
  {
    id: '3',
    order: '#003',
    date: '2024-05-02',
    table: 'T-12',
    items: 6,
    amount: '$60.00',
    status: 'Cancel',
    details: [
      {
        name: 'Mini Tacos',
        note: 'Not Spicy',
        quantity: 2,
        price: '$8.50',
        image:
          'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Hummus Platter',
        note: 'Not Spicy',
        quantity: 1,
        price: '$8.00',
        image:
          'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Tempura Shrimp',
        note: 'Spicy Lv.2',
        quantity: 2,
        price: '$9.50',
        image:
          'https://images.unsplash.com/photo-1625938146369-adc83368b5dd?auto=format&fit=crop&w=240&q=80',
      },
    ],
  },
  {
    id: '4',
    order: '#004',
    date: '2024-05-03',
    table: 'T-8',
    items: 20,
    amount: '$25.00',
    status: 'Success',
    details: [
      {
        name: 'French fries',
        note: 'Not Spicy',
        quantity: 4,
        price: '$4.50',
        image:
          'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Mushrooms',
        note: 'Not Spicy',
        quantity: 2,
        price: '$7.50',
        image:
          'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=240&q=80',
      },
      {
        name: 'Spring Rolls',
        note: 'Not Spicy',
        quantity: 2,
        price: '$6.50',
        image:
          'https://images.unsplash.com/photo-1548811256-1627d99e7a72?auto=format&fit=crop&w=240&q=80',
      },
    ],
  },
]
