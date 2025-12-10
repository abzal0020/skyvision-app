import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // helper: try to load profile by a few possible keys (id or user_id)
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;
    // попробуем сначала колонку id, если не найдено — user_id
    const tryGet = async (column) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,display_name,role')
        .eq(column, userId)
        .maybeSingle();
      return { data, error };
    };

    let res = await tryGet('id');
    if (res.error && res.error.code) {
      // если есть ошибка - вернуть её наружу
      throw res.error;
    }
    if (!res.data) {
      // пробуем user_id
      res = await tryGet('user_id');
      if (res.error && res.error.code) throw res.error;
    }
    return res.data ?? null;
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(currentUser ?? null);
        if (currentUser) {
          try {
            const p = await fetchProfile(currentUser.id);
            if (!mounted) return;
            setProfile(p);
          } catch (err) {
            // логируем ошибку профиля, но не ломаем UX
            console.error('fetchProfile error', err);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        setProfile(null);
        return;
      }
      // при смене user — подтягиваем профиль
      setLoading(true);
      fetchProfile(u.id)
        .then((p) => {
          if (mounted) setProfile(p);
        })
        .catch((err) => {
          console.error('onAuthStateChange fetchProfile error', err);
          if (mounted) setProfile(null);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const value = { user, profile, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
