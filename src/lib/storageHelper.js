import { supabase } from './supabaseClient';

/**
 * uploadFile(bucket, path, file) -> { publicUrl, path }
 * deleteFile(bucket, path) -> { error }
 */
export async function uploadFile(bucket, path, file) {
  // path example: `${factoryId}/${filename}`
  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    return { error: uploadError };
  }

  // Получим публичный url (если bucket публичный)
  const { publicURL, error: urlError } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  if (urlError) {
    return { error: urlError };
  }

  return { publicUrl, path: data.path };
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error };
}
