// pages/api/media/signed.js
// Server-side endpoint: возвращает signed URL для storage_path
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // <- Установи в Vercel как секрет

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { path, expires = '3600' } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'path is required' });
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('factory_media')
      .createSignedUrl(path, parseInt(expires, 10));

    if (error) {
      console.error('createSignedUrl error', error);
      return res.status(500).json({ error: error.message || error });
    }

    return res.status(200).json({ signedUrl: data?.signedUrl || null });
  } catch (e) {
    console.error('signed url handler error', e);
    return res.status(500).json({ error: String(e) });
  }
}
