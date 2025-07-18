import React, { useState } from "react";
import emailjs from "emailjs-com";
import "./RequestModal.css"; // Добавь этот импорт

function RequestModal({ factoryName, onClose }) {
  const [step, setStep] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name:    "",
    phone:   "",
    wechat:  "",
    city:    "Костанай",
    cargo:   "Кормовая мука",
    station: "Хоргос",
    planGU:  "Нет",
    date:    today,
  });

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const next   = () => setStep(s => s + 1);
  const back   = () => setStep(s => s - 1);

  const submit = () => {
    const payload = { ...form, factory: factoryName };

    emailjs
      .send(
        "service_mfs129i",
        "template_vixeuwf",
        payload,
        "5hS_rdfopL-fNCVzY"
      )
      .then(() => {
        alert("✅ Заявка отправлена! Скоро свяжемся.");
        onClose();
      })
      .catch(() => alert("Ошибка отправки, попробуйте позже."));
  };

  const canNext = () => {
    if (step === 0) return form.name && form.phone;
    if (step === 1) return !!form.date;
    return true;
  };

  const steps = ["Данные", "Дата", "Проверка"];
  return (
    <div className="rm-backdrop" onClick={onClose}>
      <div className="rm-modal" onClick={e => e.stopPropagation()}>
        <button className="rm-close" onClick={onClose}>&#10005;</button>
        <h2 className="rm-title">Заявка • {factoryName}</h2>

        <div className="rm-steps-bar">
          {steps.map((t, i) => (
            <div
              key={t}
              className={`rm-step${step === i ? " active" : ""}${step > i ? " done" : ""}`}
            >
              <span className="rm-step-num">{i + 1}</span>
              <span className="rm-step-label">{t}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <form className="rm-form" onSubmit={e => {e.preventDefault(); next();}}>
            <input name="name"    value={form.name}    onChange={handle} placeholder="Имя"       className="rm-input" autoFocus />
            <input name="phone"   value={form.phone}   onChange={handle} placeholder="Телефон"   className="rm-input" />
            <input name="wechat"  value={form.wechat}  onChange={handle} placeholder="WeChat"    className="rm-input" />
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
            <label className="rm-label">Дата погрузки</label>
            <input type="date" name="date" min={today} value={form.date} onChange={handle} className="rm-input"/>
          </div>
        )}

        {step === 2 && (
          <div className="rm-review">
            {Object.entries({
              Имя: form.name, Телефон: form.phone, WeChat: form.wechat,
              Город: form.city, Груз: form.cargo, Станция: form.station,
              "План ГУ": form.planGU, "Дата погрузки": form.date,
            }).map(([k,v])=> <p key={k}><strong>{k}:</strong> {v}</p>)}
          </div>
        )}

        <div className="rm-btn-row">
          <button onClick={onClose} className="rm-btn rm-btn-grey">Отмена</button>
          {step>0   && <button onClick={back}   className="rm-btn rm-btn-grey">Назад</button>}
          {step<2   && <button onClick={next}   disabled={!canNext()} className="rm-btn rm-btn-blue">{step === 1 ? "Далее" : "Далее"}</button>}
          {step===2 && <button onClick={submit} className="rm-btn rm-btn-blue">Отправить</button>}
        </div>
      </div>
    </div>
  );
}

export default RequestModal;