import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // совпадает с другими файлами в проекте

export default function AdminFactoryPrices({ factoryId, userId }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [prices, setPrices] = useState([]);
  const [form, setForm] = useState({ price: '', currency: 'USD', unit: '', min_qty: 1, note: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        if (error) throw error;
        if (!mounted) return;
        setIsAdmin(data?.role === 'admin');
      } catch (err) {
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
        if (!res.ok) {
          // do not treat as fatal — maybe not admin
          return;
        }
        const json = await res.json();
        setPrices(json || []);
      } catch (e) {
        console.warn('Failed to fetch prices', e);
      }
    })();
  }, [factoryId]);

  const submit = async () => {
    setStatus(null);
    if (!isAdmin) { setStatus('Нет прав'); return; }
    setLoading(true);
    try {
      const payload = {
        price: Number(form.price),
        currency: form.currency,
        unit: form.unit,
        min_qty: Number(form.min_qty),
        note: form.note
      };

      const res = await fetch(`/api/admin/factories/${factoryId}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server ${res.status}: ${txt}`);
      }

      const created = await res.json();
      setPrices(prev => [created, ...prev]);
      setForm({ price: '', currency: 'USD', unit: '', min_qty: 1, note: '' });
      setStatus('Создано');
    } catch (err) {
      console.error(err);
      setStatus('Ошибка: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) return <div>Загрузка...</div>;

  if (!isAdmin) return <div>У вас нет прав добавлять цены.</div>;

  return (
    <div>
      <h3>Prices (Admin)</h3>

      <div style={{ maxWidth: 560, padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>Price</label><br />
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13 }}>Currency</label><br />
            <input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div style={{ width: 120 }}>
            <label style={{ fontSize: 13 }}>Min qty</label><br />
            <input type="number" value={form.min_qty} onChange={e => setForm({ ...form, min_qty: e.target.value })} />
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>Unit</label><br />
          <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>Note</label><br />
          <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>

        <div style={{ marginTop: 8 }}>
          <button onClick={submit} disabled={loading} style={{ padding: '8px 12px' }}>
            {loading ? 'Sending...' : 'Create price'}
          </button>
          {status && <span style={{ marginLeft: 10 }}>{status}</span>}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>Existing</h4>
        <ul>
          {prices.map(p => (
            <li key={p.id || Math.random()}>{p.price} {p.currency} — {p.note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
