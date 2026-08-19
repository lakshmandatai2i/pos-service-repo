// ─── Shared Waiter Dashboard TypeScript Interfaces ──────────────────────────────

export type TableStatus = 'available' | 'occupied' | 'order_sent' | 'preparing' | 'prepared' | 'ready' | 'closed';

export type NotificationType = 'order_created' | 'kitchen_preparing' | 'kitchen_ready' | 'payment_completed' | 'item_added' | 'low_stock' | 'order_sent';

export type ActiveView = 'tables' | 'notifications' | 'settings';

export interface TableOrder {
  id: number;
  itemName: string;
  qty: number;
  price: number;
  note?: string;
  isNew?: boolean;
  sentToKitchen?: boolean;
}

export interface RestaurantTable {
  id: number;
  number: number;
  store_id?: string;
  store_name?: string;
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
