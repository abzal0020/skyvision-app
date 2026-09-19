import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { isCatalogAdmin } from './api';
export default function useAdmin() {
  const [state, setState] = useState({ loading: true, admin: false, error: '' });
  useEffect(() => {
    let active = true;
    const check = () => isCatalogAdmin().then(admin => { if (active) setState({ loading: false, admin, error: '' }); }).catch(error => { if (active) setState({ loading: false, admin: false, error: error.message }); });
    check();
    const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(() => { if (active) check(); }, 0); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return state;
}
