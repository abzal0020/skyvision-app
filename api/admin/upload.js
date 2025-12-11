// api/admin/upload.js
// Полный, готовый для вставки файл серверной функции загрузки.
// Поддерживает два парсера multipart: busboy (если доступен) или formidable (как fallback).
// Загружает файл в Supabase Storage и создает запись в таблице factory_media.
// Возвращает JSON-ответы с понятными ошибками для диагностики.

import { createClient } from '@supabase/supabase-js';
const fs = require('fs');
const pathModule = require('path');

// Попытка корректно получить конструктор Busboy (в разных окружениях экспорт может отличаться)
let Busboy = null;
try {
  const b = require('busboy');
  if (typeof b === 'function') Busboy = b;
  else if (b && typeof b.default === 'function') Busboy = b.default;
  else if (b && typeof b.Busboy === 'function') Busboy = b.Busboy;
} catch (e) {
  // busboy не доступен — это нормально, будет использован formidable
  Busboy = null;
}

// Попытка получить formidable, если busboy недоступен
let formidableAvailable = false;
let formidableLib = null;
try {
  const f = require('formidable');
  // В зависимости от версии formidable экспорт может быть функцией или объектом
  formidableLib = f;
  formidableAvailable = true;
} catch (e) {
  formidableAvailable = false;
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'factory_media';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // При старте логируем недостающие env — это поможет в логах Vercel
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Удобная функция для получения public URL в разных версиях SDK
function getPublicUrlFromStorage(storageRes) {
  // Some SDKs return { data: { publicUrl } }, older returned { publicURL }
  if (!storageRes) return null;
  if (storageRes.publicURL) return storageRes.publicURL;
  if (storageRes.data && storageRes.data.publicUrl) return storageRes.data.publicUrl;
  if (storageRes.data && storageRes.data.publicURL) return storageRes.data.publicURL;
  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Проверяем заголовок Authorization
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const token = (authHeader.split(' ')[1]) || null;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Проверка, что пользователь является админом
    let uid = null;
    try {
      // Supabase v2: auth.getUser
      const getUserRes = await supabaseAdmin.auth.getUser(token);
      const user = getUserRes?.data?.user ?? null;
      if (user && user.id) {
        uid = user.id;
      } else {
        // fallback: /auth/v1/user endpoint
        const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resp.ok) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        const json = await resp.json();
        uid = json?.id || null;
      }

      if (!uid) {
        return res.status(401).json({ error: 'Unable to resolve user id' });
      }

      // Проверяем таблицу admins (предполагается колонка user_id)
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

    // Теперь парсим multipart/form-data — два варианта: Busboy (если есть) или formidable
    if (Busboy) {
      // Busboy parsing
      const busboy = new Busboy({ headers: req.headers });
      const fields = {};
      let fileBuffer = null;
      let filename = null;
      let mimeType = null;

      busboy.on('file', (fieldname, file, info) => {
        filename = info?.filename || 'file';
        mimeType = info?.mimeType || info?.mime || 'application/octet-stream';
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
          const factoryId = fields.factoryId || fields.factoryid || fields.factory_id;
          if (!factoryId) return res.status(400).json({ error: 'factoryId required' });
          if (!fileBuffer) return res.status(400).json({ error: 'No file uploaded' });

          const timestamp = Date.now();
          const safeName = (filename || 'file').replace(/\s+/g, '_').replace(/[^\w.\-]/g, '');
          const storagePath = `factories/${factoryId}/${timestamp}_${safeName}`;

          const { error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer, { contentType: mimeType });

          if (uploadError) {
            console.error('uploadError', uploadError);
            return res.status(500).json({ error: 'Upload failed', details: uploadError });
          }

          const publicRes = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
          const publicURL = getPublicUrlFromStorage(publicRes);

          const meta = { size: fileBuffer.length, mimeType };
          const insertObj = {
            factory_id: factoryId,
            type: mimeType?.startsWith?.('image/') ? 'image' : 'document',
            storage_path: storagePath,
            url: publicURL || null,
            title: fields.title || null,
            caption: fields.caption || null,
            meta
          };

          const { data: insertData, error: insertError } = await supabaseAdmin
            .from('factory_media')
            .insert([insertObj])
            .select()
            .single();

          if (insertError) {
            console.error('insertError', insertError);
            return res.status(500).json({ error: 'DB insert failed', details: insertError });
          }

          return res.status(200).json({ media: insertData });
        } catch (err) {
          console.error('finish error (busboy)', err);
          return res.status(500).json({ error: 'Internal error: ' + String(err?.message || err) });
        }
      });

      // Pipe the raw request into busboy
      req.pipe(busboy);
      return; // мы ответим внутри busboy.on('finish')
    } else if (formidableAvailable) {
      // formidable parsing (fallback)
      try {
        // Поддерживаем разные версии formidable:
        // v2: new formidable.IncomingForm(), v3: formidable()
        let form;
        if (typeof formidableLib === 'function') {
          // Some versions export a constructor function
          try {
            form = new formidableLib.IncomingForm ? new formidableLib.IncomingForm() : new formidableLib();
          } catch (e) {
            // fallback
            form = new formidableLib();
          }
        } else if (formidableLib && typeof formidableLib.default === 'function') {
          // ESM default export
          const F = formidableLib.default;
          try {
            form = new F.IncomingForm ? new F.IncomingForm() : new F();
          } catch (e) {
            form = new F();
          }
        } else {
          // generic fallback
          form = new (formidableLib.IncomingForm || formidableLib)();
        }

        // Настройки: сохранять временные файлы с расширением
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

            // files may be under files.file or first key
            let fileObj = null;
            if (files) {
              if (files.file) fileObj = files.file;
              else {
                // take the first file property
                const keys = Object.keys(files);
                if (keys.length > 0) fileObj = files[keys[0]];
              }
            }

            if (!fileObj) return res.status(400).json({ error: 'No file uploaded' });

            // In some versions formidable file path is fileObj.filepath or fileObj.path
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

            const { error: uploadError } = await supabaseAdmin.storage
              .from(BUCKET)
              .upload(storagePath, fileBuffer, { contentType: mimeType });

            if (uploadError) {
              console.error('uploadError (formidable)', uploadError);
              return res.status(500).json({ error: 'Upload failed', details: uploadError });
            }

            const publicRes = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
            const publicURL = getPublicUrlFromStorage(publicRes);

            const meta = { size: fileBuffer.length, mimeType };
            const insertObj = {
              factory_id: factoryId,
              type: mimeType?.startsWith?.('image/') ? 'image' : 'document',
              storage_path: storagePath,
              url: publicURL || null,
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

            // Удаляем временный файл (необязательно, но хорошо)
            try {
              fs.unlinkSync(tempPath);
            } catch (e) {
              // ignore
            }

            return res.status(200).json({ media: insertData });
          } catch (e) {
            console.error('Processing error (formidable)', e);
            return res.status(500).json({ error: 'Internal error: ' + String(e?.message || e) });
          }
        });

        return; // ответ будет отправлен в callback formidable
      } catch (e) {
        console.error('Formidable handling failed', e);
        return res.status(500).json({ error: 'Formidable handling failed: ' + String(e?.message || e) });
      }
    } else {
      console.error('No multipart parser available (busboy and formidable are missing)');
      return res.status(500).json({ error: 'No multipart parser available; install "busboy" or "formidable" in dependencies' });
    }
  } catch (err) {
    console.error('upload handler fatal error', err);
    return res.status(500).json({ error: 'Fatal error: ' + String(err?.message || err) });
  }
}
