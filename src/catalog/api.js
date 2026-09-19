import { supabase } from '../lib/supabaseClient';
import { safeUrl } from './model';

export async function listCatalog(admin = false) {
  const { data, error } = await supabase.from(admin ? 'sv_catalog_drafts' : 'sv_catalog').select('*').order('slug');
  if (error) throw error;
  return data || [];
}
export async function getFactory(slug) {
  const { data, error } = await supabase.from('sv_catalog').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data;
}
export async function saveFactory(id, slug, content, version, action = 'draft') {
  const { data, error } = await supabase.rpc('sv_save_factory', { factory_id: id, factory_slug: slug, document: content, expected_version: version, operation: action });
  if (error) throw error;
  return data;
}
export async function isCatalogAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase.from('sv_catalog_admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
export async function assetUrl(asset) {
  if (!asset.path) return safeUrl(asset.url);
  const { data, error } = await supabase.storage.from('skyvision-catalog').createSignedUrl(asset.path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
async function shrinkImage(file) {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1920 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height); img.close();
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Не удалось обработать фото')), 'image/webp', 0.86));
}
export async function uploadAsset(file, factoryId) {
  const allowed = ['image/jpeg','image/png','image/webp','video/mp4','video/webm','application/pdf'];
  if (!allowed.includes(file.type)) throw new Error(`${file.name}: поддерживаются JPG, PNG, WebP, MP4, WebM и PDF.`);
  if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name}: размер больше 50 МБ.`);
  const image = file.type.startsWith('image/');
  const blob = image ? await shrinkImage(file) : file;
  const ext = image ? 'webp' : file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
  const path = `${factoryId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('skyvision-catalog').upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;
  return { id: crypto.randomUUID(), type: image ? 'image' : ext === 'pdf' ? 'document' : 'video', path, title: { ru: file.name.replace(/\.[^.]+$/, ''), zh: '' } };
}
