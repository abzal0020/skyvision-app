import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'; // или используемый в проекте

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  // Получаем профиль и проверяем роль
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profErr) {
    console.error('profile lookup error', profErr);
    return res.status(500).json({ error: 'Profile lookup failed' });
  }

  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const factoryId = req.query.id;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('prices')
      .select('*')
      .eq('factory_id', factoryId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const body = req.body;
    const { data, error } = await supabase
      .from('prices')
      .insert([{ ...body, factory_id: factoryId, created_by: user.id }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
