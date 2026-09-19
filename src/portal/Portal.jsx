import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCompany } from './CompanyContext';
import { canEdit, errorText, listingName, listingPrice, result, saveListing } from './api';
import './portal.css';

export function useLoad(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    loader().then(data => { if (active) setState({ data, loading: false, error: null }); }).catch(error => { if (active) setState({ data: null, loading: false, error }); });
    return () => { active = false; };
  }, [...deps, revision]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, reload: () => setRevision(n => n + 1) };
}
export function Feedback({ error, zh }) { return error ? <p className="sv-error" role="alert">{errorText(error, zh)}</p> : null; }
export function Loading({ zh }) { return <p role="status">{zh ? '加载中…' : 'Загрузка…'}</p>; }
export function Empty({ title, text, children }) { return <div className="sp-empty"><h2>{title}</h2><p>{text}</p>{children}</div>; }
const statusLabel = (s, zh) => ({ draft: zh ? '草稿' : 'Черновик', published: zh ? '已发布' : 'Опубликовано', archived: zh ? '归档' : 'В архиве', new: zh ? '新申请' : 'Новая', discussing: zh ? '洽谈中' : 'Обсуждение', closed: zh ? '已关闭' : 'Закрыта' }[s]);
const roleLabel = (s, zh) => ({ owner: zh ? '所有者' : 'Владелец', manager: zh ? '经理' : 'Менеджер', viewer: zh ? '只读' : 'Просмотр' }[s]);

function Account({ zh }) {
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    const fields = new FormData(e.currentTarget);
    const email = String(fields.get('email')).trim();
    const password = String(fields.get('password'));
    try {
      const response = mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/portal` } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (response.error) throw response.error;
      if (mode === 'signup' && !response.data.session) setNotice(zh ? '请查看邮箱并确认注册，然后登录。' : 'Проверьте почту и подтвердите регистрацию, затем войдите в кабинет.');
    } catch (err) {
      setError(mode === 'login' ? (zh ? '无法登录。请检查邮箱、密码及邮箱确认状态。' : 'Не удалось войти. Проверьте email, пароль и подтверждение почты.') : (zh ? '无法注册。请检查邮箱和密码，或稍后重试。' : 'Не удалось зарегистрироваться. Проверьте email и пароль или повторите позже.'));
    } finally { setBusy(false); }
  }
  return <div className="sv sp"><section className="sv-card sp-auth"><span className="sv-eyebrow">SKYVISION PORTAL</span><h1>{zh ? '企业工作空间' : 'Кабинет компании'}</h1><p className="sv-muted">{zh ? '管理产品、物流报价、申请和商务沟通。' : 'Объявления, заявки и переписка с партнёрами в одном месте.'}</p><div className="sv-tabs">{['login', 'signup'].map(v => <button key={v} className={mode === v ? 'active' : ''} onClick={() => { setMode(v); setError(''); setNotice(''); }}>{v === 'login' ? (zh ? '登录' : 'Вход') : (zh ? '注册' : 'Регистрация')}</button>)}</div><form onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>{zh ? '密码' : 'Пароль'}<input name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 10 : 1} required />{mode === 'signup' && <small>{zh ? '至少10个字符' : 'Не менее 10 символов'}</small>}</label><button disabled={busy}>{busy ? (zh ? '请稍候…' : 'Подождите…') : mode === 'login' ? (zh ? '登录' : 'Войти') : (zh ? '创建账户' : 'Создать аккаунт')}</button>{error && <p className="sv-error" role="alert">{error}</p>}{notice && <p className="sv-success" role="status">{notice}</p>}</form><p><Link to="/marketplace">{zh ? '浏览市场' : 'Посмотреть объявления'} →</Link></p></section></div>;
}

function CompanyForm({ zh, existing, onDone }) {
  const ctx = useCompany();
  const [values, setValues] = useState(existing || { name: '', name_zh: '', city: '', country: 'KZ', activities: ['factory'] });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  const set = (key, value) => setValues(v => ({ ...v, [key]: value }));
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      const payload = Object.fromEntries(['name', 'name_zh', 'city', 'country', 'activities'].map(k => [k, values[k]]));
      const row = await result(existing ? supabase.from('sv_companies').update(payload).eq('id', existing.id).select().single() : supabase.from('sv_companies').insert(payload).select().single());
      await ctx.reload(); ctx.select(row.id); onDone?.();
    } catch (err) { setError(err); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="sv-card"><h2>{existing ? (zh ? '企业资料' : 'Данные компании') : (zh ? '添加企业' : 'Добавить компанию')}</h2><p className="sv-muted">{zh ? '这些信息将与您发布的广告一起展示。添加资料不代表平台认证。' : 'Эти данные будут видны вместе с опубликованными объявлениями. Создание профиля не означает проверку компании площадкой.'}</p><div className="sp-fields"><label>{zh ? '公司名称（俄文或原文）' : 'Название компании'}<input required minLength={2} maxLength={160} value={values.name} onChange={e => set('name', e.target.value)} /></label><label>{zh ? '中文名称（可选）' : 'Название на китайском — необязательно'}<input maxLength={160} value={values.name_zh} onChange={e => set('name_zh', e.target.value)} /></label><label>{zh ? '国家' : 'Страна'}<select value={values.country} onChange={e => set('country', e.target.value)}>{[['KZ', zh ? '哈萨克斯坦' : 'Казахстан'], ['CN', zh ? '中国' : 'Китай'], ['UZ', zh ? '乌兹别克斯坦' : 'Узбекистан'], ['KG', zh ? '吉尔吉斯斯坦' : 'Кыргызстан'], ['RU', zh ? '俄罗斯' : 'Россия'], ['OTHER', zh ? '其他' : 'Другая']].map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label><label>{zh ? '城市' : 'Город'}<input value={values.city} maxLength={120} onChange={e => set('city', e.target.value)} /></label></div><fieldset><legend>{zh ? '业务类型' : 'Направления работы'}</legend><div className="sp-role">{[['factory', zh ? '工厂' : 'Завод'], ['forwarder', zh ? '货运代理' : 'Экспедитор'], ['buyer', zh ? '采购商' : 'Покупатель']].map(([key, label]) => <label key={key}><input type="checkbox" checked={values.activities.includes(key)} onChange={e => set('activities', e.target.checked ? [...values.activities, key] : values.activities.filter(k => k !== key))} />{label}</label>)}</div></fieldset><Feedback error={error} zh={zh} /><button disabled={busy || !values.activities.length}>{busy ? '…' : existing ? (zh ? '保存' : 'Сохранить') : (zh ? '创建企业' : 'Создать компанию')}</button></form>;
}

function Invitation({ token, zh, onDone }) {
  const ctx = useCompany(); const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  async function accept() {
    setBusy(true); setError(null);
    try { const id = await result(supabase.rpc('sv_accept_invite', { p_token: token })); await ctx.reload(); ctx.select(id); onDone(); }
    catch (e) { setError(e); } finally { setBusy(false); }
  }
  return <section className="sv-card"><h2>{zh ? '企业邀请' : 'Приглашение в компанию'}</h2><p>{zh ? '请使用收到邀请的邮箱登录。接受后，您将获得邀请中指定的权限。' : 'Вы должны войти с email, на который оформлено приглашение. После принятия вы получите назначенную владельцем роль.'}</p><button onClick={accept} disabled={busy}>{zh ? '接受邀请' : 'Принять приглашение'}</button><Feedback error={error} zh={zh} /></section>;
}

export default function Portal({ lang }) {
  const zh = lang === 'zh'; const { user, loading } = useAuth(); const ctx = useCompany();
  const [params, setParams] = useSearchParams(); const [adding, setAdding] = useState(false);
  if (loading) return <div className="sv"><Loading zh={zh} /></div>;
  if (!user) return <Account zh={zh} />;
  if (ctx.loading) return <div className="sv"><Loading zh={zh} /></div>;
  if (ctx.error) return <div className="sv"><Feedback error={ctx.error} zh={zh} /><button onClick={ctx.reload}>{zh ? '重试' : 'Повторить'}</button></div>;
  const invite = params.get('invite');
  if (!ctx.company) return <div className="sv sp"><h1>{zh ? '欢迎使用 SkyVision' : 'Добро пожаловать в SkyVision'}</h1>{invite && <Invitation token={invite} zh={zh} onDone={() => setParams({})} />}<CompanyForm zh={zh} /></div>;
  return <div className="sv sp"><div className="sp-layout"><aside className="sp-sidebar"><h2>{(zh && ctx.company.name_zh) || ctx.company.name}</h2><small>{roleLabel(ctx.role, zh)} · {ctx.company.country}</small><nav><NavLink to="/portal" end>{zh ? '概览' : 'Обзор'}</NavLink><NavLink to="/portal/listings">{zh ? '我的广告' : 'Мои объявления'}</NavLink><NavLink to="/portal/requests">{zh ? '申请与消息' : 'Заявки и сообщения'}</NavLink><NavLink to="/portal/company">{zh ? '企业与团队' : 'Компания и сотрудники'}</NavLink></nav><nav className="sp-side-bottom"><Link to="/marketplace">{zh ? '浏览市场' : 'Открыть маркетплейс'} ↗</Link><Link to="/prices">{zh ? '工厂目录' : 'Каталог заводов'} ↗</Link></nav></aside><div className="sp-main"><div className="sp-top"><div><span className="sp-kicker">SKYVISION / {zh ? '企业工作空间' : 'КАБИНЕТ КОМПАНИИ'}</span></div><select aria-label={zh ? '当前企业' : 'Текущая компания'} value={ctx.company.id} onChange={e => { ctx.select(e.target.value); setAdding(false); }}>{ctx.memberships.map(m => <option key={m.company_id} value={m.company_id}>{(zh && m.company.name_zh) || m.company.name}</option>)}</select></div>{invite && <Invitation token={invite} zh={zh} onDone={() => setParams({})} />}<div key={ctx.company.id}><Routes><Route index element={<Overview zh={zh} />} /><Route path="listings" element={<MyListings zh={zh} />} /><Route path="requests" element={<Requests zh={zh} />} /><Route path="requests/:id" element={<Thread zh={zh} />} /><Route path="company" element={<>{ctx.role === 'owner' ? <CompanyForm zh={zh} existing={ctx.company} /> : <section className="sv-card"><h2>{ctx.company.name}</h2><p>{ctx.company.country} · {ctx.company.city}</p></section>}<Team zh={zh} /><button className="secondary" onClick={() => setAdding(v => !v)}>{zh ? '添加另一家企业' : 'Добавить другую компанию'}</button>{adding && <CompanyForm zh={zh} onDone={() => setAdding(false)} />}</>} /><Route path="*" element={<Empty title={zh ? '页面不存在' : 'Раздел не найден'}><Link to="/portal">{zh ? '返回概览' : 'Вернуться в кабинет'}</Link></Empty>} /></Routes></div></div></div></div>;
}

function Overview({ zh }) {
  const { company } = useCompany();
  const state = useLoad(async () => {
    const responses = await Promise.all([
      supabase.from('sv_listings').select('id', { count: 'exact', head: true }).eq('company_id', company.id).eq('status', 'published'),
      supabase.from('sv_requests').select('id', { count: 'exact', head: true }).eq('to_company', company.id).neq('status', 'closed'),
      supabase.from('sv_requests').select('id', { count: 'exact', head: true }).eq('from_company', company.id).neq('status', 'closed')
    ]);
    const failed = responses.find(r => r.error); if (failed) throw failed.error;
    return responses.map(r => r.count);
  }, [company.id]);
  return <><h1>{zh ? '工作概览' : 'Рабочий кабинет'}</h1><p className="sv-muted">{zh ? '发布报价，与合作伙伴直接沟通。' : 'Публикуйте предложения и договаривайтесь с партнёрами напрямую.'}</p><Feedback error={state.error} zh={zh} />{state.loading ? <Loading zh={zh} /> : state.data && <div className="sv-stats">{[zh ? '已发布广告' : 'Активных объявлений', zh ? '收到的申请' : 'Входящих заявок', zh ? '发出的申请' : 'Исходящих заявок'].map((label, i) => <div key={label}><strong>{state.data[i]}</strong>{label}</div>)}</div>}<section className="sp-banner"><span className="sv-eyebrow" style={{ color: '#a8d7ff' }}>{zh ? '从报价到合作' : 'ОТ ПРЕДЛОЖЕНИЯ К СОТРУДНИЧЕСТВУ'}</span><h2>{zh ? '寻找货源或安排运输' : 'Найдите продукцию или перевозку'}</h2><p>{zh ? '在市场选择报价，从企业账户发出申请，并在申请中讨论条件。' : 'Выберите предложение на маркетплейсе, отправьте заявку от компании и обсудите условия в переписке.'}</p><Link className="sv-button" to="/marketplace">{zh ? '打开市场' : 'Открыть маркетплейс'} →</Link></section><div className="sp-grid"><section className="sv-card"><h2>{zh ? '您的报价' : 'Ваши предложения'}</h2><p>{zh ? '产品、路线、价格和有效期。支持俄文与中文。' : 'Продукция, маршруты, цены и сроки действия. Поля на русском и китайском.'}</p><Link to="/portal/listings">{zh ? '管理广告' : 'Управлять объявлениями'} →</Link></section><section className="sv-card"><h2>{zh ? '团队工作' : 'Работайте командой'}</h2><p>{zh ? '邀请经理或授予只读访问权限。' : 'Пригласите менеджеров или предоставьте сотрудникам доступ для просмотра.'}</p><Link to="/portal/company">{zh ? '企业与团队' : 'Компания и сотрудники'} →</Link></section></div><p className="sv-notice">{zh ? '此版本包含广告、申请和消息。电子签署、会计和税务模块尚未上线。' : 'В этой версии доступны объявления, заявки и переписка. Электронное подписание, бухгалтерия и налоговый учёт ещё в разработке.'}</p></>;
}

function MyListings({ zh }) {
  const { company, role } = useCompany(); const [editing, setEditing] = useState(null);
  const state = useLoad(() => result(supabase.from('sv_listings').select('*').eq('company_id', company.id).order('updated_at', { ascending: false }).limit(200)), [company.id]);
  if (editing) return <ListingEditor zh={zh} original={editing.id ? editing : null} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); state.reload(); }} />;
  return <><div className="sv-heading"><h1>{zh ? '我的广告' : 'Мои объявления'}</h1>{canEdit(role) && <button onClick={() => setEditing({})}>+ {zh ? '发布广告' : 'Добавить объявление'}</button>}</div><Feedback error={state.error} zh={zh} />{state.loading ? <Loading zh={zh} /> : !state.data?.length ? <Empty title={zh ? '还没有广告' : 'Пока нет объявлений'} text={zh ? '添加产品或运输路线，让合作伙伴找到您。' : 'Добавьте продукцию или маршрут перевозки, чтобы партнёры могли найти вас.'} /> : <div className="sp-grid">{state.data.map(l => <article className="sv-card sp-listing" key={l.id}><div className="sp-card-top"><span className="sp-tag">{l.kind === 'product' ? (zh ? '产品' : 'Продукция') : (zh ? '物流' : 'Логистика')}</span><span className="sp-tag">{statusLabel(l.status, zh)}</span></div><h2>{listingName(l, zh)}</h2><p>{l.origin}{l.destination && ` → ${l.destination}`}</p><div className="sp-price">{listingPrice(l, zh)}</div>{canEdit(role) && <button className="secondary" onClick={() => setEditing(l)}>{zh ? '编辑' : 'Редактировать'}</button>}</article>)}</div>}</>;
}

function ListingEditor({ zh, original, onCancel, onDone }) {
  const { company } = useCompany();
  const [v, setV] = useState(original ? { ...original, price: original.price ?? '', valid_until: original.valid_until || '' } : { kind: 'product', title: '', title_zh: '', description: '', description_zh: '', origin: company.city || '', destination: '', price: '', currency: 'USD', unit: 'tonne', basis: 'FCA', transport: 'rail', valid_until: '', status: 'draft' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  const set = (key, value) => setV(current => ({ ...current, [key]: value, ...(key === 'kind' ? { basis: value === 'logistics' ? 'route' : 'FCA' } : {}) }));
  const field = (key, label, props = {}) => <label>{label}<input value={v[key]} onChange={e => set(key, e.target.value)} {...props} /></label>;
  const select = (key, label, options) => <label>{label}<select aria-label={label} value={v[key]} onChange={e => set(key, e.target.value)}>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
  async function submit(e) { e.preventDefault(); setBusy(true); setError(null); try { await saveListing(company.id, v, original); onDone(); } catch (err) { setError(err); } finally { setBusy(false); } }
  return <form onSubmit={submit}><div className="sv-heading"><h1>{zh ? '编辑广告' : 'Редактор объявления'}</h1><button type="button" className="secondary" onClick={onCancel} disabled={busy}>{zh ? '返回' : 'Назад'}</button></div><section className="sv-card"><div className="sp-fields">{select('kind', zh ? '类型' : 'Тип', [['product', zh ? '产品' : 'Продукция'], ['logistics', zh ? '物流' : 'Логистика']])}{select('status', zh ? '发布状态' : 'Публикация', ['draft', 'published', 'archived'].map(s => [s, statusLabel(s, zh)]))}{field('title', zh ? '标题（俄文或原文）' : 'Название на русском', { required: true, minLength: 3, maxLength: 180 })}{field('title_zh', zh ? '中文标题（可选）' : 'Название на китайском', { maxLength: 180 })}<label>{zh ? '说明（俄文或原文）' : 'Описание на русском'}<textarea rows={5} maxLength={10000} value={v.description} onChange={e => set('description', e.target.value)} /></label><label>{zh ? '中文说明（可选）' : 'Описание на китайском'}<textarea rows={5} maxLength={10000} value={v.description_zh} onChange={e => set('description_zh', e.target.value)} /></label>{field('origin', zh ? '发货城市 / 车站' : 'Город / станция отправления', { required: true, maxLength: 160 })}{field('destination', zh ? '目的地城市 / 车站' : 'Город / станция назначения', { required: v.kind === 'logistics' || v.basis === 'DAP', maxLength: 160 })}{field('price', zh ? '价格（留空表示面议）' : 'Цена — пусто, если по запросу', { type: 'number', min: 0, max: 99999999999999, step: '0.01' })}{select('currency', zh ? '币种' : 'Валюта', ['USD', 'KZT', 'CNY'].map(s => [s, s]))}{select('unit', zh ? '计价单位' : 'Единица цены', [['tonne', zh ? '每吨' : 'За тонну'], ['container', zh ? '每集装箱' : 'За контейнер'], ['trip', zh ? '每车次' : 'За рейс']])}{v.kind === 'product' ? select('basis', zh ? '交货条件' : 'Условия поставки', [['FCA', 'FCA'], ['DAP', 'DAP']]) : select('transport', zh ? '运输方式' : 'Транспорт', [['rail', zh ? '铁路' : 'Железнодорожный'], ['road', zh ? '汽车' : 'Автомобильный'], ['container', zh ? '集装箱' : 'Контейнерный']])}{field('valid_until', zh ? '报价有效期至' : 'Цена действует до', { type: 'date' })}</div><p className="sv-muted">{zh ? '无中文翻译时显示原文。保存为“已发布”后，广告将公开。' : 'Без китайского перевода показывается русский текст. Статус «Опубликовано» делает объявление доступным всем.'}</p></section><Feedback error={error} zh={zh} /><button disabled={busy}>{busy ? '…' : (zh ? '保存广告' : 'Сохранить объявление')}</button></form>;
}

function Requests({ zh }) {
  const { company } = useCompany(); const [tab, setTab] = useState('incoming');
  const state = useLoad(() => result(supabase.from('sv_requests').select('*,sender:sv_companies!from_company(name,name_zh),recipient:sv_companies!to_company(name,name_zh)').eq(tab === 'incoming' ? 'to_company' : 'from_company', company.id).order('created_at', { ascending: false }).limit(200)), [company.id, tab]);
  return <><h1>{zh ? '申请与消息' : 'Заявки и сообщения'}</h1><div className="sv-tabs">{[['incoming', zh ? '收到的申请' : 'Входящие'], ['outgoing', zh ? '发出的申请' : 'Исходящие']].map(([key, label]) => <button className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)}>{label}</button>)}<button onClick={state.reload}>{zh ? '刷新' : 'Обновить'}</button></div><Feedback error={state.error} zh={zh} />{state.loading ? <Loading zh={zh} /> : state.data?.length ? state.data.map(r => { const partner = tab === 'incoming' ? r.sender : r.recipient; return <Link key={r.id} className="sp-thread" to={`/portal/requests/${r.id}`}><strong>{r.subject}</strong><span>{(zh && partner?.name_zh) || partner?.name} · {statusLabel(r.status, zh)} · {new Date(r.created_at).toLocaleDateString(zh ? 'zh-CN' : 'ru-RU')}</span></Link>; }) : <Empty title={zh ? '暂无申请' : 'Заявок пока нет'} text={zh ? '在市场选择广告并联系公司，或发布自己的报价。' : 'Выберите предложение на маркетплейсе и отправьте заявку или опубликуйте своё объявление.'}><Link to="/marketplace">{zh ? '查看市场' : 'Посмотреть объявления'} →</Link></Empty>}</>;
}

function Thread({ zh }) {
  const { id } = useParams(); const { company, role } = useCompany(); const [body, setBody] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]); const [chatError, setChatError] = useState(null); const [more, setMore] = useState(false);
  const state = useLoad(() => result(supabase.from('sv_requests').select('*,sender:sv_companies!from_company(name,name_zh),recipient:sv_companies!to_company(name,name_zh)').eq('id', id).or(`from_company.eq.${company.id},to_company.eq.${company.id}`).maybeSingle()), [id, company.id]);
  useEffect(() => {
    let active = true; setMessages([]); setChatError(null);
    const refresh = async () => {
      try { const rows = await result(supabase.from('sv_messages').select('*').eq('request_id', id).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(100)); if (active) { setMessages(rows.reverse()); setMore(rows.length === 100); setChatError(null); } }
      catch (e) { if (active) setChatError(e); }
    };
    refresh(); const timer = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 7000);
    return () => { active = false; clearInterval(timer); };
  }, [id, company.id]);
  async function send(e) {
    e.preventDefault(); if (!body.trim()) return; setBusy(true); setError(null);
    try { const row = await result(supabase.from('sv_messages').insert({ request_id: id, company_id: company.id, body: body.trim() }).select().single()); setMessages(rows => rows.some(r => r.id === row.id) ? rows : [...rows, row]); setBody(''); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }
  async function status(value) { setBusy(true); setError(null); try { await result(supabase.from('sv_requests').update({ status: value }).eq('id', id).select().single()); state.reload(); } catch (e) { setError(e); } finally { setBusy(false); } }
  if (state.loading) return <Loading zh={zh} />;
  if (state.error) return <Feedback error={state.error} zh={zh} />;
  const r = state.data;
  if (!r) return <Empty title={zh ? '申请不存在或无权访问' : 'Заявка не найдена или недоступна'} />;
  return <><Link to="/portal/requests">← {zh ? '所有申请' : 'Все заявки'}</Link><h1>{r.subject}</h1><p>{r.sender?.name} → {r.recipient?.name}</p><div className="sv-card"><span className="sp-tag">{statusLabel(r.status, zh)}</span><p className="sp-description">{r.body}</p>{canEdit(role) && <div className="sv-actions">{['new', 'discussing', 'closed'].filter(s => s !== r.status).map(s => <button className="secondary" key={s} disabled={busy} onClick={() => status(s)}>{statusLabel(s, zh)}</button>)}</div>}</div><h2>{zh ? '商务沟通' : 'Переписка'}</h2><p className="sv-muted">{zh ? '消息对双方公司的授权员工可见。打开页面时每7秒更新。' : 'Сообщения видны уполномоченным сотрудникам обеих компаний. Открытый чат обновляется каждые 7 секунд.'}</p><Feedback error={chatError} zh={zh} />{more && <p className="sv-notice">{zh ? '显示最近100条消息。' : 'Показаны последние 100 сообщений.'}</p>}<div className="sp-chat" aria-label={zh ? '消息' : 'Сообщения'}>{!messages.length && <p className="sv-muted">{zh ? '暂无消息。请在此讨论申请的详细条件。' : 'Сообщений пока нет. Здесь можно обсудить детали заявки.'}</p>}{messages.map(m => <div key={m.id} className={`sp-message ${m.company_id === company.id ? 'own' : ''}`}>{m.body}<small>{m.company_id === r.from_company ? r.sender?.name : r.recipient?.name} · {new Date(m.created_at).toLocaleString(zh ? 'zh-CN' : 'ru-RU')}</small></div>)}</div>{canEdit(role) && r.status !== 'closed' ? <form onSubmit={send}><label>{zh ? '消息内容' : 'Ваше сообщение'}<textarea value={body} onChange={e => setBody(e.target.value)} maxLength={5000} rows={3} required /></label><button disabled={busy || !body.trim()}>{zh ? '发送' : 'Отправить'}</button></form> : <p className="sv-notice">{r.status === 'closed' ? (zh ? '申请已关闭。重新打开后可继续聊天。' : 'Заявка закрыта. Откройте её заново, чтобы продолжить переписку.') : (zh ? '您拥有只读权限。' : 'У вас доступ только для просмотра.')}</p>}<Feedback error={error} zh={zh} /></>;
}

function Team({ zh }) {
  const { company, role } = useCompany(); const [error, setError] = useState(null); const [busy, setBusy] = useState(false); const [link, setLink] = useState('');
  const state = useLoad(async () => ({ members: await result(supabase.from('sv_company_members').select('*').eq('company_id', company.id)), invites: role === 'owner' ? await result(supabase.from('sv_company_invites').select('*').eq('company_id', company.id).is('accepted_at', null).order('created_at', { ascending: false }).limit(100)) : [] }), [company.id, role]);
  async function invite(e) {
    e.preventDefault(); const form = e.currentTarget; const values = new FormData(form); setBusy(true); setError(null); setLink('');
    try { const row = await result(supabase.from('sv_company_invites').insert({ company_id: company.id, email: String(values.get('email')).trim().toLowerCase(), role: values.get('role') }).select().single()); setLink(`${window.location.origin}/portal?invite=${row.token}`); form.reset(); state.reload(); } catch (err) { setError(err); } finally { setBusy(false); }
  }
  async function mutate(query) { setBusy(true); setError(null); try { await result(query); state.reload(); } catch (err) { setError(err); } finally { setBusy(false); } }
  return <section className="sv-card"><h2>{zh ? '员工与权限' : 'Сотрудники и доступ'}</h2><Feedback error={state.error || error} zh={zh} />{state.loading ? <Loading zh={zh} /> : <>{state.data?.members.map(m => <div className="sp-thread" key={m.user_id}><strong>{m.display_name || (zh ? '企业所有者' : 'Владелец компании')}</strong><span>{roleLabel(m.role, zh)}</span>{role === 'owner' && m.role !== 'owner' && <div className="sv-actions"><button disabled={busy} className="secondary" onClick={() => mutate(supabase.from('sv_company_members').update({ role: m.role === 'manager' ? 'viewer' : 'manager' }).eq('company_id', company.id).eq('user_id', m.user_id))}>{m.role === 'manager' ? (zh ? '设为只读' : 'Только просмотр') : (zh ? '设为经理' : 'Сделать менеджером')}</button><button disabled={busy} className="danger" onClick={() => { if (window.confirm(zh ? '撤销此员工的访问权限？' : 'Закрыть доступ этому сотруднику?')) mutate(supabase.from('sv_company_members').delete().eq('company_id', company.id).eq('user_id', m.user_id)); }}>{zh ? '撤销访问' : 'Закрыть доступ'}</button></div>}</div>)}</>}{role === 'owner' && <><form onSubmit={invite}><h3>{zh ? '邀请员工' : 'Пригласить сотрудника'}</h3><div className="sp-fields"><label>Email<input name="email" type="email" maxLength={254} required /></label><label>{zh ? '权限' : 'Роль'}<select name="role" aria-label={zh ? "权限" : "Роль"}><option value="manager">{zh ? '经理：广告、申请、消息' : 'Менеджер: объявления, заявки, сообщения'}</option><option value="viewer">{zh ? '只读' : 'Просмотр'}</option></select></label></div><button disabled={busy}>{zh ? '创建邀请链接' : 'Создать приглашение'}</button><p className="sv-muted">{zh ? '链接有效期7天，仅限指定邮箱。请自行发送链接。系统不会发送邮件。' : 'Ссылка действует 7 дней и подходит только указанному email. Передайте её сотруднику самостоятельно — письмо автоматически не отправляется.'}</p></form>{link && <label>{zh ? '邀请链接' : 'Ссылка приглашения'}<input readOnly value={link} onFocus={e => e.target.select()} /></label>}{state.data?.invites.map(inv => <div className="sp-thread" key={inv.id}><strong>{inv.email}</strong><span>{roleLabel(inv.role, zh)} · {zh ? '有效期至' : 'До'} {new Date(inv.expires_at).toLocaleDateString(zh ? 'zh-CN' : 'ru-RU')}</span><div className="sv-actions"><button className="secondary" onClick={() => setLink(`${window.location.origin}/portal?invite=${inv.token}`)}>{zh ? '显示链接' : 'Показать ссылку'}</button><button className="danger" disabled={busy} onClick={() => mutate(supabase.from('sv_company_invites').delete().eq('id', inv.id).eq('company_id', company.id))}>{zh ? '撤销邀请' : 'Отозвать'}</button></div></div>)}</>}</section>;
}

export function RequestForm({ listing, zh, onCancel }) {
  const { company, role } = useCompany(); const navigate = useNavigate(); const [busy, setBusy] = useState(false); const [error, setError] = useState(null);
  if (!company) return <div className="sp-request"><p>{zh ? '请登录并添加企业以发送申请。' : 'Для отправки заявки войдите и добавьте компанию.'}</p><Link className="sv-button" to="/portal">{zh ? '进入工作空间' : 'Войти в кабинет'}</Link></div>;
  if (company.id === listing.company_id) return <p className="sv-notice">{zh ? '这是您公司的广告。' : 'Это объявление вашей компании.'}</p>;
  if (!canEdit(role)) return <p className="sv-notice">{zh ? '您拥有只读权限。' : 'У вас доступ только для просмотра.'}</p>;
  async function submit(e) {
    e.preventDefault(); const values = new FormData(e.currentTarget); setBusy(true); setError(null);
    try { const row = await result(supabase.from('sv_requests').insert({ listing_id: listing.id, from_company: company.id, to_company: listing.company_id, subject: String(values.get('subject')).trim(), body: String(values.get('body')).trim() }).select().single()); navigate(`/portal/requests/${row.id}`); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }
  return <form className="sp-request" onSubmit={submit}><p className="sv-muted">{zh ? '发送企业' : 'От компании'}: <strong>{company.name}</strong></p><label>{zh ? '主题' : 'Тема'}<input name="subject" defaultValue={listingName(listing, zh)} minLength={3} maxLength={200} required /></label><label>{zh ? '数量、路线与期望条件' : 'Объём, маршрут и пожелания'}<textarea name="body" rows={4} minLength={3} maxLength={5000} required /></label><Feedback error={error} zh={zh} /><div className="sv-actions"><button disabled={busy}>{zh ? '发送申请' : 'Отправить заявку'}</button><button className="secondary" type="button" onClick={onCancel} disabled={busy}>{zh ? '取消' : 'Отмена'}</button></div></form>;
}
