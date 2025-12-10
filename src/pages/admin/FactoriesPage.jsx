import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import AdminAuth from '../../components/AdminAuth';
import { v4 as uuidv4 } from 'uuid';

/*
  Улучшённая версия страницы админки FactoriesPage:
  - Раздел создания завода встроен в страницу, с блокировкой кнопки (creating)
  - После вставки использует оптимистичное обновление local state (вставляет полученную запись)
  - Подписка на realtime (INSERT / UPDATE / DELETE) — чтобы другие пользователи видели изменения сразу
  - fetchFactories загружает минимальный набор полей + factory_prices (id, price) для показа кол-ва прайсов
  - handleDelete удаляет локально и отправляет запрос на сервер (подписка также обновит список)
  - Простая обработка ошибок и сообщения пользователю
*/

function makeSlug(s = '') {
  return s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

export default function FactoriesPage() {
  const [user, setUser] = useState(null);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const fetchFactories = useCallback(async () => {
    setLoading(true);
    try {
      // Загружаем минимальные поля и вложенные factory_prices (id, price)
      const { data, error } = await supabase
        .from('factories')
        .select('id,name,slug,city,published,created_at,min_order,payment_terms,factory_prices(id,price)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFactories(data || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load factories' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFactories();
  }, [fetchFactories]);

  // realtime подписка на изменения в таблице factories — INSERT / UPDATE / DELETE
  useEffect(() => {
    // supabase v2 realtime channel
    const channel = supabase
      .channel('public:factories')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'factories' },
        (payload) => {
          const newFactory = payload.new;
          // Вставляем в начало списка, избегая дублей
          setFactories(prev => {
            if (prev.some(p => p.id === newFactory.id)) return prev.map(p => p.id === newFactory.id ? newFactory : p);
            return [newFactory, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'factories' },
        (payload) => {
          const updated = payload.new;
          setFactories(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'factories' },
        (payload) => {
          const removed = payload.old;
          setFactories(prev => prev.filter(p => p.id !== removed.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage(null);

    if (!user) {
      setMessage({ type: 'error', text: 'You must be signed in as admin to create a factory' });
      return;
    }
    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Name required' });
      return;
    }

    setCreating(true);
    try {
      const slug = newSlug ? makeSlug(newSlug) : makeSlug(newName);
      const payload = {
        id: uuidv4(),
        name: newName.trim(),
        slug,
        created_by: user.id,
        published: false
      };

      const start = Date.now();
      // Insert and return created record (with nested factory_prices)
      const { data, error } = await supabase
        .from('factories')
        .insert([payload])
        .select('id,name,slug,city,published,created_at,min_order,payment_terms,factory_prices(id,price)')
        .maybeSingle();

      const duration = Date.now() - start;

      if (error) throw error;

      // Оптимистичное обновление: добавляем полученную запись в state сразу
      setFactories(prev => {
        if (prev.some(p => p.id === data.id)) {
          return prev.map(p => p.id === data.id ? data : p);
        }
        return [data, ...prev];
      });

      setNewName('');
      setNewSlug('');
      setMessage({ type: 'success', text: `Factory created (${duration} ms)` });
      // Не нужно вызывать fetchFactories() — подписка realtime и оптимистичное обновление обеспечат консистентность
    } catch (err) {
      // Обработка ошибок (например, уникальный slug)
      const text = err?.message || String(err);
      setMessage({ type: 'error', text });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(factoryId) {
    if (!window.confirm('Delete factory and all its data?')) return;
    setMessage(null);
    try {
      const { error } = await supabase.from('factories').delete().eq('id', factoryId);
      if (error) throw error;
      // оптимистично удалить локально (подписка тоже удалит, но здесь делаем сразу)
      setFactories(prev => prev.filter(f => f.id !== factoryId));
      setMessage({ type: 'success', text: 'Factory deleted' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin — Factories</h2>

      <AdminAuth onAuthChange={(u) => setUser(u)} />

      {message && (
        <div style={{ marginBottom: 12, color: message.type === 'error' ? 'red' : 'green' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <h3>Create new factory</h3>
        <div>
          <label>Name</label><br />
          <input value={newName} onChange={(e) => setNewName(e.target.value)} required disabled={creating} />
        </div>
        <div>
          <label>Slug (optional, unique)</label><br />
          <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} disabled={creating} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={creating}>{creating ? 'Создаётся...' : 'Create'}</button>
        </div>
      </form>

      <h3>Existing factories {loading ? '(loading...)' : `(${factories.length})`}</h3>
      <table border="1" cellPadding="6" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th>Slug</th>
            <th>Published</th>
            <th>Created</th>
            <th>Prices</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {factories.map(f => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.slug}</td>
              <td style={{ textAlign: 'center' }}>{String(!!f.published)}</td>
              <td>{f.created_at ? new Date(f.created_at).toLocaleString() : ''}</td>
              <td style={{ textAlign: 'center' }}>{(f.factory_prices && f.factory_prices.length) || 0}</td>
              <td>
                <button onClick={() => navigate(`/admin/factories/${f.id}`)}>Open</button>{' '}
                <button onClick={() => handleDelete(f.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {factories.length === 0 && !loading && (
            <tr>
              <td colSpan="6">No factories yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
