// ─── KDS Real-Time Store & Supabase Cloud Sync ─────────────────────────
import { supabase } from './supabaseClient';

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

// Zero fake mock orders
const DEFAULT_ORDERS: KDSOrder[] = [];

// Helper to deduplicate orders so each table number has at most ONE order card
export function dedupeOrdersByTable(orders: KDSOrder[]): KDSOrder[] {
  const seenTables = new Set<number>();
  const result: KDSOrder[] = [];
  for (const o of orders) {
    const tableNum = Number(o.tableNumber);
    if (tableNum && !seenTables.has(tableNum)) {
      seenTables.add(tableNum);
      result.push({ ...o, id: tableNum });
    }
  }
  return result;
}

// Helper to safely get orders from localStorage
export function getStoredOrders(): KDSOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return dedupeOrdersByTable(parsed);
    }
  } catch (e) {
    console.error('Failed to parse KDS orders', e);
  }
  return DEFAULT_ORDERS;
}

// Helper to save orders to localStorage
export function saveStoredOrders(orders: KDSOrder[]) {
  try {
    const deduped = dedupeOrdersByTable(orders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
  } catch (e) {
    console.error('Failed to save KDS orders', e);
  }
}

// Helper to convert Supabase table row to KDSOrder
export function mapTableToKDSOrder(t: any): KDSOrder | null {
  const statusStr = (t.status || 'available').toString().trim().toLowerCase();
  // Do NOT load available or occupied tables into Chef KDS (only order_sent, preparing, ready, completed)
  if (statusStr === 'available' || statusStr === 'occupied') return null;

  let kdsStatus: OrderStatus = 'pending';
  if (statusStr === 'preparing') {
    kdsStatus = 'preparing';
  } else if (statusStr === 'ready' || statusStr === 'prepared' || statusStr === 'closed') {
    kdsStatus = 'completed';
  } else if (statusStr === 'order_sent') {
    kdsStatus = 'pending';
  } else {
    return null;
  }

  const tableNum = Number(t.table_number || t.id);
  const strDigits = (t.store_id || 'STORE-001').replace(/\D/g, '').padStart(3, '0') || '001';
  const tblDigits = String(tableNum).padStart(2, '0');
  const ticketNo = t.ticketNo || `#${strDigits}${tblDigits}`;

  let itemsArray: OrderItem[] = [];
  if (Array.isArray(t.orders)) {
    itemsArray = t.orders;
  } else if (typeof t.orders === 'string' && t.orders.trim().length > 0) {
    try {
      itemsArray = JSON.parse(t.orders);
    } catch {
      itemsArray = [];
    }
  }

  // If there are no items in this order, do NOT render an empty card in Chef KDS!
  if (!itemsArray || itemsArray.length === 0) {
    return null;
  }

  return {
    id: tableNum,
    ticketNo,
    tableNumber: tableNum,
    section: t.store_name || 'Main Dining',
    waiterName: 'Waiter',
    status: kdsStatus,
    items: itemsArray,
    createdAt: t.updated_at || new Date().toISOString()
  };
}

// Fetch live orders directly from Supabase
export async function fetchSupabaseOrders(): Promise<KDSOrder[]> {
  try {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('table_number', { ascending: true });

    if (error || !data) {
      console.warn('Supabase fetch orders warning:', error);
      return getStoredOrders();
    }

    // Purge cached stored orders for tables that are now available or occupied
    const activeTableNumbers = new Set(
      data
        .filter(t => {
          const s = (t.status || '').toString().trim().toLowerCase();
          return s === 'order_sent' || s === 'preparing' || s === 'ready' || s === 'prepared';
        })
        .map(t => Number(t.table_number || t.id))
    );

    const stored = getStoredOrders().filter(o => activeTableNumbers.has(Number(o.tableNumber)));

    const liveOrders: KDSOrder[] = [];
    data.forEach(t => {
      const mapped = mapTableToKDSOrder(t);
      if (mapped && mapped.items && mapped.items.length > 0) {
        liveOrders.push(mapped);
      }
    });

    const clean = dedupeOrdersByTable([...liveOrders, ...stored]);
    saveStoredOrders(clean);
    return clean;
  } catch (err) {
    console.error('Supabase fetch err:', err);
    return getStoredOrders();
  }
}

// Broadcast Channel instance for local tabs
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  channel = new BroadcastChannel(CHANNEL_NAME);
}

// Send a new order to kitchen
export function sendOrderToKitchen(order: KDSOrder): KDSOrder[] {
  const currentOrders = getStoredOrders();
  const tableNum = Number(order.tableNumber);
  const updatedOrder = { ...order, id: tableNum };

  const existingIdx = currentOrders.findIndex(o => Number(o.tableNumber) === tableNum);
  let updatedOrders: KDSOrder[];
  if (existingIdx >= 0) {
    currentOrders[existingIdx] = updatedOrder;
    updatedOrders = [...currentOrders];
  } else {
    updatedOrders = [updatedOrder, ...currentOrders];
  }
  
  const clean = dedupeOrdersByTable(updatedOrders);
  saveStoredOrders(clean);

  const eventPayload = { type: 'NEW_ORDER' as const, order: updatedOrder, orders: clean };
  channel?.postMessage(eventPayload);
  return clean;
}

// Update status of order (pending -> preparing -> completed) and sync to Supabase
export function updateOrderStatus(orderId: number, nextStatus: OrderStatus, tableNumber?: number): { orders: KDSOrder[]; notification?: KDSNotification } {
  const currentOrders = getStoredOrders();
  const targetTableNum = Number(tableNumber || orderId);
  let updatedOrder: KDSOrder | undefined;
  
  const updatedOrders = currentOrders.map(o => {
    if (Number(o.tableNumber) === targetTableNum || Number(o.id) === targetTableNum) {
      updatedOrder = {
        ...o,
        id: targetTableNum,
        status: nextStatus,
        preparedAt: nextStatus === 'completed' ? new Date().toISOString() : o.preparedAt
      };
      return updatedOrder;
    }
    return o;
  });

  const cleanOrders = dedupeOrdersByTable(updatedOrders);
  saveStoredOrders(cleanOrders);

  if (targetTableNum) {
    const supabaseStatus = nextStatus === 'preparing' ? 'preparing' : nextStatus === 'completed' ? 'ready' : 'order_sent';
    supabase
      .from('restaurant_tables')
      .update({ status: supabaseStatus, updated_at: new Date().toISOString() })
      .eq('table_number', targetTableNum)
      .then(({ error }) => {
        if (error) console.warn('Supabase status sync error:', error);
      });

    // Broadcast status change to backend WebSocket server in real time
    try {
      fetch(`http://${window.location.hostname || 'localhost'}:8000/api/orders/${targetTableNum}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      }).catch(err => console.warn('Backend status update fetch warning:', err));
    } catch (e) {
      console.warn('Backend status update error:', e);
    }
  }

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
    orders: cleanOrders
  };

  channel?.postMessage(payload);
  return { orders: cleanOrders, notification };
}

// Subscribe to real-time order updates via MongoDB WebSockets, Supabase & Broadcast Channel
export function subscribeKDSUpdates(callback: EventCallback): () => void {
  // Initial fetch from Supabase
  fetchSupabaseOrders().then(orders => {
    callback({ type: 'STATUS_CHANGE', orders });
  });

  // ─── Fast API MongoDB Real-Time WebSocket Engine ──────────────────────────────
  let socket: WebSocket | null = null;
  try {
    const wsUrl = `ws://${window.location.hostname || 'localhost'}:8000/ws/kds`;
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('⚡ Connected to MongoDB Real-Time WebSocket engine at:', wsUrl);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'INITIAL_ORDERS' && Array.isArray(data.orders)) {
          const current = getStoredOrders();
          const merged = dedupeOrdersByTable([...data.orders, ...current]);
          saveStoredOrders(merged);
          callback({ type: 'STATUS_CHANGE', orders: merged });
        } else if (data.type === 'NEW_ORDER' && data.order) {
          const current = getStoredOrders();
          const tableNum = Number(data.order.tableNumber);
          const idx = current.findIndex(o => Number(o.tableNumber) === tableNum);
          let updated: KDSOrder[];
          if (idx >= 0) {
            current[idx] = { ...data.order, id: tableNum };
            updated = [...current];
          } else {
            updated = [{ ...data.order, id: tableNum }, ...current];
          }
          const clean = dedupeOrdersByTable(updated);
          saveStoredOrders(clean);
          callback({ type: 'NEW_ORDER', order: data.order, orders: clean });
        } else if (data.type === 'STATUS_CHANGE' && data.order) {
          const current = getStoredOrders();
          const tableNum = Number(data.order.tableNumber || data.order.id);
          let updated: KDSOrder[];
          if (data.order.status === 'available') {
            updated = current.filter(o => Number(o.tableNumber) !== tableNum && Number(o.id) !== tableNum);
          } else {
            updated = current.map(o => Number(o.tableNumber) === tableNum || Number(o.id) === tableNum ? { ...o, ...data.order, id: tableNum } : o);
          }
          const clean = dedupeOrdersByTable(updated);
          saveStoredOrders(clean);
          callback({ type: 'STATUS_CHANGE', order: data.order, orders: clean });
        }
      } catch (err) {
        console.warn('WebSocket message parse error:', err);
      }
    };

    socket.onerror = (err) => {
      console.warn('MongoDB WebSocket connection warning:', err);
    };
  } catch (err) {
    console.warn('Could not initialize WebSocket:', err);
  }

  // Supabase Realtime WebSocket Channel
  const supabaseChannel = supabase
    .channel('chef_kds_realtime_tables')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, async () => {
      const freshOrders = await fetchSupabaseOrders();
      callback({ type: 'STATUS_CHANGE', orders: freshOrders });
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('⚡ Connected to Supabase Realtime WebSocket engine for Chef KDS');
      }
    });

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
    socket?.close();
    supabase.removeChannel(supabaseChannel);
    channel?.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
  };
}
