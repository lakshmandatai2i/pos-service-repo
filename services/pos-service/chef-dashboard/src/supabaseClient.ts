import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
  'https://hcrlqshduhoattoqmbws.supabase.co';

const supabaseKey = 
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)) || 
  'sb_publishable_wOCQC1KFZOwGoWGn51rF8Q_AUeeXosy';

export const supabase = createClient(supabaseUrl, supabaseKey);
