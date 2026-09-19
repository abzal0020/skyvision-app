export const pair = (ru = '', zh = '') => ({ ru, zh });
export const localized = (value, lang = 'ru') => typeof value === 'string' ? value : value?.[lang] || value?.ru || '';
export const numberOrNull = value => value === '' || value === null || value === undefined ? null : Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
export function dap(product, route) {
  const fca = numberOrNull(product?.fca);
  const freight = numberOrNull(route?.rate);
  return fca !== null && freight !== null && localized(route?.destination) ? Math.round((fca + freight) * 100) / 100 : null;
}
export const money = value => numberOrNull(value) === null ? '—' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value));
export const emptyFactory = () => ({ name: pair(), city: pair(), address: pair(), description: pair(), payment: pair(), minOrder: '', products: [], routes: [], assets: [], provenance: '' });
export const newProduct = () => ({ id: crypto.randomUUID(), name: pair('Кормовая мука', '饲料面粉'), specification: pair(), fca: '', updatedAt: null, needsReview: false });
export function validateFactory(doc, publish = false) {
  if (!doc.name?.ru?.trim()) return 'Укажите название завода на русском.';
  if (!Array.isArray(doc.products) || !Array.isArray(doc.routes) || !Array.isArray(doc.assets)) return 'Некорректная структура карточки.';
  if (publish && !doc.city?.ru?.trim()) return 'Перед публикацией укажите город.';
  for (const p of doc.products) {
    if (!p.name?.ru?.trim()) return 'Укажите название каждой продукции.';
    if (p.fca !== '' && p.fca !== null && numberOrNull(p.fca) === null) return 'Цена должна быть неотрицательным числом.';
  }
  for (const r of doc.routes) {
    if (!r.destination?.ru?.trim()) return 'Укажите пункт назначения каждого маршрута.';
    if (r.rate !== '' && r.rate !== null && numberOrNull(r.rate) === null) return 'Тариф доставки должен быть неотрицательным числом.';
  }
  if (doc.minOrder !== '' && numberOrNull(doc.minOrder) === null) return 'Минимальная партия должна быть неотрицательным числом.';
  return '';
}
export function stampPrices(doc, previous) {
  const now = new Date().toISOString();
  return { ...doc, products: doc.products.map(p => {
    const old = previous?.products?.find(x => x.id === p.id);
    return numberOrNull(p.fca) !== numberOrNull(old?.fca) ? { ...p, updatedAt: now, needsReview: false } : p;
  }) };
}
export function safeUrl(url) {
  if (typeof url !== 'string') return '';
  if (/^\/(?!\/)/.test(url) || /^https:\/\//i.test(url) || /^blob:/.test(url)) return url;
  return '';
}
