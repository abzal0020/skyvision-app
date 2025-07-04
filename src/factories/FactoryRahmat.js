import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryRahmat() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Rahmat</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Цена со склада:</strong> 215 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 247 $/т</p>

      <h3>Описание завода</h3>
      <p>Rahmat — надёжный поставщик, работает с постоянными клиентами из Китая. Отличается стабильностью и точностью в логистике.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Все необходимые экспортные документы</li>
        <li>📦 Мешки по 50 кг или биг-бэги</li>
        <li>🚛 Быстрая отгрузка после оплаты</li>
      </ul>

    <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>
   
         {showModal && (
           <RequestModal
             factoryName="Rahmat"
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

export default FactoryRahmat;
