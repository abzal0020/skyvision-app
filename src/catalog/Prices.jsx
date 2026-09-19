import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCatalog } from './api';
import { localized as l, dap, money, numberOrNull } from './model';
import RequestModal from './Inquiry';
import { locales } from '../locales';

export default function Prices({ lang = 'ru' }) {
  const zh = lang === 'zh';
  const [rows, setRows] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const [search, setSearch] = useState(''), [city, setCity] = useState(''), [destination, setDestination] = useState(''), [sort, setSort] = useState('name'), [order, setOrder] = useState(null);
  const load = () => { setLoading(true); setError(''); listCatalog().then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const cities = [...new Set(rows.map(r => r.content.city?.ru).filter(Boolean))];
  const destinations = [...new Set(rows.flatMap(r => r.content.routes.map(x => x.destination?.ru)).filter(Boolean))];
  const filtered = useMemo(() => rows.flatMap(row => (row.content.products.length ? row.content.products : [{ id: 'empty' }]).map(p => ({ row, p, route: row.content.routes.find(r => r.destination?.ru === destination) }))).filter(({ row, p }) => (!city || row.content.city?.ru === city) && `${l(row.content.name, lang)} ${l(row.content.city, lang)} ${l(p.name, lang)}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => {
    if (sort === 'name') return l(a.row.content.name, lang).localeCompare(l(b.row.content.name, lang));
    const x = sort === 'fca' ? numberOrNull(a.p.fca) : dap(a.p,a.route), y = sort === 'fca' ? numberOrNull(b.p.fca) : dap(b.p,b.route);
    return (x ?? Infinity) - (y ?? Infinity);
  }), [rows, city, search, sort, destination, lang]);
  return <div className="sv"><div className="sv-heading"><div><span className="sv-eyebrow">{zh ? '哈萨克斯坦 → 中国' : 'Казахстан → Китай'}</span><h1>{zh ? '工厂与产品价格' : 'Заводы и цены на продукцию'}</h1><p>{zh ? '比较报价，查看工厂资料并提交采购需求。' : 'Сравните предложения, изучите документы и отправьте заявку.'}</p></div><span className="sv-badge">USD / {zh ? '吨' : 'тонна'}</span></div>
    <section className="sv-card"><div className="sv-filters"><label>{zh ? '搜索' : 'Поиск'}<input type="search" placeholder={zh ? '工厂或产品' : 'Завод или продукция'} value={search} onChange={e => setSearch(e.target.value)} /></label><label>{zh ? '城市' : 'Город'}<select value={city} onChange={e => setCity(e.target.value)}><option value="">{zh ? '所有城市' : 'Все города'}</option>{cities.map(c => <option key={c} value={c}>{l(rows.find(r => r.content.city.ru === c)?.content.city, lang)}</option>)}</select></label><label>{zh ? 'DAP 目的地' : 'Пункт назначения DAP'}<select value={destination} onChange={e => setDestination(e.target.value)}><option value="">{zh ? '选择目的地' : 'Выберите пункт'}</option>{destinations.map(d => <option value={d} key={d}>{l(rows.flatMap(r => r.content.routes).find(r => r.destination.ru === d)?.destination, lang)}</option>)}</select></label><label>{zh ? '排序' : 'Сортировка'}<select value={sort} onChange={e => setSort(e.target.value)}><option value="name">{zh ? '工厂名称' : 'Название завода'}</option><option value="fca">FCA ↑</option><option value="dap">DAP ↑</option></select></label></div>
    {loading ? <p role="status">{zh ? '加载中…' : 'Загрузка…'}</p> : error ? <div role="alert"><p>{zh ? '无法加载目录。' : 'Не удалось загрузить каталог.'}</p><button onClick={load}>{zh ? '重试' : 'Повторить'}</button></div> : <><p className="sv-muted">{zh ? '报价数量' : 'Предложений'}: {filtered.length}</p><div className="sv-table-wrap"><table className="sv-table"><thead><tr>{[zh ? '工厂 / 城市' : 'Завод / город',zh ? '产品' : 'Продукция','FCA, $/т',zh ? '运费, $/吨' : 'Доставка, $/т','DAP, $/т',zh ? '价格日期' : 'Дата цены',''].map((s,i) => <th key={i}>{zh ? s.replace('/т','/吨') : s}</th>)}</tr></thead><tbody>{filtered.map(({row,p,route}) => <tr key={`${row.id}-${p.id}`}><td><Link to={`/factory/${row.slug}`}>{l(row.content.name,lang)} →</Link><small>{l(row.content.city,lang)}</small></td><td>{l(p.name,lang) || '—'}</td><td>{money(p.fca)}</td><td>{money(route?.rate)}</td><td className="sv-emphasis">{money(dap(p,route))}</td><td><small>{p.needsReview ? (zh ? '待确认' : 'Требует уточнения') : p.updatedAt ? new Date(p.updatedAt).toLocaleDateString(zh ? 'zh-CN' : 'ru-RU') : '—'}</small></td><td><button onClick={() => setOrder({row,p,route})}>{zh ? '询价' : 'Заявка'}</button></td></tr>)}</tbody></table></div>{!filtered.length && <p>{zh ? '没有符合条件的报价。请更改筛选条件。' : 'Предложений не найдено. Измените условия поиска.'}</p>}</>}
    <p className="sv-muted">{zh ? '“—”表示需询价。DAP 根据工厂 FCA 价格及所选目的地运费计算。历史价格需重新确认。' : '«—» означает цену по запросу. DAP рассчитывается из FCA и тарифа до выбранного пункта. Архивные цены требуют подтверждения.'}</p></section>
    {order && <RequestModal factoryName={l(order.row.content.name,lang)} initialValues={{ city:l(order.row.content.city,lang), cargo:l(order.p.name,lang), station:l(order.route?.destination,lang) }} t={locales[lang]} onClose={() => setOrder(null)} />}
  </div>;
}
