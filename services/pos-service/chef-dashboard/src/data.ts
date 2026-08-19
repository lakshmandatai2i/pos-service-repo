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

// ─── Initial Chef Dashboard Data ───────────────────────────────────────

export const INITIAL_ORDERS: ChefOrder[] = [];
