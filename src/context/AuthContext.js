import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

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
    return res.data ?? null;
  }, []);

  useEffect(() => {
    let mounted = true;
    let identity;
    let generation = 0;
    let authEventReceived = false;
    const timers = new Set();
    setLoading(true);

    const applyUser = (nextUser) => {
      if (!mounted) return;
      const nextIdentity = nextUser?.id ?? null;
      setUser(nextUser ?? null);
      // Supabase also emits SIGNED_IN when an existing tab regains focus.
      // Only an identity change may replace the authenticated screen.
      if (identity === nextIdentity) return;
      identity = nextIdentity;
      const request = ++generation;
      setProfile(null);
      setLoading(Boolean(nextUser));
      if (!nextUser) return;

      // Keep Supabase calls outside the synchronous auth callback.
      const timer = setTimeout(async () => {
        timers.delete(timer);
        if (!mounted || request !== generation) return;
        try {
          const nextProfile = await fetchProfile(nextUser.id);
          if (mounted && request === generation) setProfile(nextProfile);
        } catch (err) {
          if (mounted && request === generation) {
            console.error('fetchProfile error', err);
            setProfile(null);
          }
        } finally {
          if (mounted && request === generation) setLoading(false);
        }
      }, 0);
      timers.add(timer);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      if (_event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (_event === 'SIGNED_OUT') setRecovering(false);
      applyUser(session?.user ?? null);
    });

    supabase.auth.getUser()
      .then(({ data }) => {
        if (!authEventReceived) applyUser(data?.user ?? null);
      })
      .catch((err) => {
        if (mounted && !authEventReceived) {
          console.error('getUser error', err);
          applyUser(null);
        }
      });

    return () => {
      mounted = false;
      ++generation;
      timers.forEach(clearTimeout);
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const value = { user, profile, loading, recovering, finishRecovery: () => setRecovering(false) };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
