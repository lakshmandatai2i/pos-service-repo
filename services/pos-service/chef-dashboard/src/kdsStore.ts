// ─── KDS Real-Time Store & Cross-Tab Broadcast Channel ─────────────────────────

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface OrderItem {
  id: number;
  itemName: string;
  qty: number;
  price: number;
  note?: string;
  isNew?: boolean;
}

export interface KDSOrder {
  id: number;
  ticketNo: string;
  tableNumber: number;
  section?: string;
  guestCount?: number;
  waiterName?: string;
  status: OrderStatus;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  preparedAt?: string;
}

export interface KDSNotification {
  id: number;
  orderId: number;
  ticketNo: string;
  tableNumber: number;
  message: string;
  detail?: string;
  createdAt: string;
}

type EventCallback = (data: { type: 'NEW_ORDER' | 'STATUS_CHANGE' | 'ORDER_PREPARED'; order?: KDSOrder; notification?: KDSNotification; orders?: KDSOrder[] }) => void;

const STORAGE_KEY = 'kds_orders_list';
const CHANNEL_NAME = 'kds_kitchen_workflow_channel';

// Initial Mock Orders fallback
const DEFAULT_ORDERS: KDSOrder[] = [
  {
    id: 101,
    ticketNo: '#8942',
    tableNumber: 4,
    section: 'Main Dining',
    guestCount: 4,
    waiterName: 'John',
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
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
    waiterName: 'Sarah',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
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
    waiterName: 'John',
    status: 'preparing',
    createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
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
    waiterName: 'Alex',
    status: 'preparing',
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
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
    waiterName: 'Sarah',
    status: 'completed',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    preparedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    items: [
      { id: 14, itemName: 'Chicken Biryani', qty: 2, price: 550 },
      { id: 15, itemName: 'Raita', qty: 2, price: 120 },
      { id: 16, itemName: 'Gulab Jamun', qty: 4, price: 150 },
    ]
  }
];

// Helper to safely get orders from localStorage
export function getStoredOrders(): KDSOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse KDS orders', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
  return DEFAULT_ORDERS;
}

// Helper to save orders to localStorage
export function saveStoredOrders(orders: KDSOrder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save KDS orders', e);
  }
}

// Broadcast Channel instance
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  channel = new BroadcastChannel(CHANNEL_NAME);
}

// Send a new order to kitchen
export function sendOrderToKitchen(order: KDSOrder): KDSOrder[] {
  const currentOrders = getStoredOrders();
  const existingIdx = currentOrders.findIndex(o => o.tableNumber === order.tableNumber && o.status !== 'completed');
  let updatedOrders: KDSOrder[];
  if (existingIdx >= 0) {
    currentOrders[existingIdx] = { ...order, status: 'pending' };
    updatedOrders = [...currentOrders];
  } else {
    updatedOrders = [order, ...currentOrders];
  }
  saveStoredOrders(updatedOrders);

  const eventPayload = { type: 'NEW_ORDER' as const, order, orders: updatedOrders };
  channel?.postMessage(eventPayload);
  return updatedOrders;
}

// Update status of order (pending -> preparing -> completed)
export function updateOrderStatus(orderId: number, nextStatus: OrderStatus): { orders: KDSOrder[]; notification?: KDSNotification } {
  const currentOrders = getStoredOrders();
  let updatedOrder: KDSOrder | undefined;
  
  const updatedOrders = currentOrders.map(o => {
    if (o.id === orderId) {
      updatedOrder = {
        ...o,
        status: nextStatus,
        preparedAt: nextStatus === 'completed' ? new Date().toISOString() : o.preparedAt
      };
      return updatedOrder;
    }
    return o;
  });

  saveStoredOrders(updatedOrders);

  let notification: KDSNotification | undefined;
  if (nextStatus === 'completed' && updatedOrder) {
    notification = {
      id: Date.now(),
      orderId: updatedOrder.id,
      ticketNo: updatedOrder.ticketNo,
      tableNumber: updatedOrder.tableNumber,
      message: `Order ${updatedOrder.ticketNo} is prepared!`,
      detail: `Table ${updatedOrder.tableNumber} order is ready to serve.`,
      createdAt: new Date().toISOString()
    };
  }

  const payload = {
    type: nextStatus === 'completed' ? ('ORDER_PREPARED' as const) : ('STATUS_CHANGE' as const),
    order: updatedOrder,
    notification,
    orders: updatedOrders
  };

  channel?.postMessage(payload);
  return { orders: updatedOrders, notification };
}

// Subscribe to real-time order updates
export function subscribeKDSUpdates(callback: EventCallback): () => void {
  const handleMessage = (e: MessageEvent) => {
    if (e.data) {
      callback(e.data);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const freshOrders = JSON.parse(e.newValue);
        callback({ type: 'STATUS_CHANGE', orders: freshOrders });
      } catch (err) {
        console.error(err);
      }
    }
  };

  channel?.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  return () => {
    channel?.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
  };
}
