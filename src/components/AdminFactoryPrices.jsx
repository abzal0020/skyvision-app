import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // в проекте встречается ../lib/supabase

export default function AdminFactoryPrices({ factoryId, userId }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [prices, setPrices] = useState([]);
  const [form, setForm] = useState({ price: '', currency: 'USD', unit: '', min_qty: 1, note: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!userId) { setIsAdmin(false); return; }
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
    if (!factoryId) return;
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('factory_prices')
          .select('*')
          .eq('factory_id', factoryId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (!mounted) return;
        setPrices(data || []);
      } catch (err) {
        console.warn('Failed to load prices', err);
        setPrices([]);
      }
    })();
    return () => { mounted = false; };
  }, [factoryId]);

  const createPrice = async () => {
    setStatus(null);
    if (!isAdmin) { setStatus('Нет прав'); return; }
    if (!form.price) { setStatus('Введите цену'); return; }
    setLoading(true);
    try {
      const payload = {
        factory_id: factoryId,
        price: Number(form.price),
        currency: form.currency || 'USD',
        unit: form.unit || null,
        min_qty: form.min_qty ? Number(form.min_qty) : 1,
        note: form.note || null
      };
      const { data, error } = await supabase
        .from('factory_prices')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      setPrices(prev => [data, ...prev]);
      setForm({ price: '', currency: 'USD', unit: '', min_qty: 1, note: '' });
      setStatus('Создано');
    } catch (err) {
      console.error('createPrice', err);
      setStatus('Ошибка: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (id, updated) => {
    try {
      const { error } = await supabase
        .from('factory_prices')
        .update(updated)
        .eq('id', id);
      if (error) throw error;
      setPrices(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      setStatus('Обновлено');
    } catch (err) {
      console.error('updatePrice', err);
      setStatus('Ошибка обновления: ' + (err.message || String(err)));
    }
  };

  const deletePrice = async (id) => {
    if (!window.confirm('Удалить прайс?')) return;
    try {
      const { error } = await supabase.from('factory_prices').delete().eq('id', id);
      if (error) throw error;
      setPrices(prev => prev.filter(p => p.id !== id));
      setStatus('Удалено');
    } catch (err) {
      console.error('deletePrice', err);
      setStatus('Ошибка удаления: ' + (err.message || String(err)));
    }
  };

  if (isAdmin === null) return <div>Проверка прав...</div>;
  if (!isAdmin) return <div>У вас нет прав добавлять/менять цены.</div>;

  return (
    <div>
      <h3>Prices (Admin)</h3>

      <div style={{ maxWidth: 560, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Price</label><br />
          <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Currency</label><br />
            <input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div style={{ width: 120 }}>
            <label>Min qty</label><br />
            <input type="number" value={form.min_qty} onChange={e => setForm({ ...form, min_qty: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Unit</label><br />
          <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Note</label><br />
          <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={createPrice} disabled={loading}>{loading ? 'Sending...' : 'Create price'}</button>
          {status && <span style={{ marginLeft: 10 }}>{status}</span>}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Existing</h4>
        <ul>
          {prices.map(p => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <input
                style={{ width: 100 }}
                value={p.price ?? ''}
                onChange={e => setPrices(prev => prev.map(x => x.id === p.id ? { ...x, price: e.target.value } : x))}
              />
              <input
                style={{ width: 80, marginLeft: 8 }}
                value={p.currency || ''}
                onChange={e => setPrices(prev => prev.map(x => x.id === p.id ? { ...x, currency: e.target.value } : x))}
              />
              <input
                style={{ width: 200, marginLeft: 8 }}
                value={p.note || ''}
                onChange={e => setPrices(prev => prev.map(x => x.id === p.id ? { ...x, note: e.target.value } : x))}
              />
              <button onClick={() => updatePrice(p.id, { price: Number(p.price), currency: p.currency, note: p.note })} style={{ marginLeft: 8 }}>Update</button>
              <button onClick={() => deletePrice(p.id)} style={{ marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
