import { supabase } from '../supabaseClient';
import type { RestaurantTable, TableStatus } from '../types';

export interface TableCreatePayload {
  store_id: string;
  store_name: string;
  table_number: number;
  status: TableStatus;
}

export interface TableStatusUpdatePayload {
  status: TableStatus;
}

export const tableService = {
  /**
   * Fetch all restaurant tables directly from Supabase.
   * Throws an exception if Supabase table is not found or no table records exist.
   */
  async getTables(storeId: string = 'STORE-001'): Promise<RestaurantTable[]> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('store_id', storeId)
      .order('table_number', { ascending: true });

    if (error) {
      throw new Error(`Supabase Error [${error.code}]: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`No tables found in Supabase database for store '${storeId}'.`);
    }

    return data.map((t: any) => ({
      id: Number(t.table_number || t.id),
      number: Number(t.table_number || t.id),
      store_id: t.store_id || storeId,
      store_name: t.store_name || 'Spice Garden Main',
      status: (String(t.status || 'available').trim().toLowerCase()) as TableStatus,
      ticketNo: t.ticketNo || undefined,
      orders: t.orders || [],
    }));
  },

  /**
   * Fetch a single table by table number.
   */
  async getTableByNumber(tableNumber: number, storeId: string = 'STORE-001'): Promise<RestaurantTable> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('store_id', storeId)
      .eq('table_number', tableNumber)
      .single();

    if (error || !data) {
      throw new Error(`Table ${tableNumber} not found in Supabase: ${error?.message || 'Record missing'}`);
    }

    return {
      id: Number(data.table_number || data.id),
      number: Number(data.table_number || data.id),
      store_id: data.store_id || storeId,
      store_name: data.store_name || 'Spice Garden Main',
      status: (String(data.status || 'available').trim().toLowerCase()) as TableStatus,
      ticketNo: data.ticketNo || undefined,
      orders: data.orders || [],
    };
  },

  /**
   * Create a new table entry in Supabase.
   */
  async createTable(payload: TableCreatePayload): Promise<RestaurantTable> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert([{
        store_id: payload.store_id,
        store_name: payload.store_name,
        table_number: payload.table_number,
        status: payload.status,
      }])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create table in Supabase: ${error?.message || 'Database error'}`);
    }

    return {
      id: Number(data.table_number || data.id),
      number: Number(data.table_number || data.id),
      store_id: data.store_id || payload.store_id,
      store_name: data.store_name || payload.store_name,
      status: (String(data.status || 'available').trim().toLowerCase()) as TableStatus,
      ticketNo: data.ticketNo || undefined,
      orders: data.orders || [],
    };
  },

  /**
   * Update table status in Supabase.
   */
  async updateTableStatus(
    tableNumber: number,
    status: TableStatus,
    orders?: any[],
    ticketNo?: string,
    storeId: string = 'STORE-001'
  ): Promise<RestaurantTable> {
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (orders !== undefined) payload.orders = orders;
    if (ticketNo !== undefined) payload.ticketNo = ticketNo;

    const { data, error } = await supabase
      .from('restaurant_tables')
      .update(payload)
      .eq('store_id', storeId)
      .eq('table_number', tableNumber)
      .select();

    if (error || !data || data.length === 0) {
      // Fallback simple update if extra fields fail
      const { data: fallbackData } = await supabase
        .from('restaurant_tables')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('store_id', storeId)
        .eq('table_number', tableNumber)
        .select();

      if (fallbackData && fallbackData.length > 0) {
        const t = fallbackData[0];
        return {
          id: Number(t.table_number || t.id),
          number: Number(t.table_number || t.id),
          store_id: t.store_id || storeId,
          store_name: t.store_name || 'Spice Garden Main',
          status: (String(t.status || 'available').trim().toLowerCase()) as TableStatus,
          ticketNo: t.ticketNo || undefined,
          orders: t.orders || [],
        };
      }
      throw new Error(`Failed to update status for Table ${tableNumber} in Supabase: ${error?.message || 'Update failed'}`);
    }

    const t = data[0];
    return {
      id: Number(t.table_number || t.id),
      number: Number(t.table_number || t.id),
      store_id: t.store_id || storeId,
      store_name: t.store_name || 'Spice Garden Main',
      status: (String(t.status || 'available').trim().toLowerCase()) as TableStatus,
      ticketNo: t.ticketNo || undefined,
      orders: t.orders || [],
    };
  },
};




