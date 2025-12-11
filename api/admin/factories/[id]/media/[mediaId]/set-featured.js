 url=https://github.com/abzal0020/skyvision-app/blob/main/api/admin/factories/%5Bid%5D/media/%5BmediaId%5D/set-featured.js
// api/admin/factories/[id]/media/[mediaId]/set-featured.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
  } catch (e) { return null; }
}

export default async function handler(req, res) {
  try {
    const { id, mediaId } = req.query;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const uid = await getAdminUid(token);
    if (!uid) return res.status(401).json({ error: 'Invalid token' });

    const { data: admins } = await supabaseAdmin.from('admins').select('id').eq('user_id', uid).limit(1);
    if (!admins || admins.length === 0) return res.status(403).json({ error: 'User is not an admin' });

    if (req.method === 'POST') {
      const { data: updated, error } = await supabaseAdmin
        .from('factories')
        .update({ featured_media_id: mediaId })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('set featured err', error);
        return res.status(500).json({ error: 'Failed to set featured', details: error });
      }

      return res.status(200).json({ factory: updated });
    } else {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('set-featured fatal', err);
    return res.status(500).json({ error: 'Fatal error: ' + String(err?.message || err) });
  }
}
