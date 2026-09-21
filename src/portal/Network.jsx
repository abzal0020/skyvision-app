import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { result } from './api';
import { Account, Empty, Feedback, Loading, useLoad } from './Portal';
import { uploadFile } from './files';
import './social.css';

export function Media({ bucket, path, kind = 'photo', label = '' }) {
  const [url, setUrl] = useState('');
  useEffect(() => { let active = true; setUrl(''); if (path) result(supabase.storage.from(bucket).createSignedUrl(path, 600)).then(data => { if (active) setUrl(data.signedUrl); }).catch(() => {}); return () => { active = false; }; }, [bucket, path]);
  if (!url) return <div className="sn-avatar">{label.slice(0, 1).toUpperCase() || '·'}</div>;
  return kind === 'video' ? <video controls preload="metadata" src={url} /> : <img src={url} alt={label} loading="lazy" />;
}
export default function Network({ lang }) {
  const zh = lang === 'zh'; const { user, loading } = useAuth();
  if (loading) return <div className="sv"><Loading zh={zh} /></div>;
  if (!user) return <Account zh={zh} />;
  return <div className="sv sp"><div className="sp-layout"><aside className="sp-sidebar"><h2>{zh ? '我的 SkyVision' : 'Мой SkyVision'}</h2><small>{zh ? '联系 · 交流 · 合作' : 'Люди · Общение · Сотрудничество'}</small><nav><NavLink to="/network" end>{zh ? '寻找伙伴' : 'Найти людей'}</NavLink><NavLink to="/network/friends">{zh ? '好友与邀请' : 'Друзья и запросы'}</NavLink><NavLink to="/network/messages">{zh ? '私信' : 'Личные сообщения'}</NavLink><NavLink to="/network/me">{zh ? '我的个人资料' : 'Мой профиль'}</NavLink></nav><nav className="sp-side-bottom"><Link to="/portal">{zh ? '我的企业' : 'Моя компания'} ↗</Link><Link to="/deals">{zh ? '供应与文件' : 'Поставки и документы'} ↗</Link></nav></aside><div className="sp-main"><Routes><Route index element={<People zh={zh} />} /><Route path="me" element={<MyProfile zh={zh} />} /><Route path="person/:id" element={<Person zh={zh} />} /><Route path="friends" element={<Friends zh={zh} />} /><Route path="messages" element={<Inbox zh={zh} />} /><Route path="messages/:id" element={<DirectChat zh={zh} />} /></Routes></div></div></div>;
}
function MyProfile({ zh }) {
  const { user } = useAuth();
  const state = useLoad(() => result(supabase.from('sv_people').select('*').eq('user_id', user.id).maybeSingle()), [user.id]);
  if (state.loading) return <Loading zh={zh} />;
  if (state.error) return <Feedback error={state.error} zh={zh} />;
  return <ProfileEditor zh={zh} profile={state.data} onDone={state.reload} />;
}
function ProfileEditor({ zh, profile, onDone }) {
  const { user } = useAuth(); const [v, setV] = useState(profile || { full_name: '', headline: '', city: '', about: '', listed: true, avatar_path: '' });
  const [photo, setPhoto] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(null); const [saved, setSaved] = useState(false);
  const set = (key, val) => { setV(old => ({ ...old, [key]: val })); setSaved(false); };
  async function save(e) {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      const fields = Object.fromEntries(['full_name','headline','city','about','listed','avatar_path'].map(k => [k,v[k]]));
      if (photo) fields.avatar_path = await uploadFile('skyvision-people', user.id, photo, ['image/jpeg','image/png','image/webp'], 5);
      await result(profile ? supabase.from('sv_people').update(fields).eq('user_id', user.id).select().single() : supabase.from('sv_people').insert(fields).select().single());
      setSaved(true); if (!profile) onDone();
    } catch (err) { setError(err); } finally { setBusy(false); }
  }
  return <><span className="sv-eyebrow">SKYVISION / {zh ? '个人账户' : 'ЛИЧНЫЙ АККАУНТ'}</span><h1>{zh ? '我的个人资料' : 'Мой профиль'}</h1><form className="sv-card" onSubmit={save}><div className="sn-profile-top"><div className="sn-photo"><Media bucket="skyvision-people" path={v.avatar_path} label={v.full_name} /></div><p className="sv-muted">{zh ? '个人账户属于您。企业权限由企业负责人分配。' : 'Личный аккаунт принадлежит вам. Доступ к рабочим данным назначает ваша компания.'}</p></div><div className="sp-fields"><label>{zh ? '姓名' : 'Имя и фамилия'}<input required minLength={2} maxLength={120} value={v.full_name} onChange={e => set('full_name',e.target.value)} /></label><label>{zh ? '职业 / 专长' : 'Должность / специализация'}<input maxLength={160} value={v.headline} onChange={e => set('headline',e.target.value)} /></label><label>{zh ? '城市' : 'Город'}<input maxLength={120} value={v.city} onChange={e => set('city',e.target.value)} /></label><label>{zh ? '头像：JPG、PNG、WebP，最多5MB' : 'Фото: JPG, PNG, WebP — до 5 МБ'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPhoto(e.target.files[0])} /></label></div><label>{zh ? '自我介绍' : 'О себе'}<textarea rows={4} maxLength={3000} value={v.about} onChange={e => set('about',e.target.value)} /></label><label className="sn-checkbox"><input type="checkbox" checked={v.listed} onChange={e => set('listed',e.target.checked)} />{zh ? '让已登录的用户在搜索中找到我' : 'Показывать мой профиль в поиске зарегистрированным пользователям'}</label><p className="sv-muted">{zh ? '隐藏资料后，已有联系人的访问权限仍保留。邮箱不公开。' : 'Если скрыть профиль, он останется доступен людям, с которыми уже есть связь или переписка. Email не публикуется.'}</p><Feedback error={error} zh={zh} />{saved && <p className="sv-success">{zh ? '已保存' : 'Профиль сохранён'}</p>}<button disabled={busy}>{busy ? '…' : (zh ? '保存资料' : 'Сохранить профиль')}</button></form></>;
}
function PersonCard({ p, zh, children }) {
  return <article className="sv-card"><div className="sn-profile-top"><Link to={`/network/person/${p.user_id}`} className="sn-photo"><Media bucket="skyvision-people" path={p.avatar_path} label={p.full_name} /></Link><div><h2><Link to={`/network/person/${p.user_id}`}>{p.full_name}</Link></h2><p className="sv-muted">{p.headline}{p.city && ` · ${p.city}`}</p></div></div>{children}</article>;
}
function People({ zh }) {
  const [search,setSearch] = useState(''); const [query,setQuery] = useState(''); const [page,setPage] = useState(0);
  const state = useLoad(() => { let q=supabase.from('sv_people').select('*').eq('listed',true).order('full_name').order('user_id').range(page*24,page*24+23); if(query) q=q.ilike('full_name',`%${query}%`); return result(q); },[query,page]);
  return <><h1>{zh ? '建立商务联系' : 'Находите деловые контакты'}</h1><p className="sv-muted">{zh ? '认识工厂代表、采购商和物流专家。' : 'Представители заводов, покупатели и специалисты по логистике.'}</p><form className="sp-toolbar" onSubmit={e=>{e.preventDefault();setPage(0);setQuery(search.trim().replace(/[%_]/g,''));}}><input aria-label={zh?'搜索姓名':'Поиск по имени'} value={search} onChange={e=>setSearch(e.target.value)} maxLength={120} placeholder={zh?'输入姓名':'Введите имя или фамилию'} /><button>{zh?'搜索':'Найти'}</button><Link className="sv-button secondary" to="/network/me">{zh?'我的资料':'Заполнить профиль'}</Link></form><Feedback error={state.error} zh={zh}/>{state.loading?<Loading zh={zh}/>:state.data?.length?<div className="sp-grid sn-grid">{state.data.map(p=><PersonCard p={p} zh={zh} key={p.user_id}/>)}</div>:<Empty title={zh?'还没有公开资料':'Пока нет открытых профилей'} text={zh?'完善您的个人资料，让合作伙伴找到您。':'Заполните свой профиль, чтобы партнёры могли найти вас.'}/>}<div className="sp-pager"><button disabled={!page} onClick={()=>setPage(p=>p-1)}>←</button><span>{page+1}</span><button disabled={state.data?.length!==24} onClick={()=>setPage(p=>p+1)}>→</button></div></>;
}
function Person({ zh }) {
  const {id}=useParams(); const {user}=useAuth(); const [error,setError]=useState(null); const [busy,setBusy]=useState(false);
  const state=useLoad(async()=>({person:await result(supabase.from('sv_people').select('*').eq('user_id',id).maybeSingle()),self:await result(supabase.from('sv_people').select('user_id').eq('user_id',user.id).maybeSingle()),friend:await result(supabase.from('sv_friendships').select('*').or(`and(sender_id.eq.${user.id},recipient_id.eq.${id}),and(sender_id.eq.${id},recipient_id.eq.${user.id})`).maybeSingle()),block:await result(supabase.from('sv_blocks').select('*').eq('blocked_id',id).maybeSingle())}),[id,user.id]);
  async function act(query){setBusy(true);setError(null);try{await result(query);state.reload();}catch(e){setError(e);}finally{setBusy(false);}}
  if(state.loading)return <Loading zh={zh}/>; if(state.error)return <Feedback error={state.error} zh={zh}/>;
  const {person,friend,block,self}=state.data; if(!person)return <Empty title={zh?'资料不可用':'Профиль недоступен'}/>;
  return <><Link to="/network">← {zh?'联系人':'Люди'}</Link><PersonCard p={person} zh={zh}><p className="sp-description">{person.about}</p>{id===user.id?<Link to="/network/me">{zh?'编辑资料':'Редактировать профиль'}</Link>:!self?<Link to="/network/me">{zh?'先填写个人资料':'Сначала заполните свой профиль'}</Link>:<div className="sv-actions">{!block&&<Link className="sv-button" to={`/network/messages/${id}`}>{zh?'发私信':'Написать'}</Link>}{!friend&&!block&&<button disabled={busy} className="secondary" onClick={()=>act(supabase.from('sv_friendships').insert({recipient_id:id}))}>{zh?'添加好友':'Добавить в друзья'}</button>}{friend?.status==='pending'&&friend.recipient_id===user.id&&<button disabled={busy} onClick={()=>act(supabase.from('sv_friendships').update({status:'accepted'}).eq('id',friend.id))}>{zh?'接受好友请求':'Принять запрос'}</button>}{friend&&<button disabled={busy} className="secondary" onClick={()=>act(supabase.from('sv_friendships').delete().eq('id',friend.id))}>{friend.status==='accepted'?(zh?'移除好友':'Удалить из друзей'):(zh?'取消 / 拒绝请求':'Отменить / отклонить запрос')}</button>}<button disabled={busy} className="secondary" onClick={()=>act(block?supabase.from('sv_blocks').delete().eq('blocked_id',id):supabase.from('sv_blocks').insert({blocked_id:id}))}>{block?(zh?'解除屏蔽':'Разблокировать'):(zh?'屏蔽消息':'Заблокировать сообщения')}</button></div>}{friend?.status==='accepted'&&<p className="sv-success">{zh?'你们已是好友':'Вы в друзьях'}</p>}{friend?.status==='pending'&&friend.sender_id===user.id&&<p className="sv-notice">{zh?'好友请求已发送':'Запрос в друзья отправлен'}</p>}<Feedback error={error} zh={zh}/></PersonCard></>;
}
function Friends({zh}){
  const {user}=useAuth();const state=useLoad(()=>result(supabase.from('sv_friendships').select('*,sender:sv_people!sender_id(*),recipient:sv_people!recipient_id(*)').order('created_at',{ascending:false}).limit(200)),[user.id]);
  return <><h1>{zh?'好友与请求':'Друзья и запросы'}</h1><Feedback error={state.error} zh={zh}/>{state.loading?<Loading zh={zh}/>:state.data?.length?state.data.map(f=><PersonCard key={f.id} p={f.sender_id===user.id?f.recipient:f.sender} zh={zh}><span className="sp-tag">{f.status==='accepted'?(zh?'好友':'В друзьях'):f.sender_id===user.id?(zh?'已发送请求':'Исходящий запрос'):(zh?'收到请求':'Входящий запрос')}</span></PersonCard>):<Empty title={zh?'从认识一位伙伴开始':'Начните с нового знакомства'}><Link to="/network">{zh?'寻找伙伴':'Найти людей'} →</Link></Empty>}</>;
}
function Inbox({zh}){
  const {user}=useAuth();const state=useLoad(()=>result(supabase.from('sv_direct_messages').select('*,sender:sv_people!sender_id(*),recipient:sv_people!recipient_id(*)').order('created_at',{ascending:false}).limit(300)),[user.id]);
  const dialogs=[];const seen=new Set();for(const m of state.data||[]){const p=m.sender_id===user.id?m.recipient:m.sender;if(!seen.has(p.user_id)){seen.add(p.user_id);dialogs.push({p,m});}}
  return <><div className="sv-heading"><h1>{zh?'个人消息':'Личные сообщения'}</h1><button className="secondary" onClick={state.reload}>{zh?'刷新':'Обновить'}</button></div><Feedback error={state.error} zh={zh}/>{state.loading?<Loading zh={zh}/>:dialogs.length?dialogs.map(({p,m})=><Link className="sp-thread" key={p.user_id} to={`/network/messages/${p.user_id}`}><strong>{p.full_name}</strong><span>{m.body.slice(0,140)}</span></Link>):<Empty title={zh?'还没有对话':'Пока нет диалогов'} text={zh?'打开某人的资料并点击“发私信”。':'Откройте профиль человека и нажмите «Написать».'}/>}</>;
}
function DirectChat({zh}){
  const {id}=useParams();const {user}=useAuth();const [rows,setRows]=useState([]);const [body,setBody]=useState('');const [error,setError]=useState(null);const [busy,setBusy]=useState(false);
  const person=useLoad(()=>result(supabase.from('sv_people').select('*').eq('user_id',id).maybeSingle()),[id]);
  useEffect(()=>{let active=true;const refresh=async()=>{try{const data=await result(supabase.from('sv_direct_messages').select('*').or(`and(sender_id.eq.${user.id},recipient_id.eq.${id}),and(sender_id.eq.${id},recipient_id.eq.${user.id})`).order('created_at',{ascending:false}).limit(100));if(active)setRows(data.reverse());}catch(e){if(active)setError(e);}};setRows([]);refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')refresh();},6000);return()=>{active=false;clearInterval(timer);};},[id,user.id]);
  async function send(e){e.preventDefault();setBusy(true);setError(null);try{const row=await result(supabase.from('sv_direct_messages').insert({recipient_id:id,body:body.trim()}).select().single());setRows(old=>[...old,row]);setBody('');}catch(e){setError(e);}finally{setBusy(false);}}
  if(person.loading)return <Loading zh={zh}/>; if(!person.data)return <Empty title={zh?'资料不可用':'Профиль недоступен'}/>;
  return <><Link to="/network/messages">← {zh?'所有对话':'Все диалоги'}</Link><h1>{person.data.full_name}</h1><p className="sv-muted">{zh?'私人对话，不属于企业。':'Личная переписка — не относится к компании.'}</p><div className="sp-chat">{rows.map(m=><div className={`sp-message ${m.sender_id===user.id?'own':''}`} key={m.id}><div>{m.body}</div><small>{new Date(m.created_at).toLocaleString(zh?'zh-CN':'ru-RU')}</small></div>)}</div>{rows.length===100&&<p className="sv-muted">{zh?'显示最近100条消息':'Показаны последние 100 сообщений'}</p>}<form onSubmit={send}><label>{zh?'消息':'Сообщение'}<textarea required maxLength={5000} rows={3} value={body} onChange={e=>setBody(e.target.value)}/></label><button disabled={busy||!body.trim()}>{zh?'发送':'Отправить'}</button></form><Feedback error={error} zh={zh}/><Link to={`/network/person/${id}`}>{zh?'个人资料与屏蔽设置':'Профиль и блокировка'}</Link></>;
}
