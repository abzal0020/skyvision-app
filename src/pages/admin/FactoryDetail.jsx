import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import UploadButton from '../../components/UploadButton';
import AdminFactoryPrices from '../../components/AdminFactoryPrices';

export default function FactoryDetailAdmin() {
  const { id } = useParams(); // предполагается маршрут /admin/factories/:id
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({});
  const [tab, setTab] = useState('info'); // info / media / prices / docs
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  // get current user session (so we can pass userId to AdminFactoryPrices)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        // supabase v1/v2 returns data.session.user or data.user depending on version
        const user = data?.session?.user || data?.user || null;
        setSessionUser(user);
      } catch (e) {
        console.warn('Failed to get session user', e);
        setSessionUser(null);
      }
    })();
  }, []);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  }

  async function fetchData() {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/factories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const t = await res.text();
        console.error('fetch factory failed', res.status, t);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setFactory(json.factory);
      setMedia(json.media || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  function onUploaded(newMedia) {
    // Добавляем в начало списка
    setMedia(prev => [newMedia, ...prev]);
    // Если нужно — можно автоматически сделать featured
  }

  async function handleSaveInfo() {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/factories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editing)
      });
      const json = await res.json();
      if (!res.ok) {
        alert('Ошибка сохранения: ' + (json?.error || JSON.stringify(json)));
        return;
      }
      setFactory(json.factory);
      alert('Информация сохранена');
    } catch (e) { console.error(e); alert('Ошибка запроса'); }
  }

  async function handleSetFeatured(mediaId) {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/factories/${id}/media/${mediaId}/set-featured`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) { alert('Ошибка: ' + (json?.error || JSON.stringify(json))); return; }
      setFactory(json.factory);
    } catch (e) { console.error(e); }
  }

  async function handleDeleteMedia(mediaId) {
    if (!window.confirm('Удалить это медиа?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/factories/${id}/media/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const t = await res.text();
        alert('Ошибка удаления: ' + t);
        return;
      }
      setMedia(prev => prev.filter(m => m.id !== mediaId));
    } catch (e) { console.error(e); alert('Ошибка запроса'); }
  }

  if (!factory) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin: редактирование завода — {factory.name}</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setTab('info')}>Info</button>
        <button onClick={() => setTab('media')}>Media ({media.length})</button>
        <button onClick={() => setTab('prices')}>Prices</button>
        <button onClick={() => setTab('docs')}>Docs</button>
        <button onClick={() => navigate('/admin')}>Back</button>
      </div>

      {tab === 'info' && (
        <div style={{ maxWidth: 800 }}>
          <label>Название</label>
          <input
            style={{ width: '100%', padding: 6 }}
            defaultValue={factory.name}
            onChange={(e) => setEditing(prev => ({ ...prev, name: e.target.value }))}
          />
          <label>Описание</label>
          <textarea
            style={{ width: '100%', minHeight: 120 }}
            defaultValue={factory.description}
            onChange={(e) => setEditing(prev => ({ ...prev, description: e.target.value }))}
          />
          <label>Адрес</label>
          <input
            style={{ width: '100%', padding: 6 }}
            defaultValue={factory.address}
            onChange={(e) => setEditing(prev => ({ ...prev, address: e.target.value }))}
          />
          <label>Телефон</label>
          <input
            style={{ width: '100%', padding: 6 }}
            defaultValue={factory.phone}
            onChange={(e) => setEditing(prev => ({ ...prev, phone: e.target.value }))}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={handleSaveInfo}>Сохранить</button>
          </div>
        </div>
      )}

      {tab === 'media' && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <UploadButton factoryId={id} onUploaded={onUploaded} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {media.map((m) => (
              <div key={m.id} style={{ width: 180, border: '1px solid #ddd', padding: 8 }}>
                <div style={{ height: 100, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.url ? (
                    m.type === 'image' ? <img src={m.url} alt={m.title} style={{ maxWidth: '100%', maxHeight: 100 }} /> :
                    <a href={m.url} target="_blank" rel="noreferrer">Open</a>
                  ) : <div>No preview</div>}
                </div>
                <div style={{ marginTop: 6, fontSize: 12 }}>{m.title || m.storage_path?.split('/').pop()}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <button onClick={() => handleSetFeatured(m.id)} disabled={factory.featured_media_id === m.id}>
                    {factory.featured_media_id === m.id ? 'Главное' : 'Сделать главным'}
                  </button>
                  <button onClick={() => handleDeleteMedia(m.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'prices' && (
        <div>
          {/* Render admin prices UI (component will check profiles.role by userId) */}
          <AdminFactoryPrices factoryId={id} userId={sessionUser?.id} />
        </div>
      )}

      {tab === 'docs' && (
        <div>
          <p>Документы завода</p>
          {/* Здесь можно отобразить список документов и управление ими */}
        </div>
      )}
    </div>
  );
}
