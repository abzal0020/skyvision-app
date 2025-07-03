import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryAgrofood() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Agrofood Export</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Цена со склада:</strong> 225 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 257 $/т</p>

      <h3>Описание завода</h3>
      <p>Agrofood Export специализируется на внешнеэкономических поставках муки и кормов, работает напрямую с зарубежными партнёрами.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Фитосанитарные и ветеринарные сертификаты</li>
        <li>📦 Стандартная упаковка 50 кг</li>
        <li>🚛 Быстрая обработка и отправка</li>
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

export default FactoryAgrofood;
