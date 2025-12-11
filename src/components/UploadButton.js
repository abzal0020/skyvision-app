import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UploadButton({ factoryId, onUploaded }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Получаем токен текущей сессии
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert('Вы не авторизованы. Войдите и повторите.');
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
        body: form,
      });

      // Всегда парсим как JSON — сервер теперь возвращает JSON в ошибках и успехе
      let json;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.error('Failed to parse response as JSON', parseErr);
        alert('Сервер вернул неожиданный ответ. Проверьте логи.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // Показать понятную ошибку пользователю
        const msg = json?.error || json?.message || JSON.stringify(json);
        alert('Ошибка загрузки: ' + msg);
        console.error('Upload error:', res.status, json);
        setLoading(false);
        return;
      }

      // Успех — вызываем callback и коротко уведомляем
      onUploaded && onUploaded(json.media);
      alert('Файл успешно загружен.');
    } catch (err) {
      console.error('Upload request failed', err);
      alert('Ошибка запроса: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFile}
        disabled={loading}
      />
      {loading && <div style={{ marginTop: 8 }}>Загрузка...</div>}
    </div>
  );
}
