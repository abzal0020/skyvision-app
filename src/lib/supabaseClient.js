// lib/supabaseClient.js
// Пример безопасной инициализации supabase клиента для браузера (anon key)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase keys are not set');
}

let supabase;
if (!global._supabase && typeof window !== 'undefined') {
  global._supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
supabase = global._supabase;

export { supabase };
