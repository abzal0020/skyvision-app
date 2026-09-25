import React, {useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import {businessTypes, countries, registrationData} from './registration';
import './registration.css';

export default function Account({zh}) {
  const [mode,setMode]=useState('login');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const signup=mode==='signup';
  async function submit(e) {
    e.preventDefault();
    const fields=new FormData(e.currentTarget);
    const password=String(fields.get('password'));
    setError('');setNotice('');
    if(signup && password!==fields.get('confirm_password')) {
      setError(zh?'两次输入的密码不一致。':'Пароли не совпадают.');return;
    }
    const registration=signup?registrationData(fields):null;
    if(signup && (!registration.full_name || !registration.company_name || !registration.city || !registration.phone || !businessTypes(zh).some(([v])=>v===registration.business_type))) {
      setError(zh?'请填写所有必填信息。':'Заполните все обязательные поля.');return;
    }
    setBusy(true);
    try {
      const email=String(fields.get('email')).trim();
      const response=signup
        ? await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${window.location.origin}/portal`,data:{registration}}})
        : await supabase.auth.signInWithPassword({email,password});
      if(response.error) throw response.error;
      if(signup && !response.data.session) setNotice(zh?'请查收确认邮件。确认邮箱并登录后，您可以核对并创建企业资料。':'Проверьте почту и подтвердите email. После входа останется проверить данные и создать страницу компании.');
    } catch(err) {
      setError(signup?(zh?'无法注册。请检查资料或稍后重试。':'Не удалось зарегистрироваться. Проверьте данные или попробуйте позже.'):(zh?'无法登录。请检查邮箱、密码及邮箱确认状态。':'Не удалось войти. Проверьте email, пароль и подтверждение почты.'));
    } finally {setBusy(false);}
  }
  return <div className="sv sp"><section className={`sv-card sp-auth registration ${signup?'registration-wide':''}`}>
    <span className="sv-eyebrow">SKYVISION PORTAL</span>
    <h1>{signup?(zh?'注册':'Регистрация'):(zh?'个人工作空间':'Личный кабинет')}</h1>
    <p className="sv-muted">{signup?(zh?'填写联系人与企业信息。所有业务类型使用同一个平台。':'Заполните данные представителя и компании. Для всех направлений работы — единый аккаунт.'):(zh?'登录以使用企业工作空间、消息与订单。':'Войдите, чтобы работать с компанией, перепиской и поставками.')}</p>
    <div className="sv-tabs">{['login','signup'].map(v=><button type="button" key={v} disabled={busy} aria-pressed={mode===v} className={mode===v?'active':''} onClick={()=>{setMode(v);setError('');setNotice('');}}>{v==='login'?(zh?'登录':'Вход'):(zh?'注册':'Регистрация')}</button>)}</div>
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="registration-fields">
        {signup && <>
          <fieldset className="registration-types"><legend>{zh?'业务类型':'Направление деятельности'} *</legend><div>{businessTypes(zh).map(([value,label])=><label key={value}><input type="radio" name="business_type" value={value} required/><span>{label}</span></label>)}</div></fieldset>
          <h2>{zh?'企业信息':'Данные компании'}</h2>
          <label>{zh?'公司名称':'Название компании'} *<input name="company_name" autoComplete="organization" required minLength={2} maxLength={160}/></label>
          <div className="registration-grid"><label>{zh?'国家':'Страна'} *<select name="country" required defaultValue=""><option value="" disabled>{zh?'请选择':'Выберите страну'}</option>{countries(zh).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label>{zh?'城市':'Город'} *<input name="city" autoComplete="address-level2" required maxLength={120}/></label></div>
          <h2>{zh?'联系人':'Контактное лицо'}</h2>
          <div className="registration-grid"><label>{zh?'姓名':'Имя и фамилия'} *<input name="full_name" autoComplete="name" required minLength={2} maxLength={160}/></label><label>{zh?'职位（可选）':'Должность — необязательно'}<input name="position" autoComplete="organization-title" maxLength={160}/></label></div>
          <label>{zh?'联系电话':'Контактный телефон'} *<input name="phone" type="tel" autoComplete="tel" required minLength={6} maxLength={40} placeholder="+7 / +86 …"/></label>
          <h2>{zh?'登录信息':'Данные для входа'}</h2>
        </>}
        <label>Email{signup?' *':''}<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
        <div className={signup?'registration-grid':''}><label>{zh?'密码':'Пароль'}{signup?' *':''}<input name="password" type="password" autoComplete={signup?'new-password':'current-password'} minLength={signup?10:1} required/>{signup&&<small>{zh?'至少10个字符':'Не менее 10 символов'}</small>}</label>{signup&&<label>{zh?'再次输入密码':'Повторите пароль'} *<input name="confirm_password" type="password" autoComplete="new-password" minLength={10} required/></label>}</div>
        {signup&&<p className="sv-muted">{zh?'邮箱与电话将保存在您的账户中，不会在人员搜索中公开。企业资料将在您确认创建后公开。':'Email и телефон сохраняются в вашем аккаунте и не публикуются в поиске людей. Страница компании появится после вашего подтверждения её создания.'}</p>}
        <button disabled={busy}>{busy?(zh?'请稍候…':'Подождите…'):signup?(zh?'创建账户':'Создать аккаунт'):(zh?'登录':'Войти')}</button>
      </fieldset>
      {error&&<p className="sv-error" role="alert">{error}</p>}{notice&&<p className="sv-success" role="status">{notice}</p>}
    </form>
  </section></div>;
}
