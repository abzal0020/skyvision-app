import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient'; // убедись, что путь корректен: src/lib/supabaseClient.js

export default function FactoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFactory = async (factoryId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('factories')
        .select('*, factory_prices(*), factory_files(*)')
        .eq('id', factoryId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setFactory(null);
        setError('Фабрика не найдена');
      } else {
        setFactory(data);
      }
    } catch (err) {
      console.error('Failed to load factory:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadFactory(id);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
  if (error) return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate('/admin/factories')}>← Назад</button>
      <div style={{ color: 'red', marginTop: 12 }}>{error}</div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => loadFactory(id)}>Повторить</button>
      </div>
    </div>
  );
  if (!factory) return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate('/admin/factories')}>← Назад</button>
      <div>Фабрика не найдена</div>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate('/admin/factories')}>← Назад</button>
      <h1>{factory.name}</h1>
      <p><b>Slug:</b> {factory.slug}</p>
      <p><b>Описание:</b> {factory.description || '—'}</p>
      <p><b>Published:</b> {factory.published ? 'Да' : 'Нет'}</p>

      <h3>Прайсы</h3>
      <ul>
        {factory.factory_prices && factory.factory_prices.length > 0
          ? factory.factory_prices.map(p => (
              <li key={p.id}>
                {p.title} — {p.price ?? '—'} {p.currency || ''}
              </li>
            ))
          : <li>Нет прайсов</li>}
      </ul>

      <h3>Файлы</h3>
      <div>
        {factory.factory_files && factory.factory_files.length > 0
          ? factory.factory_files.map(f => (
              <div key={f.id} style={{ marginBottom: 8 }}>
                <a href={f.url || '#'} target="_blank" rel="noreferrer">
                  {f.storage_path ? f.storage_path.split('/').pop() : (f.url || 'Открыть файл')}
                </a>
              </div>
            ))
          : <div>Нет файлов</div>}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => loadFactory(id)} style={{ marginRight: 8 }}>Обновить</button>
      </div>
    </div>
  );
}
