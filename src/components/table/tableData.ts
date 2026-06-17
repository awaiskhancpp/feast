import type {
  Customer,
  MenuCategory,
  MenuItem,
  TableItem,
  TableStatus,
  TableStatusMeta,
} from './types'

export const STATUS_ORDER: TableStatus[] = ['available', 'billed', 'reserved', 'dine']

export const STATUS_META: Record<TableStatus, TableStatusMeta> = {
  available: {
    label: 'Available',
    color: '#5b5ff2',
    short: 'Avail',
    dotClass: 'bg-[#5b5ff2]',
    badgeClass: 'bg-[#5b5ff2] text-white',
  },
  billed: {
    label: 'Billed',
    color: '#07c85f',
    short: 'Bill',
    dotClass: 'bg-[#07c85f]',
    badgeClass: 'bg-[#07c85f] text-white',
  },
  reserved: {
    label: 'Reserved',
    color: '#f0b83f',
    short: 'Res',
    dotClass: 'bg-[#f0b83f]',
    badgeClass: 'bg-[#f0b83f] text-white',
  },
  dine: {
    label: 'Dine in',
    color: '#f4f5f9',
    short: 'Dine',
    dotClass: 'bg-[#f4f5f9] ring-1 ring-slate-200/70',
    badgeClass: 'bg-[#f4f5f9] text-[#858b96]',
  },
}

export const INITIAL_TABLES: TableItem[] = [
  { id: 24, x: 4, y: 38, shape: 'horizontal', status: 'available' },
  { id: 25, x: 352, y: -70, shape: 'vertical', status: 'available' },
  { id: 26, x: 130, y: 130, shape: 'vertical', status: 'dine', time: '03:22' },
  { id: 27, x: 212, y: 30, shape: 'vertical', status: 'reserved' },
  { id: 28, x: 336, y: 92, shape: 'vertical', status: 'dine' },
  { id: 29, x: 486, y: 92, shape: 'vertical', status: 'reserved' },
  { id: 30, x: 610, y: 32, shape: 'vertical', status: 'reserved' },
  { id: 31, x: 734, y: 92, shape: 'vertical', status: 'reserved' },
  { id: 32, x: 940, y: 38, shape: 'horizontal', status: 'billed' },
  { id: 33, x: -28, y: 222, shape: 'horizontal', status: 'dine', time: '03:22' },
  { id: 34, x: 212, y: 152, shape: 'vertical', status: 'billed' },
  { id: 35, x: 386, y: 222, shape: 'horizontal', status: 'dine', time: '03:22' },
]

export const CUSTOMERS: Customer[] = [
  { id: 'jacob-jones', name: 'Jacob Jones' },
  { id: 'nicolas-zelensky', name: 'Nicolas Zelensky' },
  { id: 'kristin-watson', name: 'Kristin Watson' },
  { id: 'floyd-miles', name: 'Floyd Miles' },
  { id: 'guy-hawkins', name: 'Guy Hawkins' },
  { id: 'leslie-alexander', name: 'Leslie Alexander' },
]

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'all', label: 'All Menu', count: 90, icon: 'all' },
  { id: 'appetizers', label: 'Appetizers', count: 15, icon: 'appetizers' },
  { id: 'drink', label: 'Drink', count: 12, icon: 'drink' },
  { id: 'desserts', label: 'Desserts', count: 12, icon: 'desserts' },
  { id: 'coffee', label: 'Coffee', count: 12, icon: 'coffee' },
  { id: 'main', label: 'Main Courses', count: 12, icon: 'main' },
  { id: 'salads', label: 'Salads', count: 12, icon: 'salads' },
  { id: 'seafood', label: 'Seafood', count: 12, icon: 'seafood' },
  { id: 'soup', label: 'Soup', count: 12, icon: 'soup' },
]

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: 'Bruschetta',
    category: 'appetizers',
    price: '$6,50',
    description: 'Toasted bread topped with a mix of fresh tomatoes, basil, and olive oil.',
    image:
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Calamari',
    category: 'appetizers',
    price: '$8,00',
    description: 'Lightly breaded and fried squid served with marinara sauce.',
    image:
      'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Cheese Platter',
    category: 'appetizers',
    price: '$12,00',
    description: 'Assorted cheeses with fruits, nuts, and crackers.',
    image:
      'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Chicken Wings',
    category: 'appetizers',
    price: '$9,50',
    description: 'Juicy wings tossed in your choice of sauce.',
    image:
      'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'Coconut Shrimp',
    category: 'seafood',
    price: '$9,00',
    description: 'Shrimp coated in coconut flakes and fried until crisp.',
    image:
      'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    name: 'French fries',
    category: 'appetizers',
    price: '$4,50',
    description: 'Golden and crispy potatoes, served hot with dipping sauce.',
    image:
      'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    name: 'Garlic Bread',
    category: 'appetizers',
    price: '$5,00',
    description: 'Warm, buttery bread infused with garlic and herbs.',
    image:
      'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 8,
    name: 'Hummus Platter',
    category: 'appetizers',
    price: '$8,00',
    description: 'Creamy hummus served with pita bread and fresh vegetables.',
    image:
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 9,
    name: 'Meatballs',
    category: 'main',
    price: '$7,00',
    description: 'Tender meatballs in marinara sauce, sprinkled with herbs.',
    image:
      'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 10,
    name: 'Mini Tacos',
    category: 'main',
    price: '$8,50',
    description: 'Small crispy tacos filled with seasoned meat, cheese, and salsa.',
    image:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 11,
    name: 'Mushrooms',
    category: 'appetizers',
    price: '$7,50',
    description: 'Mushrooms filled with a savory mixture of cheeses and herbs.',
    image:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 12,
    name: 'Nachos',
    category: 'appetizers',
    price: '$7,50',
    description: 'Tortilla chips loaded with melted cheese, jalapenos, salsa, and sour cream.',
    image:
      'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 13,
    name: 'Onion Rings',
    category: 'appetizers',
    price: '$6,00',
    description: 'Thick slices of onions, battered and fried to a golden crisp.',
    image:
      'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 14,
    name: 'Spring Rolls',
    category: 'appetizers',
    price: '$6,50',
    description: 'Light and crunchy rolls filled with vegetables, served with sauce.',
    image:
      'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 15,
    name: 'Tempura Shrimp',
    category: 'seafood',
    price: '$9,50',
    description: 'Light and crispy battered shrimp served with dipping sauce.',
    image:
      'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=600&q=80',
  },
]
