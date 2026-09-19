import React, { useEffect, useRef, useState } from 'react';
import emailjs from 'emailjs-com';
import '../components/RequestModal.css';
const service=process.env.REACT_APP_EMAILJS_SERVICE_ID||'service_mfs129i';
const template=process.env.REACT_APP_EMAILJS_TEMPLATE_ID||'template_vixeuwf';
const key=process.env.REACT_APP_EMAILJS_USER_ID||'5hS_rdfopL-fNCVzY';
const phone=process.env.REACT_APP_WHATSAPP_NUMBER||'77715252683';
export default function Inquiry({ factoryName='', initialValues={}, t={}, onClose }) {
  const zh=t.nav?.prices==='价格';
  const tr=(ru,cn)=>zh?cn:ru;
  const [form,setForm]=useState({name:'',phone:'',wechat:'',city:initialValues.city||'',cargo:initialValues.cargo||'',station:initialValues.station||'',amount:initialValues.amount||'',date:''});
  const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState('');
  const dialog=useRef(null),previousFocus=useRef(null);
  useEffect(()=>{previousFocus.current=document.activeElement;dialog.current?.querySelector('input')?.focus();return()=>previousFocus.current?.focus();},[]);
  function keydown(e){if(e.key==='Escape'&&!busy)onClose();if(e.key==='Tab'){const elements=Array.from(dialog.current.querySelectorAll('input,button,select,a[href]')).filter(el=>!el.disabled);const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
  const update=e=>setForm({...form,[e.target.name]:e.target.value});
  const params=()=>({...form,cargo:form.cargo+(form.amount?` (${form.amount} т)`:''),factory:factoryName,to_email:process.env.REACT_APP_RECIPIENT_EMAIL||'abzalkojaixan3@gmail.com'});
  async function submit(e){e.preventDefault();if(busy)return;setError('');setBusy(true);try{await emailjs.send(service,template,params(),key);setSent(true);}catch{setError(tr('Не удалось отправить заявку. Повторите попытку или напишите в WhatsApp.','申请发送失败。请重试或通过 WhatsApp 联系我们。'));}finally{setBusy(false);}}
  function whatsapp(){const p=params();const text=[tr('Запрос предложения','询价'),factoryName,...Object.entries(p).filter(([k,v])=>v&&!['to_email','factory'].includes(k)).map(([k,v])=>`${k}: ${v}`)].join('\n');window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');}
  return <div className="rm-backdrop" onClick={()=>{if(!busy)onClose();}}><div ref={dialog} className="rm-modal" role="dialog" aria-modal="true" aria-labelledby="sv-inquiry-title" onKeyDown={keydown} onClick={e=>e.stopPropagation()}><div className="rm-inner"><button disabled={busy} className="rm-close" aria-label={tr('Закрыть','关闭')} onClick={onClose}>×</button><h2 id="sv-inquiry-title">{sent?tr('Заявка отправлена','申请已发送'):tr('Запросить предложение','获取报价')}</h2><p>{factoryName}</p>
    {sent?<><p>{tr('Спасибо! Менеджер свяжется с вами по указанным контактам.','谢谢！经理将通过您提供的联系方式与您联系。')}</p><button className="rm-btn rm-btn-blue" onClick={onClose}>{tr('Готово','完成')}</button></>:<form onSubmit={submit}><div className="sv-inquiry-fields">{[['name',tr('Ваше имя','姓名'),'text',true],['phone',tr('Телефон','电话'),'tel',true],['wechat','WeChat','text',false],['city',tr('Город завода','工厂所在城市'),'text',false],['cargo',tr('Продукция','产品'),'text',false],['station',tr('Пункт доставки','目的地'),'text',false],['amount',tr('Объём, тонн','数量（吨）'),'number',false],['date',tr('Желаемая дата погрузки','期望装运日期'),'date',false]].map(([name,label,type,required])=><label key={name} className="rm-label">{label}{required?' *':''}<input className="rm-input" name={name} aria-label={label} type={type} required={required} min={type==='number'?'0.01':type==='date'?new Date().toISOString().slice(0,10):undefined} step={type==='number'?'0.01':undefined} value={form[name]} onChange={update} disabled={busy}/></label>)}</div><p className="sv-muted">{tr('Менеджер подтвердит цену, наличие и условия доставки.','经理将确认价格、库存和运输条件。')}</p>{error&&<p className="rm-error" role="alert">{error}</p>}<div className="sv-actions"><button disabled={busy} className="rm-btn rm-btn-blue" type="submit">{busy?tr('Отправка…','发送中…'):tr('Отправить заявку','提交申请')}</button><button disabled={busy} className="rm-btn rm-btn-whatsapp" type="button" onClick={whatsapp}>WhatsApp</button></div></form>}
  </div></div></div>;
}
