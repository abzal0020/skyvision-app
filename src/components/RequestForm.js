import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";

const EMAILJS_USER_ID = process.env.REACT_APP_EMAILJS_USER_ID || "5hS_rdfopL-fNCVzY";
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_mfs129i";
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_vixeuwf";

function RequestForm({ factoryName }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    comment: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      emailjs.init(EMAILJS_USER_ID);
    } catch (err) {
      console.warn("EmailJS init failed:", err);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const templateParams = {
      user_name: formData.name,
      user_phone: formData.phone,
      message: formData.comment,
      factory: factoryName || "",
      to_email: process.env.REACT_APP_RECIPIENT_EMAIL || "abzalkojaixan3@gmail.com",
    };

    console.info("RequestForm: отправка emailjs с", templateParams);
    setSending(true);

    try {
      const res = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_USER_ID);
      console.info("RequestForm: emailjs ответ:", res);
      alert("✅ Заявка отправлена!");
      setFormData({ name: "", phone: "", comment: "" });
      setSending(false);
    } catch (err) {
      console.error("RequestForm: ошибка отправки:", err);
      let msg = "Ошибка отправки";
      if (err && err.text) msg = err.text;
      else if (err && err.status) msg = `status: ${err.status}`;
      else if (err && err.message) msg = err.message;
      else {
        try { msg = JSON.stringify(err); } catch(e){ msg = String(err); }
      }
      alert(`Ошибка отправки: ${msg}. Проверьте консоль разработчика (F12) для деталей.`);
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3>Оставить заявку на завод: {factoryName}</h3>
      <input
        type="text"
        name="name"
        placeholder="Ваше имя"
        value={formData.name}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      <input
        type="tel"
        name="phone"
        placeholder="Телефон / WhatsApp"
        value={formData.phone}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      <textarea
        name="comment"
        placeholder="Комментарий (опционально)"
        value={formData.comment}
        onChange={handleChange}
        style={{ ...inputStyle, height: "80px" }}
      />
      <button type="submit" disabled={sending} style={buttonStyle}>
        {sending ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "20px",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
};

const buttonStyle = {
  backgroundColor: "#000080",
  color: "white",
  padding: "10px",
  fontSize: "16px",
  border: "none",
  cursor: "pointer",
};

export default RequestForm;
