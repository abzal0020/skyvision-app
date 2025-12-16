// pages/api/media/signed.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Установи в Vercel как secret
const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'factory_media';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Supabase server env variables are not set (SUPABASE_URL / SERVICE_ROLE_KEY)');
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    let { path, expires = '3600' } = req.query;

    if (!path) {
      return res.status(400).json({ error: 'path is required' });
    }

    // req.query may be decoded already, but be safe:
    path = Array.isArray(path) ? path[0] : path;
    try { path = decodeURIComponent(path); } catch (e) { /* ignore */ }

    // remove leading slashes which can break Supabase storage path
    path = path.replace(/^\/+/, '');

    const ttl = Math.max(60, Math.min(60 * 60 * 24, parseInt(expires, 10) || 3600)); // clamp 60..24h

    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, ttl);

    if (error) {
      console.error('createSignedUrl error', error);
      return res.status(500).json({ error: error.message || error });
    }

    if (!data || !data.signedUrl) {
      // Unexpected, but handle gracefully
      console.warn('createSignedUrl returned empty data for path:', path);
      return res.status(500).json({ error: 'Failed to create signed url' });
    }

    return res.status(200).json({ signedUrl: data.signedUrl });
  } catch (e) {
    console.error('signed url handler error', e);
    return res.status(500).json({ error: String(e) });
  }
}
