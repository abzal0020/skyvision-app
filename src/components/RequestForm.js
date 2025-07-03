// src/components/RequestForm.js
import React, { useState } from "react";

function RequestForm({ factoryName }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    comment: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика отправки (можно на почту, Telegram, или в консоль)
    console.log("Заявка отправлена:", { ...formData, factory: factoryName });
    alert("Заявка отправлена!");
    setFormData({ name: "", phone: "", comment: "" });
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
      <button type="submit" style={buttonStyle}>Отправить</button>
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
