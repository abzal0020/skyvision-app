// src/lib/supabase.js
// Singleton Supabase client для браузера — предотвращает "Multiple GoTrueClient instances" при HMR/повторных импортах.

/* global globalThis */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
}

// Безопасно получаем глобальный объект: сначала globalThis (если есть), иначе window (если есть), иначе пустой объект.
// Комментарий /* global globalThis */ сообщает ESLint, что globalThis — допустимая глобальная переменная.
const g = (typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {}));

/* eslint no-underscore-dangle: 0 */
if (!g.__supabase) {
  g.__supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = g.__supabase;
export default supabase;
