import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Начинаем с попытки получить session (быстрее и синхроннее для client-side)
    (async () => {
      try {
        // Получаем сессию — если она есть, вытаскиваем user сразу
        const { data: sessionData } = await supabase.auth.getSession();
        const u = sessionData?.session?.user ?? null;
        if (!mounted) return;
        setUser(u);
        // Помечаем loading false как можно раньше, чтобы UI не блокировался
        setLoading(false);

        // Если есть user — асинхронно загрузим профиль (не блокируя UI)
        if (u) {
          try {
            const { data: p, error } = await supabase
              .from('profiles')
              .select('role,display_name')
              .eq('id', u.id)
              .maybeSingle();
            if (!mounted) return;
            if (!error) setProfile(p);
          } catch (err) {
            // логируем, но не блокируем UI
            console.warn('Failed to load profile (async):', err);
          }
        }
      } catch (err) {
        console.warn('Auth init error (getSession):', err);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    })();

    // Подписка на изменения аутентификации
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      if (!mounted) return;
      setUser(u);
      // при auth change нужно обновить профиль (асинхронно)
      setProfile(null);
      if (u) {
        try {
          const { data: p, error } = await supabase.from('profiles').select('role,display_name').eq('id', u.id).maybeSingle();
          if (!error) setProfile(p);
        } catch (err) {
          console.warn('Profile load after auth change failed:', err);
        }
      }
    });

    return () => {
      mounted = false;
      try { listener?.subscription?.unsubscribe?.(); } catch (e) {}
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
