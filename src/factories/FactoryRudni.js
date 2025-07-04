import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryRudni() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Rudni (Marat)</h1>
      <p><strong>Город:</strong> Рудный</p>
      <p><strong>Цена со склада:</strong> 220 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 252 $/т</p>

      <h3>Описание завода</h3>
      <p>Завод в Рудном под управлением Marat — проверенный поставщик с хорошей репутацией и стабильными отгрузками. Продукция соответствует требованиям китайских импортеров.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Сертификаты качества</li>
        <li>📦 Мешки по 50 кг</li>
        <li>🚛 Возможность быстрой загрузки</li>
      </ul>

       <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>
      
            {showModal && (
              <RequestModal
                factoryName="Organicum Bio"
                onClose={() => setShowModal(false)}
              />
            )}
    </div>
  );
}

const buttonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#000080",
  color: "white",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
};

export default FactoryRudni;
