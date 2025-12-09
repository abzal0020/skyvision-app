import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import "./RequestModal.css";

const EMAILJS_USER_ID = process.env.REACT_APP_EMAILJS_USER_ID || "5hS_rdfopL-fNCVzY";
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_mfs129i";
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_vixeuwf";
// WhatsApp recipient: international format without plus, e.g. "77471654092"
const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || "77471654092";

/** форматирование телефона для отображения */
function formatPhoneForDisplay(raw) {
  const d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 10) return d;
  const country = d.slice(0, d.length - 10);
  const n = d.slice(-10);
  const p1 = n.slice(0, 3);
  const p2 = n.slice(3, 6);
  const p3 = n.slice(6, 8);
  const p4 = n.slice(8, 10);
  return `+${country} (${p1}) ${p2}-${p3}-${p4}`;
}

const WA_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.52 3.48A11.95 11.95 0 0012.03 0C5.42 0 .17 5.25.17 11.86c0 2.08.55 4.08 1.6 5.86L0 24l6.5-1.68A11.86 11.86 0 0012.03 23.7c6.61 0 11.95-5.25 11.95-11.84 0-3.17-1.24-6.15-3.46-8.38z" fill="#25D366"/>
    <path d="M17.45 14.56c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.38.22-.7.07-.32-.15-1.36-.5-2.59-1.59-.96-.86-1.61-1.92-1.8-2.23-.18-.3-.02-.46.13-.61.13-.12.3-.3.45-.45.15-.15.2-.25.3-.42.1-.17.05-.33-.02-.48-.08-.15-.68-1.63-.94-2.24-.25-.57-.5-.5-.68-.51-.18-.01-.39-.01-.6-.01s-.48.07-.73.33c-.25.26-.96.94-.96 2.3 0 1.36.99 2.68 1.13 2.86.14.17 1.96 3 4.75 4.2 3.3 1.45 3.3 0.97 3.89.9.6-.08 1.78-.72 2.03-1.41.25-.69.25-1.28.18-1.4-.07-.12-.27-.18-.57-.33z" fill="#fff"/>
  </svg>
);

function RequestModal({ factoryName, onClose, t = {} }) {
  const modal = t?.modal || {};
  const [step, setStep] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    wechat: "",
    city: "Костанай",
    cargo: "Кормовая мука",
    station: "Хоргос",
    planGU: "с планом ГУ",
    date: today,
  });

  const [waReason, setWaReason] = useState("Запрос по товару/цене");
  const waReasons = [
    "Запрос по товару/цене",
    "Запрос по логистике",
    "Найти завод",
    "Другое"
  ];

  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      emailjs.init(EMAILJS_USER_ID);
    } catch (err) {
      console.warn("EmailJS init failed:", err);
    }
  }, []);

  const handle = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      setForm((f) => ({ ...f, phone: digits }));
      setErrors((prev) => ({ ...prev, phone: undefined }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.name || !form.name.trim()) e.name = modal.errors?.name || "Введите имя";
      const digits = (form.phone || "").replace(/\D/g, "");
      if (!digits || digits.length < 10) e.phone = modal.errors?.phone || "Введите корректный телефон (минимум 10 цифр)";
    }
    if (s === 1) {
      if (!form.date) e.date = modal.errors?.date || "Выберите дату";
    }
    return e;
  };

  const next = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    const errs = validateStep(2);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setStep(0);
      return;
    }

    setSending(true);
    const resolvedFactory =
      factoryName ||
      modal.factory ||
      document.querySelector('[data-factory-name]')?.dataset?.factoryName ||
      new URLSearchParams(window.location.search).get("factory") ||
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

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );
      console.info("EmailJS: ответ сервера:", response);
      setSending(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose && onClose();
      }, 1800);
    } catch (err) {
      console.error("EmailJS: ошибка при отправке:", err);
      setSending(false);
      setErrors({ submit: "Ошибка отправки. Проверьте соединение или попробуйте позже." });
    }
  };

  const canNext = () => {
    const stepErrors = validateStep(step);
    return Object.keys(stepErrors).length === 0 && !sending;
  };

  // Собираем сообщение для WhatsApp
  const buildWhatsAppMessage = () => {
    const resolvedFactory =
      factoryName ||
      modal.factory ||
      document.querySelector('[data-factory-name]')?.dataset?.factoryName ||
      new URLSearchParams(window.location.search).get("factory") ||
      "";

    const subject = waReason || "";
    const lines = [
      `Тема: ${subject}`,
      `Имя: ${form.name || "-"}`,
      `Телефон: ${formatPhoneForDisplay(form.phone) || "-"}`,
      resolvedFactory ? `Фабрика: ${resolvedFactory}` : null,
      `Город: ${form.city}`,
      `Груз: ${form.cargo}`,
      `Станция: ${form.station}`,
      `План ГУ: ${form.planGU}`,
      `Дата: ${form.date}`,
    ].filter(Boolean);
    return encodeURIComponent(lines.join("\n"));
  };

  const openWhatsApp = () => {
    const msg = buildWhatsAppMessage();
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const modalTitle = modal.title || "Оставить заявку";
  const modalFactory = factoryName || modal.factory || "";

  return (
    <div className="rm-backdrop" onClick={() => { if (!sending) onClose && onClose(); }}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="rm-title">
        <div className="rm-inner">
          <button
            className="rm-close"
            onClick={() => { if (!sending) onClose && onClose(); }}
            aria-label="Закрыть"
          >
            &#10005;
          </button>

          <h2 id="rm-title" className="rm-title">{modalTitle} {modalFactory ? `• ${modalFactory}` : ""}</h2>

          <div className="rm-steps-bar" aria-hidden>
            {(modal.steps || ["Данные", "Дата", "Проверка"]).map((label, i) => (
              <div key={label} className={`rm-step${step === i ? " active" : ""}${step > i ? " done" : ""}`}>
                <span className="rm-step-num">{i + 1}</span>
                <span className="rm-step-label">{label}</span>
              </div>
            ))}
          </div>

          {success ? (
            <div className="rm-success">
              <h3>✅ Заявка отправлена</h3>
              <p>Спасибо! Мы свяжемся с вами в ближайшее время.</p>
              <div style={{ marginTop: 12 }}>
                <button className="rm-btn rm-btn-whatsapp" onClick={openWhatsApp}>
                  {WA_ICON} <span>Написать в WhatsApp</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <form className="rm-form" onSubmit={(e) => { e.preventDefault(); next(); }}>
                  <div className="rm-field">
                    <input
                      name="name"
                      value={form.name}
                      onChange={handle}
                      placeholder={modal.name || "Имя"}
                      className={`rm-input ${errors.name ? "invalid" : ""}`}
                      autoFocus
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "err-name" : undefined}
                    />
                    {errors.name && <div id="err-name" className="rm-error">{errors.name}</div>}
                  </div>

                  <div className="rm-field">
                    <input
                      name="phone"
                      value={formatPhoneForDisplay(form.phone)}
                      onChange={handle}
                      placeholder={modal.phone || "Телефон"}
                      className={`rm-input ${errors.phone ? "invalid" : ""}`}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "err-phone" : undefined}
                    />
                    {errors.phone && <div id="err-phone" className="rm-error">{errors.phone}</div>}
                  </div>

                  <div className="rm-field">
                    <input
                      name="wechat"
                      value={form.wechat}
                      onChange={handle}
                      placeholder={modal.wechat || "WeChat"}
                      className="rm-input"
                    />
                  </div>

                  <div className="rm-field">
                    <select name="city" value={form.city} onChange={handle} className="rm-input">
                      <option>Костанай</option>
                      <option>Рудный</option>
                    </select>
                  </div>

                  <div className="rm-field">
                    <select name="cargo" value={form.cargo} onChange={handle} className="rm-input">
                      <option>Кормовая мука</option>
                      <option>Ячмень</option>
                    </select>
                  </div>

                  <div className="rm-field">
                    <select name="station" value={form.station} onChange={handle} className="rm-input">
                      <option>Хоргос</option>
                      <option>Алтынколь</option>
                    </select>
                  </div>

                  <div className="rm-field">
                    <select name="planGU" value={form.planGU} onChange={handle} className="rm-input">
                      <option>с планом ГУ</option>
                      <option>без плана</option>
                    </select>
                  </div>
                </form>
              )}

              {step === 1 && (
                <div className="rm-form">
                  <label className="rm-label">{modal.date || "Дата"}</label>
                  <input
                    type="date"
                    name="date"
                    min={today}
                    value={form.date}
                    onChange={handle}
                    className={`rm-input ${errors.date ? "invalid" : ""}`}
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? "err-date" : undefined}
                  />
                  {errors.date && <div id="err-date" className="rm-error">{errors.date}</div>}
                </div>
              )}

              {step === 2 && (
                <div className="rm-review" aria-live="polite">
                  {Object.entries({
                    [modal.name || "Имя"]: form.name,
                    [modal.phone || "Телефон"]: formatPhoneForDisplay(form.phone),
                    [modal.wechat || "WeChat"]: form.wechat,
                    [modal.city || "Город"]: form.city,
                    [modal.cargo || "Груз"]: form.cargo,
                    [modal.station || "Станция"]: form.station,
                    [modal.planGU || "План ГУ"]: form.planGU,
                    [modal.date || "Дата"]: form.date,
                  }).map(([k, v]) => (
                    <p key={k}><strong>{k}:</strong> {v}</p>
                  ))}
                  {errors.submit && <div className="rm-error" role="alert">{errors.submit}</div>}

                  <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ fontSize: "0.9rem", color: "#444", marginRight: 6 }}>Цель сообщения:</label>
                    <select
                      value={waReason}
                      onChange={(e) => setWaReason(e.target.value)}
                      className="rm-input"
                      style={{ width: "auto", minWidth: 200 }}
                      aria-label="Цель сообщения в WhatsApp"
                    >
                      {waReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={submit}
                      disabled={sending}
                      className="rm-btn rm-btn-blue"
                      type="button"
                    >
                      {sending ? "Отправка..." : (modal.submit || "Отправить")}
                    </button>

                    <button
                      onClick={openWhatsApp}
                      disabled={sending}
                      className="rm-btn rm-btn-whatsapp"
                      type="button"
                    >
                      {WA_ICON} <span>Написать в WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="rm-btn-row" style={{ marginTop: 12 }}>
                <button
                  onClick={() => { if (!sending) onClose && onClose(); }}
                  className="rm-btn rm-btn-grey"
                  type="button"
                  disabled={sending}
                >
                  {modal.cancel || "Отмена"}
                </button>

                {step > 0 && (
                  <button
                    onClick={back}
                    className="rm-btn rm-btn-grey"
                    type="button"
                    disabled={sending}
                  >
                    {modal.back || "Назад"}
                  </button>
                )}

                {step < 2 && (
                  <button
                    onClick={next}
                    disabled={!canNext()}
                    className="rm-btn rm-btn-blue"
                    type="button"
                  >
                    {modal.next || "Далее"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestModal;
