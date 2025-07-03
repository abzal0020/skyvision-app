import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryBrothersAgro() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Brothers Agro</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Цена со склада:</strong> 215 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 247 $/т</p>

      <h3>Описание завода</h3>
      <p>Brothers Agro — динамично развивающийся производитель кормовой муки. Своевременная отгрузка и гибкие условия сотрудничества.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Все необходимые сертификаты</li>
        <li>📦 Упаковка: мешки по 50 кг</li>
        <li>🚛 Быстрая логистика до границы</li>
      </ul>

       <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>
      
            {showModal && (
              <RequestModal
                factoryName="IBMO (Magomed)"
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

export default FactoryBrothersAgro;

