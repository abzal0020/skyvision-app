import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // если supabaseClient.js лежит в src/, поправь путь

export default function FactoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('factories')
        .select('*, factory_prices(*), factory_files(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('Failed to load factory:', error);
      } else if (mounted) {
        setFactory(data);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!factory) return <div>Фабрика не найдена</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate('/admin/factories')}>← Назад</button>
      <h1>{factory.name}</h1>
      <p><b>Slug:</b> {factory.slug}</p>
      <p><b>Описание:</b> {factory.description}</p>
      <p><b>Published:</b> {factory.published ? 'Да' : 'Нет'}</p>

      <h3>Прайсы</h3>
      <ul>
        {factory.factory_prices && factory.factory_prices.length > 0
          ? factory.factory_prices.map(p => <li key={p.id}>{p.title} — {p.price}</li>)
          : <li>Нет прайсов</li>}
      </ul>

      <h3>Файлы</h3>
      <div>
        {factory.factory_files && factory.factory_files.length > 0
          ? factory.factory_files.map(f => (
              <div key={f.id}>
                <a href={f.url} target="_blank" rel="noreferrer">{f.storage_path || f.url}</a>
              </div>
            ))
          : <div>Нет файлов</div>}
      </div>
    </div>
  );
}
