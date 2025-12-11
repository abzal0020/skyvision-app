// src/lib/supabase.js
// Создаёт supabase client и (временно) экспортирует его.
// Использует переменные окружения: REACT_APP_SUPABASE_URL и REACT_APP_SUPABASE_ANON_KEY
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase env vars: REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Для отладки (если нужно получить токен в консоли) временно можно раскомментировать:
// if (typeof window !== 'undefined') window.supabase = supabase;
