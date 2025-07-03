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
