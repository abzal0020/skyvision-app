// src/components/UploadButton.js
// Простой React компонент для загрузки файла через ваш серверный endpoint /api/admin/upload
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UploadButton({ factoryId, onUploaded }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Получаем access token текущей сессии
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
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      const json = await res.json();
      if (!res.ok) {
        console.error('Upload error', json);
        alert('Ошибка загрузки: ' + (json?.error || JSON.stringify(json)));
        setLoading(false);
        return;
      }

      // json.media — объект записи в factory_media
      onUploaded && onUploaded(json.media);
      alert('Файл загружен успешно');
    } catch (err) {
      console.error(err);
      alert('Ошибка: ' + err.message);
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
