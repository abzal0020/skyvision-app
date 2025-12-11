// src/components/UploadButton.js (diagnostic)
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UploadButton({ factoryId, onUploaded }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('Не авторизованы. Войдите и повторите.');
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append('file', file);
      form.append('factoryId', factoryId);
      form.append('title', file.name);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const text = await res.text();
      // Показываем HTTP статус и начало ответа — скопируй и пришли мне:
      alert('HTTP ' + res.status + '\\n' + text.slice(0, 4000));
      // Пытаемся распарсить JSON и вернуть media
      try {
        const json = JSON.parse(text);
        if (res.ok) onUploaded && onUploaded(json.media);
      } catch (err) {
        console.error('Response not JSON:', text);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка запроса: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFile} />
      {loading && <div>Загрузка...</div>}
    </div>
  );
}
