import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import "./RequestModal.css";

const EMAILJS_USER_ID = process.env.REACT_APP_EMAILJS_USER_ID || "5hS_rdfopL-fNCVzY";
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_mfs129i";
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_vixeuwf";

function RequestModal({ factoryName, onClose, t = {} }) {
  const modal = t?.modal || {};
  const [step, setStep] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name:    "",
    phone:   "",
    wechat:  "",
    city:    "Костанай",
    cargo:   "Кормовая мука",
    station: "Хоргос",
    planGU:  "с планом ГУ",
    date:    today,
  });

  const [sending, setSending] = useState(false);

  useEffect(() => {
    console.info("RequestModal mounted for factory:", factoryName);
    try { emailjs.init(EMAILJS_USER_ID); } catch (err) { console.warn("EmailJS init failed:", err); }
    return () => console.info("RequestModal unmounted for factory:", factoryName);
  }, [factoryName]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const next   = () => setStep(s => s + 1);
  const back   = () => setStep(s => s - 1);

  const submit = async () => {
    if (step !== 2) return;

    const resolvedFactory =
      factoryName ||
      modal.factory ||
      document.querySelector('[data-factory-name]')?.dataset?.factoryName ||
      new URLSearchParams(window.location.search).get('factory') ||
      "";

    const templateParams = {
      name: form.name || "",
      phone: form.phone || "",
      wechat: form.wechat || "",
      city: form.city || "",
      cargo: form.cargo || "",
      station: form.station || "",
      planGU: form.planGU || "",
      date: form.date || "",
      factory: resolvedFactory,
      to_email: process.env.REACT_APP_RECIPIENT_EMAIL || "abzalkojaixan3@gmail.com",
    };

    console.info("EmailJS: отправляю шаблон с параметрами:", templateParams);
    setSending(true);

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );
      console.info("EmailJS: ответ сервера:", response);
      alert("✅ Заявка отправлена! Скоро свяжемся.");
      setSending(false);
      console.info("RequestModal calling onClose()");
      onClose && onClose();
    } catch (err) {
      console.error("EmailJS: ошибка при отправке:", err);
      alert("Ошибка отправки, проверьте консоль и Network (api.emailjs.com).");
      setSending(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.name && form.phone;
    if (step === 1) return !!form.date;
    return true;
  };

  const modalTitle = modal.title || "Оставить заявку";
  const modalFactory = factoryName || modal.factory || "";

  // ВАЖНО: снимаем onClick с backdrop, чтобы клик по фону НЕ закрывал модал (временно)
  return (
    <div className="rm-backdrop">
      <div className="rm-modal" onClick={e => e.stopPropagation()}>
        <button className="rm-close" onClick={() => { console.info("Close button clicked"); onClose && onClose(); }}>&#10005;</button>
        <h2 className="rm-title">{modalTitle} • {modalFactory}</h2>

        <div className="rm-steps-bar">
          {(modal.steps || ['Данные','Дата','Проверка']).map((label, i) => (
            <div key={label} className={`rm-step${step === i ? " active" : ""}${step > i ? " done" : ""}`}>
              <span className="rm-step-num">{i + 1}</span>
              <span className="rm-step-label">{label}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <form className="rm-form" onSubmit={e => { e.preventDefault(); next(); }}>
            <input name="name" value={form.name} onChange={handle} placeholder={modal.name || 'Имя'} className="rm-input" autoFocus />
            <input name="phone" value={form.phone} onChange={handle} placeholder={modal.phone || 'Телефон'} className="rm-input" />
            <input name="wechat" value={form.wechat} onChange={handle} placeholder={modal.wechat || 'WeChat'} className="rm-input" />
            <select name="city" value={form.city} onChange={handle} className="rm-input">
              <option>Костанай</option><option>Рудный</option>
            </select>
            <select name="cargo" value={form.cargo} onChange={handle} className="rm-input">
              <option>Кормовая мука</option><option>Ячмень</option>
            </select>
            <select name="station" value={form.station} onChange={handle} className="rm-input">
              <option>Хоргос</option><option>Алтынколь</option>
            </select>
            <select name="planGU" value={form.planGU} onChange={handle} className="rm-input">
              <option>с планом ГУ</option><option>без плана</option>
            </select>
          </form>
        )}

        {step === 1 && (
          <div className="rm-form">
            <label className="rm-label">{modal.date || 'Дата'}</label>
            <input type="date" name="date" min={today} value={form.date} onChange={handle} className="rm-input" />
          </div>
        )}

        {step === 2 && (
          <div className="rm-review">
            {Object.entries({
              [modal.name || 'Имя']: form.name,
              [modal.phone || 'Телефон']: form.phone,
              [modal.wechat || 'WeChat']: form.wechat,
              [modal.city || 'Город']: form.city,
              [modal.cargo || 'Груз']: form.cargo,
              [modal.station || 'Станция']: form.station,
              [modal.planGU || 'План ГУ']: form.planGU,
              [modal.date || 'Дата']: form.date,
            }).map(([k,v])=> <p key={k}><strong>{k}:</strong> {v}</p>)}
          </div>
        )}

        <div className="rm-btn-row">
          <button onClick={() => { console.info("Cancel clicked"); onClose && onClose(); }} className="rm-btn rm-btn-grey" type="button">{modal.cancel || 'Отмена'}</button>
          {step>0 && <button onClick={back} className="rm-btn rm-btn-grey" type="button">{modal.back || 'Назад'}</button>}
          {step<2 && <button onClick={next} disabled={!canNext() || sending} className="rm-btn rm-btn-blue" type="button">{modal.next || 'Далее'}</button>}
          {step===2 && <button onClick={submit} disabled={sending} className="rm-btn rm-btn-blue" type="button">{sending ? "Отправка..." : (modal.submit || 'Отправить')}</button>}
        </div>
      </div>
    </div>
  );
}

export default RequestModal;
