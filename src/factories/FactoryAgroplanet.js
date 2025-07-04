import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryAgroplanet() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Agroplanet</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Цена со склада:</strong> 217 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 249 $/т</p>

      <h3>Описание завода</h3>
      <p>Agroplanet — современное предприятие, ориентированное на экспорт. Производит кормовую муку высокого качества с стабильной отгрузкой и оформлением всей необходимой документации.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Ветеринарные и фитосанитарные документы</li>
        <li>📦 Упаковка: мешки по 50 кг</li>
        <li>🚛 Готовность к оперативной загрузке</li>
      </ul>

 <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>

      {showModal && (
        <RequestModal
          factoryName="Agroplanet"
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

export default FactoryAgroplanet;
