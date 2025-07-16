/* src/Prices.js */
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  FaSort, FaSortUp, FaSortDown, FaStar, FaCity, 
  FaIndustry, FaWarehouse, FaShippingFast, FaDollarSign, 
  FaChartLine, FaPhone, FaBox, FaMoneyBillWave, FaShoppingCart
} from "react-icons/fa";

const logistics = 32;
const rawData = [
  { city: "Костанай", factory: "Agrodan KsT", price: 215, rating: 4.3, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Mibeko", price: 215, rating: 4.1, minOrder: 25, payment: "30% предоплата" },
  { city: "Костанай", factory: "Khlebny Dom", price: 215, rating: 4.7, minOrder: 15, payment: "100% предоплата" },
  { city: "Костанай", factory: "Rahmat", price: 215, rating: 4.0, minOrder: 20, payment: "70% предоплата" },
  { city: "Костанай", factory: "IBMO (Magomed)", price: 210, rating: 3.8, minOrder: 30, payment: "50% предоплата" },
  { city: "Рудный", factory: "Rudni (Marat)", price: 220, rating: 4.9, minOrder: 15, payment: "30% предоплата" },
  { city: "Костанай", factory: "Brothers Agro", price: 215, rating: 4.4, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Agroplanet", price: 217, rating: 4.5, minOrder: 25, payment: "60% предоплата" },
  { city: "Костанай", factory: "Romana", price: 215, rating: 4.5, minOrder: 20, payment: "40% предоплата" },
  { city: "Костанай", factory: "Best Kostanai (malik)", price: 215, rating: 4.2, minOrder: 30, payment: "50% предоплата" },
  { city: "Костанай", factory: "Vadisa m", price: 215, rating: 4.4, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Harvest (Azamat)", price: 225, rating: 4.7, minOrder: 15, payment: "100% предоплата" },
  { city: "Костанай", factory: "Agromix", price: 210, rating: 4.7, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Shahristan agro", price: 225, rating: 4.0, minOrder: 25, payment: "70% предоплата" },
  { city: "Костанай", factory: "Agrofood export", price: 225, rating: 4.8, minOrder: 20, payment: "50% предоплата" },
];

const links = {
  "Agrodan KsT": "/factory/agrodan",
  "Mibeko": "/factory/mibeko",
  "Khlebny Dom": "/factory/khlebny-dom",
  "Rahmat": "/factory/rahmat",
  "IBMO (Magomed)": "/factory/ibmo",
  "Rudni (Marat)": "/factory/rudni",
  "Brothers Agro": "/factory/brothers-agro",
  "Agroplanet": "/factory/agroplanet",
  "Romana": "/factory/romana",
  "Best Kostanai (malik)": "/factory/bestkostanai",
  "Vadisa m": "/factory/vadisa",
  "Harvest (Azamat)": "/factory/harvest",
  "Agromix": "/factory/agromix",
  "Shahristan agro": "/factory/shahristan",
  "Agrofood export": "/factory/agrofood",
};

export default function Prices() {
  const [filterCity, setCity] = useState("Все");
  const [sort, setSort] = useState({ field: "dap", asc: true });
  const [expandedRow, setExpandedRow] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState("");

  const filtered = useMemo(
    () => rawData.filter(r => filterCity === "Все" || r.city === filterCity),
    [filterCity]
  );

  const sorted = useMemo(() => {
    const dir = sort.asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = sort.field === "dap" ? a.price + logistics : 
                sort.field === "rating" ? a.rating : a.price;
      const bv = sort.field === "dap" ? b.price + logistics : 
                sort.field === "rating" ? b.rating : b.price;
      return av > bv ? dir : -dir;
    });
  }, [filtered, sort]);

  const bestDAP = Math.min(...rawData.map(r => r.price + logistics));

  const sortIcon = (field) =>
    sort.field !== field ? <FaSort /> : sort.asc ? <FaSortUp /> : <FaSortDown />;

  const toggleSort = (field) =>
    setSort(prev => prev.field === field ? { field, asc: !prev.asc } : { field, asc: true });

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleOrderClick = (factoryName) => {
    setSelectedFactory(factoryName);
    setShowOrderModal(true);
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Актуальные цены на кормовую муку</h1>
        <p style={subtitleStyle}>DAP до границы с учетом логистики</p>
      </div>

      <div style={cardStyle}>
        <div style={controlsStyle}>
          <div style={filterGroupStyle}>
            <label style={labelStyle}><FaCity /> Город:</label>
            <div style={selectWrapperStyle}>
              <select 
                style={selectStyle} 
                value={filterCity} 
                onChange={e => setCity(e.target.value)}
              >
                <option value="Все">Все города</option>
                {[...new Set(rawData.map(r => r.city))].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={filterGroupStyle}>
            <label style={labelStyle}><FaChartLine /> Сортировка:</label>
            <div style={selectWrapperStyle}>
              <select
                style={selectStyle}
                value={sort.field}
                onChange={e => setSort(prev => ({...prev, field: e.target.value}))}
              >
                <option value="dap">DAP цена</option>
                <option value="price">Складская цена</option>
                <option value="rating">Рейтинг</option>
              </select>
            </div>
          </div>
        </div>

        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => toggleSort("city")}>
                  <div style={thContentStyle}>
                    <FaCity /> Город {sortIcon("city")}
                  </div>
                </th>
                <th style={thStyle}>
                  <div style={thContentStyle}>
                    <FaIndustry /> Завод
                  </div>
                </th>
                <th style={thStyle} onClick={() => toggleSort("price")}>
                  <div style={thContentStyle}>
                    <FaWarehouse /> Склад $ {sortIcon("price")}
                  </div>
                </th>
                <th style={thStyle}>
                  <div style={thContentStyle}>
                    <FaShippingFast /> Логистика
                  </div>
                </th>
                <th style={{...thStyle, background: "#2c3e50"}} onClick={() => toggleSort("dap")}>
                  <div style={{...thContentStyle, color: "white"}}>
                    <FaDollarSign /> DAP $ {sortIcon("dap")}
                  </div>
                </th>
                <th style={thStyle} onClick={() => toggleSort("rating")}>
                  <div style={thContentStyle}>
                    <FaStar /> Рейтинг {sortIcon("rating")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const dap = r.price + logistics;
                const best = dap === bestDAP;
                const isExpanded = expandedRow === i;
                
                return (
                  <React.Fragment key={r.factory}>
                    <tr 
                      style={{ 
                        ...trStyle, 
                        ...(i % 2 ? trAltStyle : {}),
                        ...(isExpanded ? expandedTrStyle : {})
                      }}
                      onClick={() => toggleRow(i)}
                    >
                      <td style={tdStyle}>{r.city}</td>
                      <td style={tdStyle}>
                        {links[r.factory] ? (
                          <Link to={links[r.factory]} style={linkStyle}>
                            {r.factory}
                          </Link>
                        ) : (
                          r.factory
                        )}
                      </td>
                      <td style={tdStyle}>{r.price}</td>
                      <td style={tdStyle}>{logistics}</td>
                      <td style={{ 
                        ...tdStyle, 
                        fontWeight: 600, 
                        color: best ? "#27ae60" : "#2c3e50",
                        position: "relative"
                      }}>
                        {dap} 
                        {best && (
                          <div style={bestBadgeStyle}>
                            <FaStar /> Лучшая цена
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={ratingStyle}>
                          <div style={ratingBarStyle(r.rating)} />
                          <span>{r.rating.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr style={detailsRowStyle}>
                        <td colSpan="6" style={detailsCellStyle}>
                          <div style={detailsContentStyle}>
                            <div>
                              <strong><FaPhone /> Контакты:</strong> +7 (XXX) XXX-XX-XX
                            </div>
                            <div>
                              <strong><FaBox /> Мин. партия:</strong> {r.minOrder} тонн
                            </div>
                            <div>
                              <strong><FaMoneyBillWave /> Оплата:</strong> {r.payment}
                            </div>
                            <button 
                              style={orderButtonStyle}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderClick(r.factory);
                              }}
                            >
                              <FaShoppingCart /> Заказать у этого поставщика
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={summaryStyle}>
          <div style={summaryItemStyle}>
            <FaStar style={{ color: "#f39c12", marginRight: "0.5rem" }} />
            <strong>Лучшая DAP цена:</strong> {bestDAP} $
          </div>
          <div style={summaryItemStyle}>
            <FaChartLine style={{ color: "#3498db", marginRight: "0.5rem" }} />
            <strong>Средняя цена:</strong> 
            {(rawData.reduce((sum, r) => sum + r.price, 0) / rawData.length + logistics).toFixed(1)} $
          </div>
        </div>
      </div>

      {/* Модальное окно заказа */}
      {showOrderModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3 style={modalTitleStyle}>
              Заказ у поставщика: {selectedFactory}
            </h3>
            
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Ваше имя:</label>
              <input type="text" style={inputStyle} />
            </div>
            
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Телефон:</label>
              <input type="tel" style={inputStyle} />
            </div>
            
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Email:</label>
              <input type="email" style={inputStyle} />
            </div>
            
            <div style={formGroupStyle}>
              <label style={formLabelStyle}>Количество (тонн):</label>
              <input type="number" style={inputStyle} min="10" />
            </div>
            
            <div style={buttonGroupStyle}>
              <button 
                style={cancelButtonStyle}
                onClick={() => setShowOrderModal(false)}
              >
                Отмена
              </button>
              <button 
                style={submitButtonStyle}
                onClick={() => {
                  alert(`Заказ на ${selectedFactory} отправлен!`);
                  setShowOrderModal(false);
                }}
              >
                Отправить заявку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Стили
const pageStyle = {
  background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
  minHeight: "100vh",
  padding: "2rem 1rem",
  fontFamily: "'Roboto', sans-serif",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "2rem",
  maxWidth: "800px",
  margin: "0 auto 2rem",
};

const titleStyle = {
  fontSize: "2.2rem",
  color: "#2c3e50",
  marginBottom: "0.5rem",
};

const subtitleStyle = {
  fontSize: "1.2rem",
  color: "#7f8c8d",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  padding: "2rem",
  maxWidth: "1200px",
  margin: "0 auto",
};

const controlsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5rem",
  marginBottom: "2rem",
};

const filterGroupStyle = {
  flex: "1",
  minWidth: "250px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  marginBottom: "0.5rem",
  color: "#2c3e50",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const selectWrapperStyle = {
  position: "relative",
};

const selectStyle = {
  width: "100%",
  padding: "0.8rem 1rem",
  borderRadius: "8px",
  border: "1px solid #ddd",
  backgroundColor: "#fff",
  fontSize: "1rem",
  appearance: "none",
  cursor: "pointer",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  transition: "all 0.3s",
  ":focus": {
    borderColor: "#3498db",
    boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.2)",
    outline: "none",
  },
};

const tableContainerStyle = {
  overflowX: "auto",
  borderRadius: "8px",
  border: "1px solid #eee",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "800px",
};

const thStyle = {
  background: "#f8f9fa",
  padding: "1rem",
  textAlign: "left",
  fontWeight: "600",
  color: "#7f8c8d",
  borderBottom: "2px solid #eee",
  cursor: "pointer",
  transition: "background 0.3s",
  ":hover": {
    background: "#e9ecef",
  },
};

const thContentStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const trStyle = {
  borderBottom: "1px solid #eee",
  cursor: "pointer",
  transition: "background 0.3s",
  ":hover": {
    background: "#f8f9fa",
  },
};

const trAltStyle = {
  background: "#f8f9fa",
};

const expandedTrStyle = {
  background: "#e3f2fd",
};

const tdStyle = {
  padding: "1rem",
};

const linkStyle = {
  color: "#3498db",
  fontWeight: "500",
  textDecoration: "none",
  transition: "color 0.3s",
  ":hover": {
    color: "#2980b9",
    textDecoration: "underline",
  },
};

const bestBadgeStyle = {
  position: "absolute",
  top: "-10px",
  right: "0",
  background: "#27ae60",
  color: "white",
  fontSize: "0.75rem",
  padding: "0.2rem 0.5rem",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "0.2rem",
};

const ratingStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const ratingBarStyle = (rating) => ({
  width: `${rating * 20}px`,
  height: "8px",
  background: "#f39c12",
  borderRadius: "4px",
});

const detailsRowStyle = {
  background: "#f0f7ff",
};

const detailsCellStyle = {
  padding: "0",
};

const detailsContentStyle = {
  padding: "1.5rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1rem",
};

const orderButtonStyle = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "0.8rem 1.5rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.3s",
  gridColumn: "1 / -1",
  maxWidth: "300px",
  margin: "0.5rem auto 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  ":hover": {
    background: "#2980b9",
  },
};

const summaryStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5rem",
  marginTop: "2rem",
  paddingTop: "1.5rem",
  borderTop: "1px solid #eee",
};

const summaryItemStyle = {
  background: "#f8f9fa",
  padding: "1rem",
  borderRadius: "8px",
  flex: "1",
  minWidth: "250px",
  display: "flex",
  alignItems: "center",
};

// Стили для модального окна
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "2rem",
  width: "90%",
  maxWidth: "500px",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
};

const modalTitleStyle = {
  marginTop: 0,
  marginBottom: "1.5rem",
  color: "#2c3e50",
};

const formGroupStyle = {
  marginBottom: "1rem",
};

const formLabelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: "600",
  color: "#2c3e50",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "1rem",
};

const buttonGroupStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "1rem",
  marginTop: "1.5rem",
};

const cancelButtonStyle = {
  background: "#e74c3c",
  color: "white",
  border: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.3s",
  ":hover": {
    background: "#c0392b",
  },
};

const submitButtonStyle = {
  background: "#27ae60",
  color: "white",
  border: "none",
  padding: "0.75rem 1.5rem",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.3s",
  ":hover": {
    background: "#219653",
  },
};