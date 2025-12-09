import { supabase } from './supabaseClient';

export async function uploadFile(bucket, path, file) {
  // path example: `${factoryId}/${filename}`
  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    return { error: uploadError };
  }

  // Supabase возвращает поле publicURL (обратите внимание на регистр)
  const { publicURL, error: urlError } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  if (urlError) {
    return { error: urlError };
  }

  // Возвращаем согласованное имя publicUrl (удобно использовать в коде)
  return { publicUrl: publicURL, path: data.path };
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error };
}
