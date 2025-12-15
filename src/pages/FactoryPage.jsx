import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function FactoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // fetch factory by slug with nested prices and media
        const { data, error } = await supabase
          .from('factories')
          .select('*, factory_prices(*), factory_media(*)')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;

        if (!data) {
          setFactory(null);
          setMessage('Фабрика не найдена');
        } else {
          setFactory(data);
          setMessage(null);
        }
      } catch (err) {
        console.error('Failed to load factory', err);
        setMessage('Ошибка загрузки данных');
        setFactory(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
  if (!factory) return (
    <div style={{ padding: 20 }}>
      <p>{message || 'Фабрика не найдена'}</p>
      <button onClick={() => navigate('/prices')}>К списку прайсов</button>
    </div>
  );

  // pick most recent price if exists
  let priceRec = null;
  if (Array.isArray(factory.factory_prices) && factory.factory_prices.length > 0) {
    const withDates = factory.factory_prices.filter(p => p && p.created_at);
    if (withDates.length > 0) {
      priceRec = [...withDates].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
    } else {
      priceRec = factory.factory_prices[0];
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      <Link to="/prices">← К списку</Link>
      <h1>{factory.name}</h1>
      <p style={{ color: '#666' }}>{factory.city || '—'}</p>

      <section style={{ marginTop: 16 }}>
        <h3>Прайс</h3>
        {priceRec ? (
          <div style={{ padding: 12, borderRadius: 8, background: '#f8f9fa', display: 'inline-block' }}>
            <div style={{ fontWeight: 700, fontSize: 20 }}>
              {priceRec.price ?? '—'} {priceRec.currency || ''}
            </div>
            {priceRec.note && <div style={{ marginTop: 6 }}>{priceRec.note}</div>}
            <div style={{ marginTop: 6, color: '#666', fontSize: 13 }}>
              Мин. партия: {priceRec.min_qty ?? '—'}
            </div>
          </div>
        ) : (
          <div>Прайс отсутствует</div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Информация</h3>
        <div><strong>Адрес / город:</strong> {factory.city || '—'}</div>
        <div><strong>Мин. партия:</strong> {factory.min_order ?? '—'}</div>
        <div><strong>Условия оплаты:</strong> {factory.payment_terms || '—'}</div>
        <div style={{ marginTop: 10 }}>{factory.description}</div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Галерея</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.isArray(factory.factory_media) && factory.factory_media.length > 0 ? factory.factory_media.map(m => (
            <div key={m.id} style={{ width: 200, border: '1px solid #eee', padding: 6 }}>
              {m.url ? (m.type === 'image' || (m.file_type && m.file_type.startsWith && m.file_type.startsWith('image')) ?
                <img src={m.url} alt={m.title || ''} style={{ width: '100%', height: 120, objectFit: 'cover' }} /> :
                <a href={m.url} target="_blank" rel="noreferrer">Open file</a>
              ) : <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No preview</div>}
              <div style={{ fontSize: 12, marginTop: 6 }}>{m.title || m.storage_path?.split('/').pop()}</div>
            </div>
          )) : <div>Нет медиа</div>}
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Документы</h3>
        <ul>
          {Array.isArray(factory.factory_documents) && factory.factory_documents.length > 0 ? factory.factory_documents.map(d => (
            <li key={d.id}><a href={d.url} target="_blank" rel="noreferrer">{d.title || d.storage_path?.split('/').pop()}</a></li>
          )) : <li>Нет документов</li>}
        </ul>
      </section>
    </div>
  );
}
