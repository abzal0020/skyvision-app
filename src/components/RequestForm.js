import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";

function RequestForm({ factoryName }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    comment: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      emailjs.init("5hS_rdfopL-fNCVzY");
    } catch (err) {}
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
      user_name: formData.name,
      user_phone: formData.phone,
      message: formData.comment,
      factory: factoryName || "",
      to_email: "abzalkojaixan3@gmail.com",
    };

    console.info("RequestForm: отправка emailjs с", templateParams);
    setSending(true);

    emailjs
      .send("service_mfs129i", "template_vixeuwf", templateParams, "5hS_rdfopL-fNCVzY")
      .then((res) => {
        console.info("RequestForm: emailjs ответ:", res);
        alert("Заявка отправлена!");
        setFormData({ name: "", phone: "", comment: "" });
        setSending(false);
      })
      .catch((err) => {
        console.error("RequestForm: ошибка отправки:", err);
        alert("Ошибка отправки, попробуйте позже.");
        setSending(false);
      });
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