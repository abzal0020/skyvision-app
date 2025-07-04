import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryRomana() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Romana</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Цена со склада:</strong> 215 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 247 $/т</p>

      <h3>Описание завода</h3>
      <p>Romana — один из известных производителей в регионе. Сотрудничает с экспортёрами, гарантирует стабильность качества продукции и оформление всех документов.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Сертификат происхождения</li>
        <li>📦 Мешки по 50 кг, на паллетах</li>
        <li>🚛 Удобная локация и быстрая логистика</li>
      </ul>

     <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>
     
           {showModal && (
             <RequestModal
               factoryName="Romana"
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

export default FactoryRomana;
