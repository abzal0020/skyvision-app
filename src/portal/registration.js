export const businessTypes = (zh) => [
  ['factory', zh ? '生产企业' : 'Производство'],
  ['forwarder', zh ? '货运代理' : 'Экспедитор'],
  ['buyer', zh ? '采购商' : 'Покупатель'],
  ['other', zh ? '其他' : 'Другое'],
];
export const countries = (zh) => [
  ['KZ', zh ? '哈萨克斯坦' : 'Казахстан'], ['CN', zh ? '中国' : 'Китай'],
  ['UZ', zh ? '乌兹别克斯坦' : 'Узбекистан'], ['KG', zh ? '吉尔吉斯斯坦' : 'Кыргызстан'],
  ['RU', zh ? '俄罗斯' : 'Россия'], ['OTHER', zh ? '其他' : 'Другая'],
];
export function registrationData(fields) {
  const get = key => String(fields.get(key) || '').trim();
  return {version:1, business_type:get('business_type'), company_name:get('company_name'),
    country:get('country'), city:get('city'), full_name:get('full_name'),
    phone:get('phone'), position:get('position')};
}
// Registration metadata is form input, never a source of access rights.
export function registrationDefaults(user) {
  const r = user?.user_metadata?.registration || {};
  const str = (value, limit) => typeof value === 'string' ? value.slice(0, limit) : '';
  return {
    name:str(r.company_name,160), name_zh:'', city:str(r.city,120),
    country:countries(false).some(([v]) => v === r.country) ? r.country : 'KZ',
    activities:businessTypes(false).some(([v]) => v === r.business_type) ? [r.business_type] : ['factory'],
    full_name:str(r.full_name,160), headline:str(r.position,160),
  };
}
