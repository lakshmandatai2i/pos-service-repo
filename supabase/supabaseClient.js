import { createClient } from '@supabase/supabase-js';

// Reads from Vite import.meta.env or standard Node process.env
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL));

const supabaseKey = 
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)) || 
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY));

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase URL or Key missing in environment. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
