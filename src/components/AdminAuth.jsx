import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

/*
  AdminAuth (новая версия)
  - Использует useAuth() для получения user/profile/loading (AuthContext должен быть подключён в index.js)
  - Не вызывает supabase.auth.getUser() напрямую при монтировании
  - При изменении user вызывает onAuthChange(user) (как раньше)
  - Показывает форму входа, если пользователь не авторизован
  - При клике Sign out вызывает supabase.auth.signOut()
*/

export default function AdminAuth({ onAuthChange }) {
  const { user, profile, loading } = useAuth();

  // локальное состояние для формы входа
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState('');

  // уведомляем родителя при изменении user (сохраняем совместимость)
  useEffect(() => {
    if (typeof onAuthChange === 'function') onAuthChange(user);
  }, [user, onAuthChange]);

  const handleSignIn = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSigning(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // AuthContext обработает изменение через onAuthStateChange; здесь можно только показать сообщение
      setMessage('Signed in');
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage(err?.message || 'Sign in failed');
    } finally {
      setSigning(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // AuthContext обновит user/profile
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  if (loading) {
    return <div style={{ padding: 8 }}>Загрузка профиля...</div>;
  }

  // Если пользователь есть — показываем краткую инфу и кнопку Sign out
  if (user) {
    return (
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 14 }}>
          Вход: <strong>{user.email || profile?.display_name || user.id}</strong>
          {profile?.role && <span style={{ marginLeft: 8, color: '#666' }}>({profile.role})</span>}
        </div>
        <button onClick={handleSignOut} style={{ padding: '6px 10px', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    );
  }

  // Если нет пользователя — показываем форму входа
  return (
    <form onSubmit={handleSignIn} style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        placeholder="admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: '6px 8px' }}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ padding: '6px 8px' }}
      />
      <button type="submit" disabled={signing} style={{ padding: '6px 10px', cursor: 'pointer' }}>
        {signing ? 'Signing...' : 'Sign in'}
      </button>
      {message && <div style={{ color: 'red', marginLeft: 8 }}>{message}</div>}
    </form>
  );
}
