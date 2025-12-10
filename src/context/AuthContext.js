import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Быстро получаем session (локальная проверка, быстрее, чем remote getUser)
        const { data: sessionData } = await supabase.auth.getSession();
        const u = sessionData?.session?.user ?? null;
        if (!mounted) return;
        setUser(u);
        // Не держим UI в loading — профиль загрузим в фоне
        setLoading(false);

        if (u) {
          // Запрашиваем ТОЛЬКО role (display_name убран, потому что его нет)
          try {
            const { data: p, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', u.id)
              .maybeSingle();
            if (!mounted) return;
            if (!error) setProfile(p ?? null);
          } catch (err) {
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      if (!mounted) return;
      setUser(u);
      setProfile(null);
      if (u) {
        try {
          const { data: p, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', u.id)
            .maybeSingle();
          if (!error) setProfile(p ?? null);
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
