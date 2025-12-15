// api/admin/factories/[id].js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Вспомогательная проверка admin по токену (как в upload.js)
async function getAdminUid(token) {
  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    const user = data?.user ?? null;
    if (user?.id) return user.id;
    const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    return json?.id || null;
  } catch (e) {
    console.error('getAdminUid error', e);
    return null;
  }
}

async function checkIsAdmin(uid) {
  if (!uid) return false;
  const { data, error } = await supabaseAdmin.from('admins').select('id').eq('user_id', uid).limit(1);
  if (error) {
    console.error('admins query error', error);
    return false;
  }
  return (data && data.length > 0);
}

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    const authHeader = req.headers.authorization || '';
    const token = (authHeader.split && authHeader.split(' ')[1]) || null;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const uid = await getAdminUid(token);
    if (!uid) return res.status(401).json({ error: 'Invalid token' });
    const isAdmin = await checkIsAdmin(uid);
    if (!isAdmin) return res.status(403).json({ error: 'User is not an admin' });

    if (req.method === 'GET') {
      // Получаем фабрику и зависимости
      const { data: factoryData, error: factoryErr } = await supabaseAdmin
        .from('factories')
        .select('*')
        .eq('id', id)
        .single();

      if (factoryErr) {
        console.error('factory fetch error', factoryErr);
        return res.status(500).json({ error: 'Failed to fetch factory', details: factoryErr });
      }

      const { data: media, error: mediaErr } = await supabaseAdmin
        .from('factory_media')
        .select('*')
        .eq('factory_id', id)
        .order('order', { ascending: true });

      const { data: prices, error: pricesErr } = await supabaseAdmin
        .from('factory_prices')
        .select('*')
        .eq('factory_id', id)
        .order('created_at', { ascending: false });

      const { data: documents, error: docsErr } = await supabaseAdmin
        .from('factory_documents')
        .select('*')
        .eq('factory_id', id)
        .order('created_at', { ascending: false });

      if (mediaErr || pricesErr || docsErr) {
        console.error('related fetch errors', { mediaErr, pricesErr, docsErr });
      }

      return res.status(200).json({
        factory: factoryData,
        media: media || [],
        prices: prices || [],
        documents: documents || []
      });
    } else if (req.method === 'PATCH') {
      let body = req.body;
      // Возможно body приходит как string
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { /* ignore */ }
      }

      // Разрешаем обновлять поля, которые реально используются в форме админки
      const allowed = [
        'name',
        'description',
        'address',
        'phone',
        'email',
        'slug',
        'featured_media_id',
        // Добавлены разрешённые поля
        'published',
        'min_order',
        'payment_terms',
        'logistics',
        'city'
      ];

      const payload = {};
      for (const k of allowed) if (k in body) payload[k] = body[k];

      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'No updatable fields provided' });
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('factories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (updateErr) {
        console.error('factory update error', updateErr);
        return res.status(500).json({ error: 'Failed to update factory', details: updateErr });
      }

      return res.status(200).json({ factory: updated });
    } else {
      res.setHeader('Allow', 'GET, PATCH');
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('handler fatal', err);
    return res.status(500).json({ error: 'Fatal error: ' + String(err?.message || err) });
  }
}
