import { apiRequest } from './apiClient';
import type { KDSOrder } from '../kdsStore';

export interface OrderCreatePayload {
  tableNumber: number;
  store_id: string;
  waiterName: string;
  items: Array<{
    id: number;
    itemName: string;
    qty: number;
    price: number;
    note?: string;
  }>;
  notes?: string;
  paymentMethod?: string;
  grandTotal?: number;
  paymentStatus?: string;
}

export const orderService = {
  /**
   * Fetch orders for a store.
   */
  async getOrders(storeId: string = 'STORE-001'): Promise<KDSOrder[]> {
    return apiRequest<KDSOrder[]>(`/api/orders?store_id=${encodeURIComponent(storeId)}`);
  },

  /**
   * Create a new KDS order.
   */
  async createOrder(payload: OrderCreatePayload): Promise<KDSOrder> {
    return apiRequest<KDSOrder>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update order status (e.g. pending, preparing, completed).
   */
  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    return apiRequest<any>(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};
