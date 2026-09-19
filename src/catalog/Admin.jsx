import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { listCatalog, saveFactory, uploadAsset } from './api';
import { emptyFactory, newProduct, pair, localized as l, validateFactory, stampPrices, money, dap } from './model';
import useAdmin from './useAdmin';
import Asset from './Asset';
import FactoryView from './FactoryView';

function Gate({ children }) {
  const { loading, admin, error } = useAdmin();
  if (loading) return <div className="sv" role="status">Проверяем доступ…</div>;
  if (!admin) return <div className="sv sv-card"><h1>Панель администратора</h1><p>{error ? 'Не удалось проверить доступ. Обновите страницу.' : 'Войдите через кнопку «Войти» вверху сайта под учётной записью администратора.'}</p></div>;
  return children;
}
export function AdminList() { return <Gate><FactoryList /></Gate>; }
function FactoryList() {
  const navigate = useNavigate();
  const [rows,setRows] = useState([]), [search,setSearch] = useState(''), [filter,setFilter] = useState('all'), [error,setError] = useState(''), [loading,setLoading] = useState(true), [busy,setBusy] = useState(false);
  const load = useCallback(() => { setLoading(true); listCatalog(true).then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false)); },[]);
  useEffect(() => { load(); },[load]);
  async function change(row, action) {
    if (action === 'trash' && !window.confirm(`Переместить «${l(row.content.name)}» в корзину? Завод исчезнет с сайта, но его можно будет восстановить.`)) return;
    setBusy(true); setError('');
    try { await saveFactory(row.id,row.slug,row.content,row.version,action); load(); } catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  const active = rows.filter(r => !r.deleted_at);
  const visible = rows.filter(r => filter === 'trash' ? r.deleted_at : !r.deleted_at && (filter === 'all' || (filter === 'published' ? r.published : !r.published))).filter(r => l(r.content.name).toLowerCase().includes(search.toLowerCase()));
  return <div className="sv"><div className="sv-heading"><div><span className="sv-eyebrow">SKYVISION · УПРАВЛЕНИЕ</span><h1>Каталог заводов</h1><p>Цены, материалы и публикация — в одном месте.</p></div><button onClick={() => navigate('/admin/factories/new')}>+ Добавить завод</button></div>
    <div className="sv-stats"><div><strong>{active.length}</strong>Заводов</div><div><strong>{active.filter(r => r.published).length}</strong>Опубликовано</div><div><strong>{active.filter(r => r.content.products.some(p => p.needsReview || p.fca === '' || p.fca == null)).length}</strong>Нужно проверить цены</div></div>
    <section className="sv-card"><div className="sv-toolbar"><div className="sv-tabs">{[['all','Все'],['published','На сайте'],['draft','Скрытые'],['trash','Корзина']].map(([key,title]) => <button aria-pressed={filter===key} className={filter===key?'active':''} key={key} onClick={() => setFilter(key)}>{title}</button>)}</div><input aria-label="Поиск завода" placeholder="Найти завод…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
      {error && <p className="sv-error" role="alert">{error}</p>}{loading ? <p>Загрузка…</p> : <div className="sv-table-wrap"><table className="sv-table"><thead><tr><th>Завод</th><th>Состояние</th><th>Продукция</th><th>Материалы</th><th>Действия</th></tr></thead><tbody>{visible.map(row => <tr key={row.id}><td><Link to={`/admin/factories/${row.id}`}>{l(row.content.name) || 'Без названия'}</Link><small>{l(row.content.city)}</small></td><td><span className="sv-badge">{row.deleted_at?'В корзине':row.published?'На сайте':'Черновик'}</span>{row.published && row.published_version !== row.version && <small>Есть неопубликованные изменения</small>}</td><td>{row.content.products.length}</td><td>{row.content.assets.length}</td><td><div className="sv-actions"><Link to={`/admin/factories/${row.id}`}>Редактировать</Link><button className="secondary" disabled={busy} onClick={() => change(row,row.deleted_at?'restore':'trash')}>{row.deleted_at?'Восстановить':'В корзину'}</button></div></td></tr>)}</tbody></table>{!visible.length && <p>Здесь пока нет заводов.</p>}</div>}
    </section></div>;
}
export function AdminEditor() { return <Gate><Editor /></Gate>; }
function Bilingual({ label, value, onChange, multiline = false }) {
  const Tag = multiline ? 'textarea' : 'input';
  return <fieldset className="sv-bilingual"><legend>{label}</legend>{['ru','zh'].map(lang => <label key={lang}>{lang==='ru'?'Русский':'中文'}<Tag rows={multiline?4:undefined} lang={lang} value={value?.[lang] || ''} onChange={e => onChange({...value,[lang]:e.target.value})} /></label>)}</fieldset>;
}
function Editor() {
  const { id } = useParams(); const navigate = useNavigate();
  const [row,setRow] = useState(null), [doc,setDoc] = useState(emptyFactory), [slug,setSlug] = useState(''), [tab,setTab] = useState('info'), [lang,setLang] = useState('ru');
  const [loading,setLoading] = useState(true), [busy,setBusy] = useState(false), [notice,setNotice] = useState(''), [error,setError] = useState(''), [uploadProgress,setUploadProgress] = useState('');
  const dirty = row ? JSON.stringify(doc)!==JSON.stringify(row.content)||slug!==row.slug : Boolean(doc.name.ru || doc.assets.length);
  useEffect(() => { let active=true; setLoading(true); setError(''); if(id==='new'){setRow({id:crypto.randomUUID(),version:0,content:emptyFactory(),slug:'',published:false});setDoc(emptyFactory());setSlug('');setLoading(false);return;}
    listCatalog(true).then(rows=>{if(!active)return;const found=rows.find(r=>r.id===id);if(!found)throw new Error('Завод не найден');setRow(found);setDoc(found.content);setSlug(found.slug);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);}); return()=>{active=false;};
  },[id]);
  useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
  // BrowserRouter does not support useBlocker: capture internal links to protect unsaved edits.
  useEffect(()=>{const warn=e=>{const link=e.target.closest?.('a[href]');if(dirty&&link&&!link.target&&link.origin===window.location.origin&&!window.confirm('Есть несохранённые изменения. Покинуть редактор?')){e.preventDefault();e.stopPropagation();}};document.addEventListener('click',warn,true);return()=>document.removeEventListener('click',warn,true);},[dirty]);
  const update=(field,value)=>setDoc(prev=>({...prev,[field]:value}));
  const updateItem=(field,index,value)=>setDoc(prev=>({...prev,[field]:prev[field].map((item,i)=>i===index?{...item,...value}:item)}));
  const remove=(field,index)=>setDoc(prev=>({...prev,[field]:prev[field].filter((_,i)=>i!==index)}));
  async function save(action) {
    setError('');setNotice('');const validation=validateFactory(doc,action==='publish');if(validation){setError(validation);return;}
    const finalSlug=slug.trim()||`factory-${row.id.slice(0,8)}`;
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)){setError('Адрес страницы: латинские буквы в нижнем регистре, цифры и дефис.');return;}
    setBusy(true);try{const content=stampPrices(doc,row.content);const saved=await saveFactory(row.id,finalSlug,content,row.version,action);setRow(saved);setDoc(saved.content);setSlug(saved.slug);setNotice(action==='publish'?'Опубликовано. Изменения видны посетителям.':action==='unpublish'?'Завод скрыт с сайта.':'Черновик сохранён. На сайте прежняя версия.');if(id==='new')navigate(`/admin/factories/${saved.id}`,{replace:true});}catch(e){setError(e.message);}finally{setBusy(false);}
  }
  async function upload(files) {
    if(busy || !files.length)return;setBusy(true);setError('');const failures=[];
    try{for(let i=0;i<files.length;i++){setUploadProgress(`Загрузка ${i+1} из ${files.length}: ${files[i].name}`);try{const asset=await uploadAsset(files[i],row.id);setDoc(prev=>({...prev,assets:[...prev.assets,asset]}));}catch(e){failures.push(e.message);}}setError(failures.join('\n'));setNotice('Файлы обработаны. Сохраните черновик или опубликуйте изменения.');}finally{setBusy(false);setUploadProgress('');}
  }
  function moveAsset(index,delta){setDoc(prev=>{const assets=[...prev.assets];[assets[index],assets[index+delta]]=[assets[index+delta],assets[index]];return {...prev,assets};});}
  if(loading)return <div className="sv">Загрузка редактора…</div>;
  if(!row)return <div className="sv sv-card" role="alert">{error}<Link to="/admin/factories">К списку</Link></div>;
  return <div className="sv"><Link className="sv-back" to="/admin/factories">← Все заводы</Link><div className="sv-heading"><div><span className="sv-eyebrow">{row.published?'НА САЙТЕ':'ЧЕРНОВИК'}{dirty?' · ЕСТЬ ИЗМЕНЕНИЯ':''}</span><h1>{doc.name.ru||'Новый завод'}</h1><p>Сначала заполните карточку, затем проверьте и опубликуйте.</p></div><button className="secondary" onClick={()=>setTab('preview')}>Предпросмотр →</button></div>
    {row.deleted_at && <p className="sv-notice">Этот завод в корзине. Сначала восстановите его в списке заводов.</p>}
    <div className="sv-editor"><nav className="sv-editor-nav" aria-label="Разделы редактора">{[['info','01','Информация'],['products','02','Продукция и цены'],['routes','03','Доставка'],['media','04','Фото и видео'],['documents','05','Документы'],['preview','06','Предпросмотр']].map(([key,num,title])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><span>{num}</span>{title}</button>)}<p>Русский и китайский тексты редактируются рядом. Пустой перевод временно заменяется русским текстом.</p></nav>
    <div className="sv-editor-body"><div aria-live="polite">{error&&<p className="sv-error" role="alert">{error}</p>}{notice&&<p className="sv-success">{notice}</p>}{uploadProgress&&<p role="status">{uploadProgress}</p>}</div>
      <fieldset className="sv-editor-fields" disabled={busy || Boolean(row.deleted_at)}>
      {tab==='info'&&<section className="sv-card"><h2>Информация о заводе</h2>{doc.provenance && <details><summary>Сведения из старой версии сайта</summary><p className="sv-muted">{doc.provenance}</p></details>}<Bilingual label="Название" value={doc.name} onChange={v=>update('name',v)}/><Bilingual label="Город" value={doc.city} onChange={v=>update('city',v)}/><Bilingual label="Адрес" value={doc.address} onChange={v=>update('address',v)}/><Bilingual label="Описание" multiline value={doc.description} onChange={v=>update('description',v)}/><Bilingual label="Условия оплаты" value={doc.payment} onChange={v=>update('payment',v)}/><label>Минимальная партия, тонн<input type="number" min="0" step="0.01" value={doc.minOrder??''} onChange={e=>update('minOrder',e.target.value)}/></label><details><summary>Адрес страницы</summary><label>Часть ссылки после /factory/<input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="Создаётся автоматически"/></label><p className="sv-muted">После публикации лучше не менять адрес: старые ссылки перестанут работать.</p></details></section>}
      {tab==='products'&&<section className="sv-card"><h2>Продукция и цены</h2><p>Все цены — USD за тонну. Пустое поле означает «По запросу».</p>{doc.products.map((p,i)=><article className="sv-product" key={p.id}><div className="sv-toolbar"><h3>Позиция {i+1}</h3><button className="secondary" onClick={()=>remove('products',i)}>Убрать позицию</button></div><Bilingual label="Продукция" value={p.name} onChange={name=>updateItem('products',i,{name})}/><Bilingual label="Характеристики / упаковка" multiline value={p.specification} onChange={specification=>updateItem('products',i,{specification})}/><label>FCA, USD/т<input type="number" min="0" step="0.01" value={p.fca??''} onChange={e=>updateItem('products',i,{fca:e.target.value})}/></label>{p.needsReview&&<p className="sv-notice">Цена из старой версии сайта. Проверьте перед использованием. <button className="secondary" onClick={()=>updateItem('products',i,{needsReview:false,updatedAt:new Date().toISOString()})}>Подтвердить цену на сегодня</button></p>}{doc.routes.map(r=><p key={r.id} className="sv-muted">DAP {l(r.destination)}: {money(dap(p,r))} USD/т</p>)}</article>)}<button onClick={()=>update('products',[...doc.products,newProduct()])}>+ Добавить продукцию</button></section>}
      {tab==='routes'&&<section className="sv-card"><h2>Маршруты доставки</h2><p>DAP = FCA + тариф до указанного пункта. Добавляйте только согласованные тарифы.</p>{doc.routes.map((r,i)=><article className="sv-product" key={r.id}><Bilingual label="Пункт назначения" value={r.destination} onChange={destination=>updateItem('routes',i,{destination})}/><label>Тариф доставки, USD/т<input type="number" min="0" step="0.01" value={r.rate??''} onChange={e=>updateItem('routes',i,{rate:e.target.value,updatedAt:new Date().toISOString()})}/></label><button className="secondary" onClick={()=>remove('routes',i)}>Убрать маршрут</button></article>)}<button onClick={()=>update('routes',[...doc.routes,{id:crypto.randomUUID(),destination:pair(),rate:''}])}>+ Добавить маршрут</button></section>}
      {(tab==='media'||tab==='documents')&&<section className="sv-card"><h2>{tab==='media'?'Фото и видео':'Документы'}</h2><div className="sv-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(Array.from(e.dataTransfer.files));}}><strong>Перетащите файлы сюда</strong><p>Или выберите несколько файлов. Фото оптимизируются автоматически.</p><input aria-label="Загрузить файлы" type="file" multiple accept={tab==='documents'?'.pdf':'.jpg,.jpeg,.png,.webp,.mp4,.webm'} onChange={e=>{upload(Array.from(e.target.files));e.target.value='';}}/><small>JPG, PNG, WebP, MP4, WebM, PDF · до 50 МБ на файл</small></div><p className="sv-muted">Первое фото станет обложкой. Удаление из карточки применяется после сохранения.</p><div className="sv-asset-grid">{doc.assets.map((a,i)=>({a,i})).filter(({a})=>tab==='documents'?a.type==='document':a.type!=='document').map(({a,i})=><article className="sv-asset" key={a.id}><Asset asset={a}/><Bilingual label="Подпись" value={a.title} onChange={title=>updateItem('assets',i,{title})}/><div className="sv-actions"><button className="secondary" disabled={i===0} onClick={()=>moveAsset(i,-1)} aria-label="Передвинуть раньше">↑</button><button className="secondary" disabled={i===doc.assets.length-1} onClick={()=>moveAsset(i,1)} aria-label="Передвинуть позже">↓</button>{a.type==='image'&&<button className="secondary" onClick={()=>update('assets',[a,...doc.assets.filter(x=>x.id!==a.id)])}>Обложка</button>}<button className="secondary" onClick={()=>remove('assets',i)}>Убрать</button></div></article>)}</div></section>}
      </fieldset>
      {tab==='preview'&&<div><div className="sv-toolbar"><h2>Предпросмотр черновика</h2><select aria-label="Язык предпросмотра" value={lang} onChange={e=>setLang(e.target.value)}><option value="ru">Русский</option><option value="zh">中文</option></select></div><FactoryView content={doc} lang={lang} preview/></div>}
    </div></div><div className="sv-savebar"><span>{dirty?'Есть несохранённые изменения':'Все изменения сохранены'}</span><div className="sv-actions"><button className="secondary" disabled={busy||Boolean(row.deleted_at)} onClick={()=>save('draft')}>Сохранить черновик</button>{row.published&&<button className="secondary" disabled={busy||Boolean(row.deleted_at)} onClick={()=>save('unpublish')}>Скрыть с сайта</button>}<button disabled={busy||Boolean(row.deleted_at)} onClick={()=>save('publish')}>{busy?'Подождите…':'Опубликовать'}</button></div></div>
  </div>;
}
