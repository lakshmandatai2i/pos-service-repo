// ─── Types ────────────────────────────────────────────────────────────────────

export type TableStatus = 'available' | 'occupied' | 'preparing' | 'prepared' | 'ready' | 'closed';

export type NotificationType = 'order_created' | 'kitchen_preparing' | 'kitchen_ready' | 'payment_completed' | 'item_added' | 'low_stock' | 'order_sent';
export type ActiveView = 'tables' | 'notifications' | 'settings';



export interface TableOrder {
  id: number;
  itemName: string;
  qty: number;
  price: number;
  note?: string;
  isNew?: boolean;
}

export interface RestaurantTable {
  id: number;
  number: number;
  capacity: number;
  section: string;
  status: TableStatus;
  ticketNo?: string;
  courseProgress?: string;
  orders: TableOrder[];
  startedAt?: string;
}

export interface POSNotif {
  id: number;
  type: NotificationType;
  message: string;
  detail?: string;
  tableNumber?: number;
  ticketNo?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Mock Tables ──────────────────────────────────────────────────────────────

export const MOCK_TABLES: RestaurantTable[] = [
  {
    id: 4, number: 4, capacity: 4, section: 'Main Dining', status: 'occupied',
    ticketNo: '#8942', startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    orders: [
      { id: 1, itemName: 'Butter Chicken', qty: 2, price: 600, note: 'Mild spice' },
      { id: 2, itemName: 'Garlic Naan', qty: 4, price: 120 },
      { id: 3, itemName: 'Dal Makhani', qty: 1, price: 450 },
      { id: 4, itemName: 'Mango Lassi', qty: 2, price: 180, isNew: true },
    ],
  },
  {
    id: 7, number: 7, capacity: 2, section: 'Main Dining', status: 'preparing',
    ticketNo: '#8940', courseProgress: 'Course 2/3', startedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    orders: [
      { id: 5, itemName: 'Paneer Tikka', qty: 1, price: 350 },
      { id: 6, itemName: 'Dal Makhani', qty: 2, price: 450 },
      { id: 7, itemName: 'Garlic Naan', qty: 3, price: 120 },
    ],
  },
  { id: 12, number: 12, capacity: 4, section: 'Patio', status: 'available', orders: [] },
  {
    id: 2, number: 2, capacity: 6, section: 'Main Dining', status: 'ready',
    ticketNo: '#8938', startedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    orders: [
      { id: 8, itemName: 'Chicken Biryani', qty: 2, price: 550 },
      { id: 9, itemName: 'Raita', qty: 2, price: 120 },
      { id: 10, itemName: 'Gulab Jamun', qty: 4, price: 150 },
    ],
  },
  { id: 5, number: 5, capacity: 2, section: 'Patio', status: 'available', orders: [] },
  { id: 8, number: 8, capacity: 4, section: 'Private Room', status: 'available', orders: [] },

  {
    id: 1, number: 1, capacity: 2, section: 'Main Dining', status: 'occupied',
    ticketNo: '#8945', startedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    orders: [
      { id: 11, itemName: 'Veg Biryani', qty: 1, price: 480 },
      { id: 12, itemName: 'Sweet Lassi', qty: 2, price: 160 },
    ],
  },
  {
    id: 9, number: 9, capacity: 8, section: 'Private Room', status: 'preparing',
    ticketNo: '#8936', courseProgress: 'Course 1/3', startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    orders: [
      { id: 13, itemName: 'Mutton Rogan Josh', qty: 3, price: 680 },
      { id: 14, itemName: 'Steamed Basmati Rice', qty: 3, price: 180 },
      { id: 15, itemName: 'Tandoori Roti', qty: 8, price: 60 },
    ],
  },
];

export const MOCK_NOTIFS: POSNotif[] = [
  { id: 1, type: 'kitchen_ready', message: 'Table 2 order is ready to serve!', detail: 'Chicken Biryani, Raita, Gulab Jamun are prepared.', tableNumber: 2, isRead: false, createdAt: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: 2, type: 'kitchen_ready', message: 'Table 5 order is ready to serve!', detail: 'Paneer Tikka, Dal Makhani, Garlic Naan are prepared.', tableNumber: 5, isRead: false, createdAt: new Date(Date.now() - 6 * 60000).toISOString() },
  { id: 3, type: 'kitchen_ready', message: 'Table 9 order is ready to serve!', detail: 'Mutton Rogan Josh, Steamed Basmati Rice are prepared.', tableNumber: 9, isRead: true, createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
];

