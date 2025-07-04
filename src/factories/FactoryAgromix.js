import React, { useState } from "react";
import RequestModal from "../components/RequestModal";

function FactoryAgromix() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Agromix</h1>
      <p><strong>Город:</strong> Костанай</p>
      <p><strong>Цена со склада:</strong> 210 $/т</p>
      <p><strong>Логистика + план:</strong> 32 $/т</p>
      <p><strong>DAP до границы:</strong> 242 $/т</p>

      <h3>Описание завода</h3>
      <p>Agromix — надёжный поставщик кормовой муки. Отличается стабильными объемами и строгим контролем качества на производстве.</p>

      <h3>Документы и упаковка</h3>
      <ul>
        <li>📄 Сертификат качества и происхождения</li>
        <li>📦 Мешки по 50 кг, поддоны</li>
        <li>🚛 Возможность поставок по графику</li>
      </ul>

       <button onClick={() => setShowModal(true)} style={buttonStyle}>Оставить заявку</button>
      
            {showModal && (
              <RequestModal
                factoryName="Agromix"
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

export default FactoryAgromix;
