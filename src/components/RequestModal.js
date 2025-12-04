import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import "./RequestModal.css";

function RequestModal({ factoryName, onClose, t }) {
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

  // Инициализация (если нужно, замените ID на ваш)
  useEffect(() => {
    try {
      emailjs.init("5hS_rdfopL-fNCVzY");
    } catch (err) {
      // ignore
    }
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const next   = () => setStep(s => s + 1);
  const back   = () => setStep(s => s - 1);

  const submit = () => {
    const templateParams = {
      // Эти ключи должны совпадать с переменными шаблона в EmailJS
      user_name: form.name,
      user_phone: form.phone,
      user_wechat: form.wechat,
      city: form.city,
      cargo: form.cargo,
      station: form.station,
      planGU: form.planGU,
      date: form.date,
      factory: factoryName || "",
      // Явно передаём получателя; в шаблоне EmailJS используйте {{to_email}} в поле "To"
      to_email: "abzalkojaixan3@gmail.com",
    };

    console.info("EmailJS: отправляю шаблон с параметрами:", templateParams);
    setSending(true);

    emailjs
      .send(
        "service_mfs129i",
        "template_vixeuwf",
        templateParams,
        "5hS_rdfopL-fNCVzY" // user id, можно убрать если вы инициализируете отдельно
      )
      .then((response) => {
        console.info("EmailJS: ответ сервера:", response);
        alert("✅ Заявка отправлена! Скоро свяжемся.");
        setSending(false);
        onClose();
      })
      .catch((err) => {
        console.error("EmailJS: ошибка при отправке:", err);
        alert("Ошибка отправки, попробуйте позже. Проверьте консоль для деталей.");
        setSending(false);
      });
  };

  const canNext = () => {
    if (step === 0) return form.name && form.phone;
    if (step === 1) return !!form.date;
    return true;
  };

  return (
    <div className="rm-backdrop" onClick={onClose}>
      <div className="rm-modal" onClick={e => e.stopPropagation()}> 
        <button className="rm-close" onClick={onClose}>&#10005;</button>
        <h2 className="rm-title">{t.modal.title} • {factoryName || t.modal.factory}</h2>

        <div className="rm-steps-bar">
          {t.modal.steps.map((label, i) => (
            <div
              key={label}
              className={`rm-step${step === i ? " active" : ""}${step > i ? " done" : ""}`}
            >
              <span className="rm-step-num">{i + 1}</span>
              <span className="rm-step-label">{label}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <form className="rm-form" onSubmit={e => {e.preventDefault(); next();}}>
            <input name="name"    value={form.name}    onChange={handle} placeholder={t.modal.name}    className="rm-input" autoFocus />
            <input name="phone"   value={form.phone}   onChange={handle} placeholder={t.modal.phone}   className="rm-input" />
            <input name="wechat"  value={form.wechat}  onChange={handle} placeholder={t.modal.wechat}  className="rm-input" />
            <select name="city"   value={form.city}    onChange={handle} className="rm-input">
              <option>Костанай</option><option>Рудный</option>
            </select>
            <select name="cargo"  value={form.cargo}   onChange={handle} className="rm-input">
              <option>Кормовая мука</option><option>Ячмень</option>
            </select>
            <select name="station" value={form.station} onChange={handle} className="rm-input">
              <option>Хоргос</option><option>Алтынколь</option>
            </select>
            <select name="planGU" value={form.planGU}  onChange={handle} className="rm-input">
              <option>с планом ГУ</option><option>без плана</option>
            </select>
          </form>
        )}

        {step === 1 && (
          <div className="rm-form">
            <label className="rm-label">{t.modal.date}</label>
            <input type="date" name="date" min={today} value={form.date} onChange={handle} className="rm-input"/>
          </div>
        )}

        {step === 2 && (
          <div className="rm-review">
            {Object.entries({
              [t.modal.name]: form.name,
              [t.modal.phone]: form.phone,
              [t.modal.wechat]: form.wechat,
              [t.modal.city]: form.city,
              [t.modal.cargo]: form.cargo,
              [t.modal.station]: form.station,
              [t.modal.planGU]: form.planGU,
              [t.modal.date]: form.date,
            }).map(([k,v])=> <p key={k}><strong>{k}:</strong> {v}</p>)}
          </div>
        )}

        <div className="rm-btn-row">
          <button onClick={onClose} className="rm-btn rm-btn-grey" type="button">{t.modal.cancel}</button>
          {step>0   && <button onClick={back}   className="rm-btn rm-btn-grey" type="button">{t.modal.back}</button>}
          {step<2   && <button onClick={next}   disabled={!canNext()} className="rm-btn rm-btn-blue" type="button">{t.modal.next}</button>}
          {step===2 && <button onClick={submit} disabled={sending} className="rm-btn rm-btn-blue" type="button">{sending ? "Отправка..." : t.modal.submit}</button>}
        </div>
      </div>
    </div>
  );
}

export default RequestModal;