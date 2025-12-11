import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { uploadFile, deleteFile } from '../../lib/storageHelper';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = 'factory-files';

export default function FactoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // factory fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [minOrder, setMinOrder] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [logistics, setLogistics] = useState(''); // per-factory logistics (optional)

  // price form
  const [priceTitle, setPriceTitle] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('USD');

  useEffect(() => {
    if (!id) return;
    loadFactory();
    // eslint-disable-next-line
  }, [id]);

  async function loadFactory() {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase
        .from('factories')
        .select('*, factory_prices(*), factory_files(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setFactory(null);
        setMessage({ type: 'error', text: 'Фабрика не найдена' });
      } else {
        setFactory(data);
        setName(data.name || '');
        setSlug(data.slug || '');
        setCity(data.city || '');
        setDescription(data.description || '');
        setPublished(Boolean(data.published));
        setMinOrder(data.min_order || '');
        setPaymentTerms(data.payment_terms || '');
        setLogistics(data.logistics ?? '');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage(null);
    try {
      const { error } = await supabase
        .from('factories')
        .update({
          name: name.trim(),
          slug: slug.trim(),
          city: city || null,
          description,
          published,
          min_order: minOrder === '' ? null : Number(minOrder),
          payment_terms: paymentTerms || null,
          logistics: logistics === '' ? null : Number(logistics)
        })
        .eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Данные сохранены' });
      await loadFactory();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  async function handleAddPrice(e) {
    e.preventDefault();
    if (!priceTitle) {
      setMessage({ type: 'error', text: 'Название прайса нужно' });
      return;
    }
    try {
      const { error } = await supabase
        .from('factory_prices')
        .insert([{
          id: uuidv4(),
          factory_id: id,
          title: priceTitle,
          price: priceValue ? Number(priceValue) : null,
          currency: priceCurrency
        }]);
      if (error) throw error;
      setPriceTitle(''); setPriceValue(''); setPriceCurrency('USD');
      setMessage({ type: 'success', text: 'Прайс добавлен' });
      await loadFactory();
    } catch (err) {
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
      await loadFactory();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  async function handleDeletePrice(priceId) {
    if (!window.confirm('Удалить прайс?')) return;
    try {
      const { error } = await supabase.from('factory_prices').delete().eq('id', priceId);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Прайс удалён' });
      await loadFactory();
    } catch (err) {
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
      await loadFactory();
    } catch (err) {
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
      await loadFactory();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) });
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate('/admin/factories')}>← Назад</button>
      <h1>Редактировать завод</h1>

      {message && (
        <div style={{ margin: '12px 0', color: message.type === 'error' ? 'red' : 'green' }}>
          {message.text}
        </div>
      )}

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
          <label>Логистика (тут можно задать логистику по фабрике, если используется)</label><br />
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

      <hr />

      <h3>Прайсы</h3>
      <form onSubmit={handleAddPrice} style={{ marginBottom: 12 }}>
        <input placeholder="Название прайса" value={priceTitle} onChange={(e) => setPriceTitle(e.target.value)} required />
        <input placeholder="Цена" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} style={{ width: 100, marginLeft: 8 }} />
        <input placeholder="Валюта" value={priceCurrency} onChange={(e) => setPriceCurrency(e.target.value)} style={{ width: 80, marginLeft: 8 }} />
        <button type="submit" style={{ marginLeft: 8 }}>Добавить прайс</button>
      </form>

      <ul>
        {factory.factory_prices?.map(p => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <input
              style={{ width: 220 }}
              value={p.title}
              onChange={(e) => {
                // локально меняем объект, не сохраняем до нажатия Update
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
                // Берём текущие значения из factory.state и отправляем update
                const curr = factory.factory_prices.find(x => x.id === p.id);
                await handleUpdatePrice(p.id, curr.title, curr.price, curr.currency);
              }}
            >Update</button>
            <button onClick={() => handleDeletePrice(p.id)} style={{ marginLeft: 8 }}>Удалить</button>
          </li>
        )) || <li>Нет прайсов</li>}
      </ul>

      <hr />

      <h3>Файлы</h3>
      <div>
        <input type="file" onChange={handleFileUpload} />
      </div>
      <div style={{ marginTop: 12 }}>
        {factory.factory_files?.map(f => (
          <div key={f.id} style={{ marginBottom: 8 }}>
            <a href={f.url} target="_blank" rel="noreferrer">{f.storage_path?.split('/').pop() || f.url}</a>
            {' '}
            <button onClick={() => handleDeleteFile(f)} style={{ marginLeft: 8 }}>Удалить</button>
          </div>
        )) || <div>Нет файлов</div>}
      </div>
    </div>
  );
}
