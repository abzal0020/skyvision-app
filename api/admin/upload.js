// api/admin/upload.js — обёрнутый вариант (ставишь целиком)
import Busboy from 'busboy';
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'factory_media';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const token = (req.headers.authorization || '').split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    // проверка админа (упрощённо)
    let uid = null;
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}` }});
        if (!resp.ok) return res.status(401).json({ error: 'Invalid token' });
        const json = await resp.json(); uid = json?.id || null;
      } else uid = user.id;
      if (!uid) return res.status(401).json({ error: 'Unable to resolve user' });
      const { data: admins, error: adminsErr } = await supabaseAdmin.from('admins').select('id').eq('user_id', uid).limit(1);
      if (adminsErr) return res.status(500).json({ error: 'Failed to check admin' });
      if (!admins || admins.length === 0) return res.status(403).json({ error: 'User is not an admin' });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Auth check failed: ' + String(e?.message || e) }); }
    // parse multipart
    const busboy = new Busboy({ headers: req.headers });
    const fields = {}; let fileBuffer = null, filename = null, mimeType = null;
    busboy.on('file', (fieldname, file, info) => {
      filename = info?.filename || 'file'; mimeType = info?.mimeType || 'application/octet-stream';
      const chunks = []; file.on('data', (d) => chunks.push(d)); file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });
    busboy.on('field', (n, v) => { fields[n] = v; });
    busboy.on('finish', async () => {
      try {
        const factoryId = fields.factoryId; if (!factoryId) return res.status(400).json({ error: 'factoryId required' });
        if (!fileBuffer) return res.status(400).json({ error: 'No file uploaded' });
        const path = `factories/${factoryId}/${Date.now()}_${filename.replace(/\s+/g,'_')}`;
        const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(path, fileBuffer, { contentType: mimeType });
        if (uploadError) return res.status(500).json({ error: 'Upload failed', details: uploadError });
        const { publicURL } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
        const meta = { size: fileBuffer.length, mimeType };
        const { data: insertData, error: insertError } = await supabaseAdmin.from('factory_media').insert([{
          factory_id: factoryId, type: mimeType.startsWith('image/') ? 'image' : 'document', storage_path: path, url: publicURL || null, title: fields.title || null, caption: fields.caption || null, meta
        }]).select().single();
        if (insertError) return res.status(500).json({ error: 'DB insert failed', details: insertError });
        return res.status(200).json({ media: insertData });
      } catch (err) { console.error(err); return res.status(500).json({ error: 'Internal error: ' + String(err?.message || err) }); }
    });
    req.pipe(busboy);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Fatal error: ' + String(err?.message || err) }); }
}
