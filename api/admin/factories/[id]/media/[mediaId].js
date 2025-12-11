 url=https://github.com/abzal0020/skyvision-app/blob/main/api/admin/factories/%5Bid%5D/media/%5BmediaId%5D.js
// api/admin/factories/[id]/media/[mediaId].js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'factory_media';

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

    // check admin
    const { data: admins } = await supabaseAdmin.from('admins').select('id').eq('user_id', uid).limit(1);
    if (!admins || admins.length === 0) return res.status(403).json({ error: 'User is not an admin' });

    if (req.method === 'DELETE') {
      // Найти запись media
      const { data: mediaRec, error: mediaErr } = await supabaseAdmin.from('factory_media').select('*').eq('id', mediaId).single();
      if (mediaErr || !mediaRec) {
        console.error('media fetch err', mediaErr);
        return res.status(404).json({ error: 'Media not found' });
      }
      const storagePath = mediaRec.storage_path;
      // Удаляем файл из storage
      try {
        const { error: removeErr } = await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
        if (removeErr) {
          console.error('storage remove err', removeErr);
          // продолжаем и удалим запись в БД, но сообщим об ошибке удаления файла
        }
      } catch (e) {
        console.error('storage remove exception', e);
      }

      // Удаляем запись в БД
      const { error: delErr } = await supabaseAdmin.from('factory_media').delete().eq('id', mediaId);
      if (delErr) {
        console.error('db delete err', delErr);
        return res.status(500).json({ error: 'Failed to delete media record', details: delErr });
      }

      return res.status(200).json({ success: true });
    } else {
      res.setHeader('Allow', 'DELETE');
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('media handler fatal', err);
    return res.status(500).json({ error: 'Fatal error: ' + String(err?.message || err) });
  }
}
