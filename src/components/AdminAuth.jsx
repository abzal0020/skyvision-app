import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function AdminAuth({ onAuthChange }) {
  const { user, profile, loading } = useAuth();

  // локальное состояние только для формы входа
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState('');

  // уведомляем родителя при изменении user
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
      setMessage('Signed in');
      setEmail('');
      setPassword('');
      // AuthContext подпишется и обновит user/profile
    } catch (err) {
      setMessage(err?.message || 'Sign in failed');
    } finally {
      setSigning(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // AuthContext обработает изменение и очистит профиль
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  if (loading) {
    return <div style={{ padding: 8 }}>Загрузка профиля...</div>;
  }

  if (user) {
    const nameLabel = (profile && profile.display_name) || user.email || user.id;
    return (
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 14 }}>
          Вход: <strong>{nameLabel}</strong>
          {profile?.role && <span style={{ marginLeft: 8, color: '#666' }}>({profile.role})</span>}
        </div>
        <button onClick={handleSignOut} style={{ padding: '6px 10px', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="admin email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '6px 8px' }} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '6px 8px' }} />
      <button type="submit" disabled={signing} style={{ padding: '6px 10px', cursor: 'pointer' }}>
        {signing ? 'Signing...' : 'Sign in'}
      </button>
      {message && <div style={{ color: 'red', marginLeft: 8 }}>{message}</div>}
    </form>
  );
}
