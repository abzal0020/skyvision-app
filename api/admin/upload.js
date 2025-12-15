// api/admin/upload.js
const fs = require('fs');
const pathModule = require('path');
const formidable = require('formidable');
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'factory_media';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// helper to extract public url from different supabase SDK shapes
function extractPublicUrl(resp) {
  if (!resp) return null;
  if (resp.publicURL) return resp.publicURL; // older shapes
  if (resp.data && (resp.data.publicUrl || resp.data.publicURL)) return resp.data.publicUrl || resp.data.publicURL;
  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const token = (authHeader.split(' ')[1]) || null;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    // Проверка админа (попытка через admin client)
    let uid = null;
    try {
      const getUserRes = await supabaseAdmin.auth.getUser(token);
      const user = getUserRes?.data?.user ?? null;
      if (user && user.id) {
        uid = user.id;
      } else {
        const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) return res.status(401).json({ error: 'Invalid token' });
        const json = await resp.json();
        uid = json?.id || null;
      }

      if (!uid) return res.status(401).json({ error: 'Unable to resolve user id' });

      const { data: admins, error: adminsErr } = await supabaseAdmin
        .from('admins')
        .select('id')
        .eq('user_id', uid)
        .limit(1);

      if (adminsErr) {
        console.error('Failed to query admins table', adminsErr);
        return res.status(500).json({ error: 'Failed to check admin' });
      }

      if (!admins || admins.length === 0) {
        return res.status(403).json({ error: 'User is not an admin' });
      }
    } catch (e) {
      console.error('Auth check error', e);
      return res.status(500).json({ error: 'Auth check failed: ' + String(e?.message || e) });
    }

    // Парсим форму через formidable
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.multiples = false;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('formidable parse error', err);
        return res.status(500).json({ error: 'Failed to parse form: ' + String(err?.message || err) });
      }

      try {
        const factoryId = fields?.factoryId || fields?.factoryid || fields?.factory_id;
        if (!factoryId) return res.status(400).json({ error: 'factoryId required' });

        // Найти файл (поддерживаем разные имена)
        let fileObj = null;
        if (files) {
          if (files.file) fileObj = files.file;
          else {
            const keys = Object.keys(files);
            if (keys.length > 0) fileObj = files[keys[0]];
          }
        }

        if (!fileObj) return res.status(400).json({ error: 'No file uploaded' });

        const tempPath = fileObj.filepath || fileObj.path || fileObj.file;
        if (!tempPath || !fs.existsSync(tempPath)) {
          console.error('Temp file not found', tempPath, fileObj);
          return res.status(500).json({ error: 'Uploaded temp file not found' });
        }

        const fileBuffer = fs.readFileSync(tempPath);
        const filenameRaw = fileObj.originalFilename || fileObj.name || pathModule.basename(tempPath);
        const mimeType = fileObj.mimetype || fileObj.type || 'application/octet-stream';

        const timestamp = Date.now();
        const safeName = (filenameRaw || 'file').replace(/\s+/g, '_').replace(/[^\w.\-]/g, '');
        const storagePath = `factories/${factoryId}/${timestamp}_${safeName}`;

        // Загружаем в Supabase Storage
        const { error: uploadError, data: uploadData } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(storagePath, fileBuffer, { contentType: mimeType });

        if (uploadError) {
          console.error('uploadError (formidable)', uploadError);
          return res.status(500).json({ error: 'Upload failed', details: uploadError });
        }

        // Попытка получить public URL
        let publicURL = null;
        try {
          const publicRes = await supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
          publicURL = extractPublicUrl(publicRes);
        } catch (e) {
          console.warn('getPublicUrl failed', e);
          publicURL = null;
        }

        // Если нет публичного URL (например бакет приватный) — создаём signed URL (временный)
        let signedUrl = null;
        try {
          if (!publicURL) {
            // 7 дней signed url
            const expiresIn = 60 * 60 * 24 * 7;
            const { data: signedData, error: signedErr } = await supabaseAdmin.storage
              .from(BUCKET)
              .createSignedUrl(storagePath, expiresIn);
            if (!signedErr && signedData?.signedUrl) {
              signedUrl = signedData.signedUrl;
            } else if (signedErr) {
              console.warn('createSignedUrl error', signedErr);
            }
          }
        } catch (e) {
          console.warn('createSignedUrl threw', e);
        }

        // Сохраняем запись в factory_media
        const meta = { size: fileBuffer.length, mimeType };
        const insertObj = {
          factory_id: factoryId,
          type: mimeType?.startsWith?.('image/') ? 'image' : 'document',
          storage_path: storagePath,
          // store publicURL if available, otherwise signedUrl (so frontend can open)
          url: publicURL || signedUrl || null,
          title: fields?.title || null,
          caption: fields?.caption || null,
          meta
        };

        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('factory_media')
          .insert([insertObj])
          .select()
          .single();

        if (insertError) {
          console.error('insertError (formidable)', insertError);
          return res.status(500).json({ error: 'DB insert failed', details: insertError });
        }

        // Удаляем временный файл
        try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }

        // Возвращаем информацию о сохранённом файле, включая url и signedUrl (если есть)
        return res.status(200).json({
          media: insertData,
          publicURL: publicURL || null,
          signedUrl: (!publicURL && signedUrl) ? signedUrl : null
        });
      } catch (e) {
        console.error('Processing error (formidable)', e);
        return res.status(500).json({ error: 'Internal error: ' + String(e?.message || e) });
      }
    });

    // Ответ отправляется в callback form.parse
    return;
  } catch (err) {
    console.error('upload handler fatal error', err);
    return res.status(500).json({ error: 'Fatal error: ' + String(err?.message || err) });
  }
}
