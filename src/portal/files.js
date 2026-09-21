import { supabase } from '../lib/supabaseClient';
import { result } from './api';

export const documentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
export async function uploadFile(bucket, prefix, file, types, maxMB) {
  if (!file || !types.includes(file.type) || file.size > maxMB * 1024 * 1024 || file.size === 0) throw new Error('INVALID_FILE');
  const extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx' }[file.type];
  const path = `${prefix}/${crypto.randomUUID()}.${extension}`;
  await result(supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false }));
  return path;
}
export async function documentFile(id, file) {
  const path = await uploadFile('skyvision-documents', id, file, documentTypes, 25);
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return { path, name: file.name.slice(0, 240), sha256: Array.from(new Uint8Array(digest)).map(n => n.toString(16).padStart(2, '0')).join('') };
}
export async function downloadFile(bucket, path, name) {
  const data = await result(supabase.storage.from(bucket).createSignedUrl(path, 60, { download: name }));
  const link = document.createElement('a');
  link.href = data.signedUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
}
