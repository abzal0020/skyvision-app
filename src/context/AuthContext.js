import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const u = userData?.user ?? null;
        if (!mounted) return;
        setUser(u);

        if (u) {
          const { data: p, error } = await supabase
            .from('profiles')
            .select('role,display_name')
            .eq('id', u.id)
            .single();
          if (!error && mounted) setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error('Auth init error', e);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      try {
        const { data: ud } = await supabase.auth.getUser();
        const uu = ud?.user ?? null;
        if (!mounted) return;
        setUser(uu);
        if (uu) {
          const { data: p, error } = await supabase.from('profiles').select('role,display_name').eq('id', uu.id).single();
          if (!error) setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.warn('auth change handling error', err);
      }
    });

    return () => {
      mounted = false;
      try { sub?.subscription?.unsubscribe?.(); } catch(e) {}
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
