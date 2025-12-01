import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryIBMO() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>IBMO (Magomed)</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Производство:</strong> 120 т/день</p>
      <p><strong>Поезда:</strong> 2 в месяц</p>
      <p><strong>Погрузка:</strong> 1 день</p>

      {/* --- ПРАЙС И УСЛОВИЯ --- */}
      <h3 style={{ marginTop: "1.4rem" }}>Прайс и условия</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        <li style={{ marginBottom: "0.6rem", display: "flex", gap: "10px" }}>
          <span style={iconCircle("#e8f5e9")}>
            <svg width="16" height="16" fill="#4caf50" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/>
            </svg>
          </span>
          <div>
            <strong>💰 FСА:</strong> 185 $/т  
          </div>
        </li>

        <li style={{ marginBottom: "0.6rem", display: "flex", gap: "10px" }}>
          <span style={iconCircle("#e3f2fd")}>
            <svg width="16" height="16" fill="#2196f3" viewBox="0 0 24 24">
              <path d="M20 8H17V4H7V8H4C2.9 8 2 8.9 2 10V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V10C22 8.9 21.1 8 20 8ZM9 6H15V8H9V6ZM20 20H4V10H20V20ZM13 12V18H11V12H13Z"/>
            </svg>
          </span>
          <div>
            <strong>🚚 Логистика:</strong> 38 $/т  
          </div>
        </li>

        <li style={{ marginBottom: "0.6rem", display: "flex", gap: "10px" }}>
          <span style={iconCircle("#fff8e1")}>
            <svg width="16" height="16" fill="#ff9800" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
            </svg>
          </span>
          <div>
            <strong>🌐 DAP:</strong> FSA + логистика = <strong>185 + 38 = 223 $/т</strong>
          </div>
        </li>
      </ul>

      {/* --- ОПИСАНИЕ --- */}
      <h3>Описание:</h3>
      <p>
        IBMO — это надёжный завод с быстрой загрузкой и стабильным качеством.
        Работает напрямую с трейдерами и фабриками Китая.
      </p>

      {/* Фото завода */}
      <h3>Фото завода:</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <img src="/images/ibmo1.jpg" alt="Завод IBMO 1" style={imageStyle} />
        <img src="/images/ibmo2.jpg" alt="Завод IBMO 2" style={imageStyle} />
      </div>

      {/* Видео */}
      <h3 style={{ marginTop: "1rem" }}>Видео:</h3>
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
        <iframe
          src="https://www.youtube.com/embed/Видео_ID"
          title="Видео о заводе"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allowFullScreen
        />
      </div>

      {/* Документы */}
      <h3 style={{ marginTop: "1rem" }}>Документы:</h3>
      <ul>
        <li><a href="/docs/sertifikat.pdf" target="_blank" rel="noopener noreferrer">📄 Сертификат соответствия (PDF)</a></li>
        <li><a href="/docs/upakovka.jpg" target="_blank" rel="noopener noreferrer">📦 Пример упаковки (JPG)</a></li>
      </ul>

      {/* Кнопка заявки */}
      <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>

      {showModal && (
        <RequestModal factoryName="IBMO (Magomed)" onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

/* --- Стили --- */

const iconCircle = (bg) => ({
  background: bg,
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

const imageStyle = {
  width: "180px",
  height: "auto",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#000080",
  color: "white",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "6px"
};

export default FactoryIBMO;
