import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminAuth({ onAuthChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      onAuthChange && onAuthChange(data?.user ?? null);
    })();

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      onAuthChange && onAuthChange(u);
    });

    return () => subscription?.unsubscribe();
  }, [onAuthChange]);

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      onAuthChange && onAuthChange(data.user);
      setMessage('Signed in');
    } catch (err) {
      setMessage(err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    onAuthChange && onAuthChange(null);
  }

  if (user) {
    return (
      <div style={{ marginBottom: 12 }}>
        <div>Signed in as: {user.email || user.id}</div>
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} style={{ marginBottom: 12 }}>
      <input
        placeholder="admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <button type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign in'}</button>
      {message && <div style={{ color: 'red', marginTop: 8 }}>{message}</div>}
    </form>
  );
}
