// ─── Chef Dashboard Types ───────────────────────────────────────────────────

export type ChefOrderStatus = 'pending' | 'preparing' | 'completed';
export type ActiveView = 'pending' | 'preparing' | 'completed';

export interface OrderItem {
  id: number;
  itemName: string;
  qty: number;
  price: number;
  note?: string;
  isNew?: boolean;
}

export interface ChefOrder {
  id: number;
  ticketNo: string;
  tableNumber: number;
  section: string;
  guestCount: number;
  status: ChefOrderStatus;
  items: OrderItem[];
  createdAt: string;
  timerMinutes?: number;
  notes?: string;
}

export interface POSNotif {
  id: number;
  type?: string;
  message: string;
  detail?: string;
  tableNumber: number;
  ticketNo: string;
  isRead?: boolean;
  createdAt: string;
}

// ─── Initial Chef Dashboard Mock Data ───────────────────────────────────────

export const INITIAL_ORDERS: ChefOrder[] = [
  {
    id: 101,
    ticketNo: '#8942',
    tableNumber: 4,
    section: 'Main Dining',
    guestCount: 4,
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
    timerMinutes: 4,
    notes: 'Mild spice level for Butter Chicken',
    items: [
      { id: 1, itemName: 'Butter Chicken', qty: 2, price: 600, note: 'Mild spice' },
      { id: 2, itemName: 'Garlic Naan', qty: 4, price: 120 },
      { id: 3, itemName: 'Dal Makhani', qty: 1, price: 450 },
      { id: 4, itemName: 'Mango Lassi', qty: 2, price: 180, isNew: true },
    ]
  },
  {
    id: 102,
    ticketNo: '#8945',
    tableNumber: 1,
    section: 'Main Dining',
    guestCount: 2,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    timerMinutes: 2,
    notes: 'No ice in Sweet Lassi',
    items: [
      { id: 5, itemName: 'Veg Biryani', qty: 1, price: 480 },
      { id: 6, itemName: 'Sweet Lassi', qty: 2, price: 160 },
      { id: 7, itemName: 'Paneer 65', qty: 1, price: 320, isNew: true },
    ]
  },
  {
    id: 103,
    ticketNo: '#8940',
    tableNumber: 7,
    section: 'Main Dining',
    guestCount: 2,
    status: 'preparing',
    createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
    timerMinutes: 14,
    notes: 'Serve Paneer Tikka sizzling hot',
    items: [
      { id: 8, itemName: 'Paneer Tikka', qty: 1, price: 350 },
      { id: 9, itemName: 'Dal Makhani', qty: 2, price: 450 },
      { id: 10, itemName: 'Garlic Naan', qty: 3, price: 120 },
    ]
  },
  {
    id: 104,
    ticketNo: '#8936',
    tableNumber: 9,
    section: 'Private Room',
    guestCount: 8,
    status: 'preparing',
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    timerMinutes: 22,
    notes: 'Extra gravy for Rogan Josh',
    items: [
      { id: 11, itemName: 'Mutton Rogan Josh', qty: 3, price: 680 },
      { id: 12, itemName: 'Steamed Basmati Rice', qty: 3, price: 180 },
      { id: 13, itemName: 'Tandoori Roti', qty: 8, price: 60 },
    ]
  },
  {
    id: 105,
    ticketNo: '#8938',
    tableNumber: 2,
    section: 'Main Dining',
    guestCount: 6,
    status: 'completed',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    timerMinutes: 35,
    items: [
      { id: 14, itemName: 'Chicken Biryani', qty: 2, price: 550 },
      { id: 15, itemName: 'Raita', qty: 2, price: 120 },
      { id: 16, itemName: 'Gulab Jamun', qty: 4, price: 150 },
    ]
  }
];
