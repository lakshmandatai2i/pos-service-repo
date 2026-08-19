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

// Initial KDS Orders list (starts empty until sent by waiter)
const DEFAULT_ORDERS: KDSOrder[] = [];

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
