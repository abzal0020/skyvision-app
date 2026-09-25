import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import {useAuth} from '../context/AuthContext';

export default function PasswordRecovery({lang}) {
  const zh=lang==='zh';
  const {user,loading,finishRecovery}=useAuth();
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[saved,setSaved]=useState(false);
  async function submit(e) {
    e.preventDefault();setError('');setNotice('');
    const fields=new FormData(e.currentTarget);
    const password=String(fields.get('password')||'');
    if(user && password!==fields.get('confirmation')) {setError(zh?'两次输入的密码不一致。':'Пароли не совпадают.');return;}
    setBusy(true);
    try {
      const response=user
        ? await supabase.auth.updateUser({password})
        : await supabase.auth.resetPasswordForEmail(String(fields.get('email')).trim(),{redirectTo:`${window.location.origin}/portal`});
      if(response.error) throw response.error;
      if(user) setSaved(true);
      else setNotice(zh?'如果该邮箱已注册，您将收到重置密码的邮件。请检查收件箱和垃圾邮件。':'Если аккаунт с этой почтой существует, вы получите письмо восстановления. Проверьте входящие и «Спам».');
    } catch(err) {
      setError(err.status===429?(zh?'请求过于频繁，请稍后重试。':'Слишком много запросов. Подождите немного и попробуйте снова.'):(user?(zh?'无法保存密码。请尝试其他密码或重新获取恢复链接。':'Не удалось сохранить пароль. Попробуйте другой пароль или запросите новую ссылку восстановления.'):(zh?'无法发送邮件，请稍后重试。':'Не удалось отправить письмо. Попробуйте позже.')));
    } finally {setBusy(false);}
  }
  if(loading) return <div className="sv"><p role="status">{zh?'正在检查链接…':'Проверяем ссылку…'}</p></div>;
  return <div className="sv sp"><section className="sv-card sp-auth">
    <h1>{user?(zh?'设置新密码':'Новый пароль'):(zh?'重置密码':'Восстановление пароля')}</h1>
    {saved?<><p role="status" className="sv-success">{zh?'密码已更新。':'Пароль обновлён.'}</p><Link to="/portal" className="sv-button" onClick={finishRecovery}>{zh?'进入门户':'Перейти в кабинет'}</Link></>:<>
      {user?<p>{zh?'账户':'Аккаунт'}: {user.email}</p>:<p>{zh?'输入注册邮箱，我们将发送恢复链接。':'Укажите почту аккаунта — отправим ссылку для задания нового пароля.'}</p>}
      <form onSubmit={submit}><fieldset disabled={busy} className="registration-fields">
        {user?<><label>{zh?'新密码':'Новый пароль'}<input name="password" type="password" autoComplete="new-password" minLength={10} required/></label><small>{zh?'至少10个字符':'Не менее 10 символов'}</small><label>{zh?'确认密码':'Повторите пароль'}<input name="confirmation" type="password" autoComplete="new-password" minLength={10} required/></label></>:<label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}
        <button disabled={busy}>{busy?'…':user?(zh?'保存密码':'Сохранить пароль'):(zh?'发送恢复邮件':'Отправить ссылку')}</button>
      </fieldset></form>
      {error&&<p className="sv-error" role="alert">{error}</p>}{notice&&<p className="sv-success" role="status">{notice}</p>}
      {!user&&<p><Link to="/portal">{zh?'返回登录':'Вернуться ко входу'}</Link></p>}
    </>}
  </section></div>;
}
