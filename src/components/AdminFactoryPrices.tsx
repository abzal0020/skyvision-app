import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // адаптируй путь

type Price = {
  id?: string;
  price: number;
  currency?: string;
  unit?: string;
  min_qty?: number;
  note?: string;
  created_by?: string;
};

export default function AdminFactoryPrices({ factoryId, userId }: { factoryId: string; userId: string }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [form, setForm] = useState<Partial<Price>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { data, error: e } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        if (e) throw e;
        if (!mounted) return;
        setIsAdmin(data?.role === 'admin');
      } catch (err: any) {
        console.error('Failed to load profile role', err);
        setIsAdmin(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  useEffect(() => {
    // load current prices for display (optional)
    (async () => {
      try {
        const res = await fetch(`/api/admin/factories/${factoryId}/prices`);
        if (!res.ok) return;
        const json = await res.json();
        setPrices(json);
      } catch (e) { /* ignore */ }
    })();
  }, [factoryId]);

  const submit = async () => {
    setError(null);
    if (!isAdmin) { setError('Нет прав'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/factories/${factoryId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, created_by: userId }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server ${res.status}: ${txt}`);
      }
      const created = await res.json();
      setPrices(prev => [created, ...prev]);
      setForm({});
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) return <div>Loading...</div>;

  return (
    <div>
      <h3>Prices</h3>
      {isAdmin ? (
        <div>
          <div style={{ maxWidth: 520 }}>
            <label>Price</label>
            <input type="number" value={form.price ?? ''} onChange={e => setForm({...form, price: Number(e.target.value)})} />
            <label>Currency</label>
            <input value={form.currency ?? 'USD'} onChange={e => setForm({...form, currency: e.target.value})} />
            <label>Unit</label>
            <input value={form.unit ?? ''} onChange={e => setForm({...form, unit: e.target.value})} />
            <label>Min qty</label>
            <input type="number" value={form.min_qty ?? 1} onChange={e => setForm({...form, min_qty: Number(e.target.value)})} />
            <label>Note</label>
            <textarea value={form.note ?? ''} onChange={e => setForm({...form, note: e.target.value})} />
            <div>
              <button onClick={submit} disabled={loading}>Create price</button>
              {error && <div style={{color:'red'}}>{error}</div>}
            </div>
          </div>
        </div>
      ) : (
        <div>У вас нет прав добавлять цены.</div>
      )}

      <div>
        <h4>Existing</h4>
        <ul>
          {prices.map(p => <li key={p.id}>{p.price} {p.currency} — {p.note}</li>)}
        </ul>
      </div>
    </div>
  );
}
