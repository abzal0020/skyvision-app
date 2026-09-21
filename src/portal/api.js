import { supabase } from '../lib/supabaseClient';

export async function result(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function errorText(error, zh = false) {
  if (error?.message?.includes('CONFLICT')) return zh ? '内容已更新。请刷新后重试。' : 'Данные изменились. Обновите страницу и повторите действие.';
  if (error?.message === 'INVALID_FILE') return zh ? '文件类型或大小不符合要求。' : 'Формат или размер файла не подходит. Проверьте ограничения поля загрузки.';
  if (error?.message?.includes('INVALID_TRANSITION')) return zh ? '当前状态或角色不允许此操作。' : 'Это действие недоступно для текущего статуса или вашей компании.';
  if (error?.message?.includes('SCAN_FORMAT')) return zh ? '扫描件格式：PDF、JPG 或 PNG。' : 'Подписанный скан должен быть в формате PDF, JPG или PNG.';
  if (error?.message?.includes('INVITE_INVALID')) return zh ? '邀请无效、已过期，或与登录邮箱不符。' : 'Приглашение недействительно, истекло или вы вошли с другим email.';
  if (error?.code === '42501') return zh ? '您没有执行此操作的权限。请刷新页面。' : 'Недостаточно прав. Обновите страницу — доступ мог измениться.';
  if (error?.code === '23505') return zh ? '此记录已存在。请刷新页面。' : 'Запись уже существует. Обновите страницу.';
  if (error?.message === 'CONFLICT') return zh ? '记录已被其他员工修改。请重新打开。' : 'Объявление изменено другим сотрудником. Откройте его заново.';
  return zh ? '操作失败。请检查网络后重试。' : 'Не удалось выполнить действие. Проверьте соединение и попробуйте снова.';
}

export const canEdit = role => role === 'owner' || role === 'manager';
export const listingName = (listing, zh) => (zh && listing.title_zh) || listing.title;
export function listingPrice(listing, zh) {
  if (listing.price === null || listing.price === '') return zh ? '价格面议' : 'По запросу';
  const unit = { tonne: zh ? '吨' : 'т', container: zh ? '集装箱' : 'контейнер', trip: zh ? '车次' : 'рейс' }[listing.unit];
  return `${new Intl.NumberFormat(zh ? 'zh-CN' : 'ru-RU', { maximumFractionDigits: 2 }).format(Number(listing.price))} ${listing.currency} / ${unit}`;
}

export async function saveListing(companyId, values, original) {
  const fields = ['kind', 'title', 'title_zh', 'description', 'description_zh', 'origin', 'destination', 'currency', 'unit', 'basis', 'transport', 'status'];
  const payload = Object.fromEntries(fields.map(k => [k, String(values[k] ?? '').trim()]));
  payload.price = values.price === '' ? null : Number(values.price);
  payload.valid_until = values.valid_until || null;
  if (payload.kind === 'logistics') payload.basis = 'route';
  else if (payload.basis === 'route') payload.basis = 'FCA';
  if (original) {
    const row = await result(supabase.from('sv_listings').update(payload).eq('id', original.id).eq('company_id', companyId).eq('version', original.version).select().maybeSingle());
    if (!row) throw new Error('CONFLICT');
    return row;
  }
  return result(supabase.from('sv_listings').insert({ ...payload, company_id: companyId }).select().single());
}
