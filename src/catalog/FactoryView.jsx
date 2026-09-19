import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { localized as l, dap, money } from './model';
import Asset from './Asset';
import RequestModal from './Inquiry';
import { locales } from '../locales';

export default function FactoryView({ content: f, lang = 'ru', preview = false, adminId }) {
  const zh = lang === 'zh';
  const [route, setRoute] = useState(0);
  const [order, setOrder] = useState(null);
  const [quantity, setQuantity] = useState('20');
  const [product, setProduct] = useState(0);
  const routes = f.routes || [], products = f.products || [], assets = f.assets || [];
  const selectedRoute = routes[route];
  const selectedProduct = products[product];
  const unitPrice = dap(selectedProduct, selectedRoute);
  return <div className="sv">
    {!preview && <Link className="sv-back" to="/prices">← {zh ? '所有工厂' : 'Все заводы'}</Link>}
    <div className="sv-heading"><div><span className="sv-eyebrow">{l(f.city, lang)} · {zh ? '哈萨克斯坦' : 'Казахстан'}</span><h1>{l(f.name, lang)}</h1><p>{l(f.address, lang)}</p></div>{adminId && !preview && <Link className="sv-button secondary" to={`/admin/factories/${adminId}`}>{zh ? '编辑工厂' : 'Редактировать завод'}</Link>}</div>
    <div className="sv-detail-grid"><div>
      <section className="sv-card"><h2>{zh ? '关于工厂' : 'О заводе'}</h2><p className="sv-prose">{l(f.description, lang) || (zh ? '详情请咨询经理。' : 'Подробности уточняйте у менеджера.')}</p>
        <div className="sv-gallery">{assets.filter(a => a.type !== 'document').map(a => <figure key={a.id}><Asset asset={a} lang={lang} /><figcaption>{l(a.title, lang)}</figcaption></figure>)}</div>
      </section>
      <section className="sv-card"><h2>{zh ? '产品与价格' : 'Продукция и цены'}</h2><p className="sv-muted">USD / {zh ? '吨' : 'тонна'}</p>
        {routes.length > 0 && <label>{zh ? 'DAP 目的地' : 'Пункт назначения DAP'}<select value={route} onChange={e => setRoute(Number(e.target.value))}>{routes.map((r, i) => <option key={r.id} value={i}>{l(r.destination, lang)}</option>)}</select></label>}
        {products.length === 0 && <p>{zh ? '价格请咨询' : 'Цены по запросу'}</p>}
        {products.map(p => <article className="sv-product" key={p.id}><h3>{l(p.name, lang)}</h3><p className="sv-prose">{l(p.specification, lang)}</p><div className="sv-price-pair"><div><small>FCA · USD/{zh ? '吨' : 'т'}</small><strong>{money(p.fca)}</strong></div><div><small>DAP · USD/{zh ? '吨' : 'т'}</small><strong>{money(dap(p, selectedRoute))}</strong></div></div>
          <p className="sv-muted">{p.needsReview ? (zh ? '历史价格，需确认' : 'Архивная цена — требует подтверждения') : p.updatedAt ? `${zh ? '价格更新' : 'Цена обновлена'}: ${new Date(p.updatedAt).toLocaleDateString(zh ? 'zh-CN' : 'ru-RU')}` : (zh ? '价格请咨询' : 'Цена по запросу')}</p>
          {!preview && <button onClick={() => setOrder(p)}>{zh ? '询价' : 'Оставить заявку'}</button>}
        </article>)}
      </section>
      {assets.some(a => a.type === 'document') && <section className="sv-card"><h2>{zh ? '证书与检测报告' : 'Сертификаты и протоколы'}</h2><div className="sv-documents">{assets.filter(a => a.type === 'document').map(a => <Asset key={a.id} asset={a} lang={lang} />)}</div></section>}
    </div><aside>
      <section className="sv-card sv-sticky"><span className="sv-eyebrow">{zh ? '采购与运输' : 'Покупка и доставка'}</span><h2>{zh ? '供货条件' : 'Условия поставки'}</h2><dl><dt>{zh ? '最小批量' : 'Минимальная партия'}</dt><dd>{f.minOrder !== '' && f.minOrder != null ? `${f.minOrder} ${zh ? '吨' : 'т'}` : '—'}</dd><dt>{zh ? '付款方式' : 'Оплата'}</dt><dd>{l(f.payment, lang) || '—'}</dd></dl>
        <h3>{zh ? '订单估算' : 'Расчёт партии'}</h3>
        <label>{zh ? '产品' : 'Продукция'}<select value={product} onChange={e => setProduct(Number(e.target.value))}>{products.map((p, i) => <option key={p.id} value={i}>{l(p.name, lang)}</option>)}</select></label>
        <label>{zh ? '数量（吨）' : 'Объём, тонн'}<input type="number" min="0.01" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} /></label>
        <div className="sv-total"><small>{zh ? 'DAP 总额估算' : 'Предварительная сумма DAP'}</small><strong>{unitPrice !== null && Number(quantity) > 0 ? `$${money(unitPrice * Number(quantity))}` : (zh ? '请咨询' : 'По запросу')}</strong></div>
        <p className="sv-muted">{zh ? 'FCA + 所选目的地的运费。最终价格和路线由经理确认。' : 'FCA + тариф до выбранного пункта. Итоговую стоимость и маршрут подтверждает менеджер.'}</p>
        {Number(quantity) > 0 && Number(f.minOrder) > Number(quantity) && <p className="sv-notice">{zh ? '低于最小起订量' : 'Объём меньше минимальной партии'}</p>}
        {!preview && <button onClick={() => setOrder(selectedProduct || {})}>{zh ? '咨询经理' : 'Запросить предложение'}</button>}
      </section>
    </aside></div>
    {order && !preview && <RequestModal factoryName={l(f.name, lang)} t={locales[lang]} initialValues={{ city: l(f.city, lang), cargo: l(order.name, lang), station: l(selectedRoute?.destination, lang), amount: quantity }} onClose={() => setOrder(null)} />}
  </div>;
}
