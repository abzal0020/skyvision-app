import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryMibeko() {
   const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mibeko</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Цена со склада:</strong> 215 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 247 $/т</p>

      <h3>Описание завода</h3>
      <p>Mibeko — это стабильный поставщик с гарантированным качеством кормовой муки. Работают с крупными китайскими партнёрами, обеспечивая регулярные отгрузки и полное сопровождение документации.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Сертификат качества</li>
        <li>📦 Мешки по 50 кг</li>
        <li>🚛 Быстрая отгрузка в течение 1-2 дней</li>
      </ul>

     <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>
     
           {showModal && (
             <RequestModal
               factoryName="Mibeko"
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

export default FactoryMibeko;
