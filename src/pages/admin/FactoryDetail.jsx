import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import UploadButton from '../../components/UploadButton';
import AdminFactoryPrices from '../../components/AdminFactoryPrices';
import { uploadFile, deleteFile } from '../../lib/storageHelper';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = 'factory-files';

export default function FactoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [tab, setTab] = useState('info'); // info / media / prices / docs
  const [message, setMessage] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);

  // factory fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [minOrder, setMinOrder] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [logistics, setLogistics] = useState(''); // per-factory logistics (optional)

  useEffect(() => {
    if (!id) return;
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  // read session user for admin price component
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user || data?.user || null;
        setSessionUser(user);
      } catch (e) {
        console.warn('getSession failed', e);
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
      // populate editing fields so save works
      setName(json.factory?.name || '');
      setSlug(json.factory?.slug || '');
      setCity(json.factory?.city || '');
      setDescription(json.factory?.description || '');
      setPublished(Boolean(json.factory?.published));
      setMinOrder(json.factory?.min_order || '');
      setPaymentTerms(json.factory?.payment_terms || '');
      setLogistics(json.factory?.logistics ?? '');
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  function onUploaded(newMedia) {
    setMedia(prev => [newMedia, ...prev]);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/factories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          city: city || null,
          description,
          published,
          min_order: minOrder === '' ? null : Number(minOrder),
          payment_terms: paymentTerms || null,
          logistics: logistics === '' ? null : Number(logistics)
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: json?.error || JSON.stringify(json) });
        return;
      }
      setFactory(json.factory);
      setMessage({ type: 'success', text: 'Данные сохранены' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    const filename = `${Date.now()}_${file.name}`;
    const path = `${id}/${filename}`;
    try {
      const up = await uploadFile(BUCKET, path, file);
      if (up.error) throw up.error;
      const { error } = await supabase
        .from('factory_files')
        .insert([{
          id: uuidv4(),
          factory_id: id,
          storage_path: up.path,
          url: up.publicUrl,
          file_type: file.type
        }]);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Файл загружен' });
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || String(err) });
    } finally {
      e.target.value = null;
    }
  }

  async function handleDeleteFile(fileRec) {
    if (!window.confirm('Удалить файл и запись?')) return;
    try {
      const del = await deleteFile(BUCKET, fileRec.storage_path);
      if (del.error) {
        console.warn('Storage delete error', del.error);
      }
      const { error } = await supabase.from('factory_files').delete().eq('id', fileRec.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Файл удалён' });
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  // The following price management functions operate via direct supabase client (legacy-style)
  // If you still prefer /api endpoints, we can wire them instead.
  async function handleAddPrice(e) {
    e.preventDefault();
    const title = editing?.newPriceTitle || '';
    const value = editing?.newPriceValue || '';
    const currency = editing?.newPriceCurrency || 'USD';
    if (!title) { setMessage({ type: 'error', text: 'Название прайса нужно' }); return; }
    try {
      const { error } = await supabase
        .from('factory_prices')
        .insert([{
          id: uuidv4(),
          factory_id: id,
          title,
          price: value ? Number(value) : null,
          currency
        }]);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Прайс добавлен' });
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  async function handleUpdatePrice(priceId, newTitle, newPrice, newCurrency) {
    try {
      const { error } = await supabase
        .from('factory_prices')
        .update({
          title: newTitle,
          price: newPrice === '' ? null : Number(newPrice),
          currency: newCurrency
        })
        .eq('id', priceId);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Прайс обновлён' });
      await fetchData();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  async function handleDeletePrice(priceId) {
    if (!window.confirm('Удалить прайс?')) return;
    try {
      const { error } = await supabase.from('factory_prices').delete().eq('id', priceId);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Прайс удалён' });
      await fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
  if (!factory) return <div style={{ padding: 20 }}>Фабрика не найдена</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate('/admin/factories')}>← Назад</button>
      <h1>Редактировать завод — {factory.name}</h1>

      {message && (
        <div style={{ margin: '12px 0', color: message.type === 'error' ? 'red' : 'green' }}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setTab('info')}>Info</button>
        <button onClick={() => setTab('media')}>Media ({media.length})</button>
        <button onClick={() => setTab('prices')}>Prices</button>
        <button onClick={() => setTab('docs')}>Docs</button>
        <button onClick={() => navigate('/admin')}>Back</button>
      </div>

      {tab === 'info' && (
        <form onSubmit={handleSave}>
          <div>
            <label>Название</label><br />
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label>Slug</label><br />
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>

          <div>
            <label>Город</label><br />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Костанай" />
          </div>

          <div>
            <label>Описание</label><br />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          <div>
            <label>Минимальный заказ (тонн)</label><br />
            <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
          </div>

          <div>
            <label>Условия оплаты</label><br />
            <input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="50% предоплата" />
          </div>

          <div>
            <label>Логистика</label><br />
            <input type="number" value={logistics} onChange={(e) => setLogistics(e.target.value)} placeholder="38" />
          </div>

          <div>
            <label>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Опубликовано (видимо на /prices)
            </label>
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="submit">Сохранить</button>
          </div>
        </form>
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
                    m.file_type?.startsWith('image') ? <img src={m.url} alt={m.title} style={{ maxWidth: '100%', maxHeight: 100 }} /> :
                    <a href={m.url} target="_blank" rel="noreferrer">Open</a>
                  ) : <div>No preview</div>}
                </div>
                <div style={{ marginTop: 6, fontSize: 12 }}>{m.title || m.storage_path?.split('/').pop()}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <button onClick={() => { /* set featured via API */ }}>Сделать главным</button>
                  <button onClick={() => handleDeleteFile(m)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'prices' && (
        <div>
          {/* Встраиваем компонент управления прайсами */}
          <AdminFactoryPrices factoryId={id} userId={sessionUser?.id} />

          <hr style={{ margin: '12px 0' }} />

          <h4>Legacy price list (внизу — старая inline форма/список)</h4>
          <form onSubmit={handleAddPrice} style={{ marginBottom: 12 }}>
            <input placeholder="Название прайса" value={editing.newPriceTitle || ''} onChange={(e) => setEditing(prev => ({ ...prev, newPriceTitle: e.target.value }))} required />
            <input placeholder="Цена" value={editing.newPriceValue || ''} onChange={(e) => setEditing(prev => ({ ...prev, newPriceValue: e.target.value }))} style={{ width: 100, marginLeft: 8 }} />
            <input placeholder="Валюта" value={editing.newPriceCurrency || 'USD'} onChange={(e) => setEditing(prev => ({ ...prev, newPriceCurrency: e.target.value }))} style={{ width: 80, marginLeft: 8 }} />
            <button type="submit" style={{ marginLeft: 8 }}>Добавить прайс</button>
          </form>

          <ul>
            {factory.factory_prices && factory.factory_prices.length > 0 ? factory.factory_prices.map(p => (
              <li key={p.id} style={{ marginBottom: 8 }}>
                <input
                  style={{ width: 220 }}
                  value={p.title}
                  onChange={(e) => {
                    setFactory(prev => ({
                      ...prev,
                      factory_prices: prev.factory_prices.map(x => x.id === p.id ? { ...x, title: e.target.value } : x)
                    }));
                  }}
                />
                <input
                  style={{ width: 120, marginLeft: 8 }}
                  value={p.price ?? ''}
                  onChange={(e) => {
                    setFactory(prev => ({
                      ...prev,
                      factory_prices: prev.factory_prices.map(x => x.id === p.id ? { ...x, price: e.target.value } : x)
                    }));
                  }}
                />
                <input
                  style={{ width: 80, marginLeft: 8 }}
                  value={p.currency || ''}
                  onChange={(e) => {
                    setFactory(prev => ({
                      ...prev,
                      factory_prices: prev.factory_prices.map(x => x.id === p.id ? { ...x, currency: e.target.value } : x)
                    }));
                  }}
                />
                <button
                  style={{ marginLeft: 8 }}
                  onClick={async () => {
                    const curr = factory.factory_prices.find(x => x.id === p.id);
                    await handleUpdatePrice(p.id, curr.title, curr.price, curr.currency);
                  }}
                >Update</button>
                <button onClick={() => handleDeletePrice(p.id)} style={{ marginLeft: 8 }}>Удалить</button>
              </li>
            )) : <li>Нет прайсов</li>}
          </ul>
        </div>
      )}

      {tab === 'docs' && (
        <div>
          <h3>Файлы</h3>
          <div>
            <input type="file" onChange={handleFileUpload} />
          </div>
          <div style={{ marginTop: 12 }}>
            {factory.factory_files && factory.factory_files.length > 0 ? factory.factory_files.map(f => (
              <div key={f.id} style={{ marginBottom: 8 }}>
                <a href={f.url} target="_blank" rel="noreferrer">{f.storage_path?.split('/').pop() || f.url}</a>
                {' '}
                <button onClick={() => handleDeleteFile(f)} style={{ marginLeft: 8 }}>Удалить</button>
              </div>
            )) : <div>Нет файлов</div>}
          </div>
        </div>
      )}
    </div>
  );
}
