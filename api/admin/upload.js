// api/admin/upload.js — версия с require для busboy
const Busboy = require('busboy');
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'factory_media';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    // Проверка админа
    let uid = null;
    try {
      const { data: { user }, error: getUserErr } = await supabaseAdmin.auth.getUser(token);
      if (getUserErr || !user) {
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) return res.status(401).json({ error: 'Invalid token' });
        const json = await resp.json();
        uid = json?.id || null;
      } else {
        uid = user.id;
      }

      if (!uid) return res.status(401).json({ error: 'Unable to resolve user' });

      const { data: admins, error: adminsErr } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('user_id', uid)
        .limit(1);

      if (adminsErr) {
        console.error('adminsErr', adminsErr);
        return res.status(500).json({ error: 'Failed to check admin' });
      }

      if (!admins || admins.length === 0) {
        return res.status(403).json({ error: 'User is not an admin' });
      }
    } catch (e) {
      console.error('Auth check error', e);
      return res.status(500).json({ error: 'Auth check failed: ' + String(e?.message || e) });
    }

    // Parse multipart
    const busboy = new Busboy({ headers: req.headers });
    const fields = {};
    let fileBuffer = null;
    let filename = null;
    let mimeType = null;

    busboy.on('file', (fieldname, file, info) => {
      filename = info?.filename || 'file';
      mimeType = info?.mimeType || 'application/octet-stream';
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('field', (name, val) => {
      fields[name] = val;
    });

    busboy.on('finish', async () => {
      try {
        const factoryId = fields.factoryId;
        if (!factoryId) return res.status(400).json({ error: 'factoryId required' });
        if (!fileBuffer) return res.status(400).json({ error: 'No file uploaded' });

        const timestamp = Date.now();
        const safeName = filename.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '');
        const path = `factories/${factoryId}/${timestamp}_${safeName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(path, fileBuffer, { contentType: mimeType });

        if (uploadError) {
          console.error('uploadError', uploadError);
          return res.status(500).json({ error: 'Upload failed', details: uploadError });
        }

        const { publicURL } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

        const meta = { size: fileBuffer.length, mimeType };
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('factory_media')
          .insert([{
            factory_id: factoryId,
            type: fields.type || (mimeType.startsWith('image/') ? 'image' : 'document'),
            storage_path: path,
            url: publicURL || null,
            title: fields.title || null,
            caption: fields.caption || null,
            meta
          }])
          .select()
          .single();

        if (insertError) {
          console.error('insertError', insertError);
          return res.status(500).json({ error: 'DB insert failed', details: insertError });
        }

        return res.status(200).json({ media: insertData });
      } catch (err) {
        console.error('finish error', err);
        return res.status(500).json({ error: 'Internal error: ' + String(err?.message || err) });
      }
    });

    req.pipe(busboy);
  } catch (err) {
    console.error('upload handler fatal error', err);
    return res.status(500).json({ error: 'Fatal error: ' + String(err?.message || err) });
  }
}
