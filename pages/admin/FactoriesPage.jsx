import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminAuth from '../../components/AdminAuth';
import { v4 as uuidv4 } from 'uuid';

export default function FactoriesPage() {
  const [user, setUser] = useState(null);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [message, setMessage] = useState(null);

  const fetchFactories = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('factories')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFactories(data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to load factories' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFactories();
  }, [fetchFactories]);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage(null);
    if (!user) {
      setMessage({ type: 'error', text: 'You must be signed in as admin to create a factory' });
      return;
    }
    if (!newName || !newSlug) {
      setMessage({ type: 'error', text: 'Name and slug required' });
      return;
    }

    try {
      const slug = newSlug.trim();
      const { data, error } = await supabase
        .from('factories')
        .insert([{
          id: uuidv4(),
          name: newName.trim(),
          slug,
          created_by: user.id,
          published: false
        }])
        .select();
      if (error) throw error;
      setNewName('');
      setNewSlug('');
      setMessage({ type: 'success', text: 'Factory created' });
      await fetchFactories();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Create failed' });
    }
  }

  async function handleDelete(factoryId) {
    if (!window.confirm('Delete factory and all its data?')) return;
    setMessage(null);
    try {
      const { error } = await supabase.from('factories').delete().eq('id', factoryId);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Factory deleted' });
      await fetchFactories();
    } catch (err) {
      console.error(err);
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
          <label>Name</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} required />
        </div>
        <div>
          <label>Slug (unique)</label>
          <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} required />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Create</button>
        </div>
      </form>

      <h3>Existing factories {loading ? '(loading...)' : `(${factories.length})`}</h3>
      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Published</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {factories.map(f => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.slug}</td>
              <td>{String(f.published)}</td>
              <td>{f.created_at ? new Date(f.created_at).toLocaleString() : ''}</td>
              <td>
                <button onClick={() => window.location.href = `/admin/factories/${f.id}`}>Open</button>
                {' '}
                <button onClick={() => handleDelete(f.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {factories.length === 0 && !loading && (
            <tr>
              <td colSpan="5">No factories yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
