import { supabase } from '../supabaseClient';
import type { SupabaseMenuItem } from '../supabaseClient';

export const menuService = {
  /**
   * Fetch menu items directly from Supabase database ('items' table).
   */
  async getMenu(): Promise<SupabaseMenuItem[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase items fetch error:', error);
      return [];
    }

    return (data || []) as SupabaseMenuItem[];
  },
};
