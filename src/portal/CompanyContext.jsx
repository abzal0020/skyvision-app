import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { result } from './api';

const Context = createContext(null);
export function CompanyProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const gen = ++generation.current;
    setLoading(true); setError(null);
    if (!user) { setMemberships([]); setSelected(''); setLoading(false); return; }
    try {
      const data = await result(supabase.from('sv_company_members').select('company_id,role,company:sv_companies(*)').eq('user_id', user.id));
      if (gen !== generation.current) return;
      const rows = data.filter(r => r.company);
      setMemberships(rows);
      setSelected(current => rows.some(r => r.company_id === current) ? current : rows[0]?.company_id || '');
    } catch (e) { if (gen === generation.current) setError(e); }
    finally { if (gen === generation.current) setLoading(false); }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const counter = generation; setMemberships([]); reload(); return () => { ++counter.current; }; }, [reload]);
  const member = memberships.find(r => r.company_id === selected);
  return <Context.Provider value={{ memberships, company: member?.company, role: member?.role, select: setSelected, reload, loading: loading || authLoading, error }}>{children}</Context.Provider>;
}
export const useCompany = () => useContext(Context);
