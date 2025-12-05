import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import RequestModal from "./components/RequestModal";
import {
  FaSort, FaSortUp, FaSortDown,
  FaCity, FaIndustry, FaWarehouse, FaShippingFast, FaDollarSign,
  FaChartLine, FaBox, FaMoneyBillWave, FaShoppingCart, FaBars, FaTimes
} from "react-icons/fa";
import RequestModal from "./components/RequestModal";

// Static data - moved outside component to avoid re-creation on every render
const rawData = [
  { city: "Костанай", factory: "Agrodan KsT", price: 190, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Mibeko", price: 195, minOrder: 25, payment: "50% предоплата" },
  { city: "Костанай", factory: "Khlebny Dom", price: 195, minOrder: 15, payment: "50% предоплата" },
  { city: "Костанай", factory: "Rahmat", price: 190, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "IBMO (Magomed)", price: 185, minOrder: 30, payment: "50% предоплата" },
  { city: "Рудный", factory: "Rudni (Marat)", price: 200, minOrder: 15, payment: "50% предоплата" },
  { city: "Костанай", factory: "Brothers Agro", price: 195, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Agroplanet", price: 195, minOrder: 25, payment: "60% предоплата" },
  { city: "Костанай", factory: "Romana", price: 195, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Best Kostanai (malik)", price: 195, minOrder: 30, payment: "50% предоплата" },
  { city: "Костанай", factory: "Vadisa m", price: 195, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Harvest (Azamat)", price: 205, minOrder: 15, payment: "50% предоплата" },
  { city: "Костанай", factory: "Agromix", price: 195, minOrder: 20, payment: "50% предоплата" },
  { city: "Костанай", factory: "Shahristan agro", price: 190, minOrder: 25, payment: "50% предоплата" },
  { city: "Костанай", factory: "Agrofood export", price: 195, minOrder: 20, payment: "50% предоплата" },
];

// !!! Обязательно передавай проп t={t} из App.js !!!
export default function Prices({ t }) {
  const logistics = 38;

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

  // Города на русском из данных, переводим только надписи
  const cityOptions = ["Все", ...new Set(rawData.map(r => r.city))];

  const [filterCity, setCity] = useState("Все");
  const [sort, setSort] = useState({ field: "dap", asc: true });
  const [expandedRow, setExpandedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [factoryName, setFactoryName] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filtered = useMemo(
    () => rawData.filter(r => filterCity === "Все" || r.city === filterCity),
    [filterCity]
  );

  const sorted = useMemo(() => {
    const dir = sort.asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = sort.field === "dap" ? a.price + logistics : a.price;
      const bv = sort.field === "dap" ? b.price + logistics : b.price;
      return av > bv ? dir : -dir;
    });
  }, [filtered, sort]);

  const bestDAP = Math.min(...rawData.map(r => r.price + logistics));

  const sortIcon = (field) =>
    sort.field !== field ? <FaSort /> : sort.asc ? <FaSortUp /> : <FaSortDown />;

  const toggleSort = (field) =>
    setSort(prev => prev.field === field ? { field, asc: !prev.asc } : { field, asc: true });

  const toggleRow = (index) => setExpandedRow(expandedRow === index ? null : index);

  const handleOrderClick = (factory, e) => {
    e.stopPropagation();
    setFactoryName(factory);
    setShowModal(true);
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{t.prices.title}</h1>
        <p style={subtitleStyle}>{t.prices.subtitle}</p>
      </div>
      <div style={cardStyle}>
        {isMobile ? (
          <>
            <button
              style={mobileFilterButtonStyle}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <FaTimes /> : <FaBars />} {t.prices.filters}
            </button>
            {showFilters && (
              <div style={mobileFiltersStyle}>
                <div style={filterGroupStyle}>
                  <label style={labelStyle}><FaCity /> {t.prices.city}:</label>
                  <div style={selectWrapperStyle}>
                    <select
                      style={selectStyle}
                      value={filterCity}
                      onChange={e => setCity(e.target.value)}
                    >
                      {cityOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={filterGroupStyle}>
                  <label style={labelStyle}><FaChartLine /> {t.prices.filters}:</label>
                  <div style={selectWrapperStyle}>
                    <select
                      style={selectStyle}
                      value={sort.field}
                      onChange={e => setSort(prev => ({ ...prev, field: e.target.value }))}
                    >
                      <option value="dap">{t.prices.dap}</option>
                      <option value="price">{t.prices.warehouse}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={controlsStyle}>
            <div style={filterGroupStyle}>
              <label style={labelStyle}><FaCity /> {t.prices.city}:</label>
              <div style={selectWrapperStyle}>
                <select
                  style={selectStyle}
                  value={filterCity}
                  onChange={e => setCity(e.target.value)}
                >
                  {cityOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={filterGroupStyle}>
              <label style={labelStyle}><FaChartLine /> {t.prices.filters}:</label>
              <div style={selectWrapperStyle}>
                <select
                  style={selectStyle}
                  value={sort.field}
                  onChange={e => setSort(prev => ({ ...prev, field: e.target.value }))}
                >
                  <option value="dap">{t.prices.dap}</option>
                  <option value="price">{t.prices.warehouse}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div style={tableContainerStyle}>
          <table style={isMobile ? mobileTableStyle : tableStyle}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => toggleSort("city")}>
                  <div style={thContentStyle}>
                    {!isMobile && <FaCity />} {t.prices.city} {sortIcon("city")}
                  </div>
                </th>
                <th style={thStyle}>
                  <div style={thContentStyle}>
                    {!isMobile && <FaIndustry />} {t.prices.factory}
                  </div>
                </th>
                <th style={thStyle} onClick={() => toggleSort("price")}>
                  <div style={thContentStyle}>
                    {!isMobile && <FaWarehouse />} {t.prices.warehouse} {sortIcon("price")}
                  </div>
                </th>
                {!isMobile && (
                  <th style={thStyle}>
                    <div style={thContentStyle}>
                      <FaShippingFast /> {t.prices.logistics}
                    </div>
                  </th>
                )}
                <th style={{ ...thStyle, background: "#2c3e50" }} onClick={() => toggleSort("dap")}>
                  <div style={{ ...thContentStyle, color: "white" }}>
                    {!isMobile && <FaDollarSign />} {t.prices.dap} {sortIcon("dap")}
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
                            {isMobile ? r.factory.split(' ')[0] : r.factory}
                          </Link>
                        ) : (
                          isMobile ? r.factory.split(' ')[0] : r.factory
                        )}
                      </td>
                      <td style={tdStyle}>{r.price}</td>
                      {!isMobile && <td style={tdStyle}>{logistics}</td>}
                      <td style={{
                        ...tdStyle,
                        fontWeight: 600,
                        color: best ? "#27ae60" : "#2c3e50",
                        position: "relative"
                      }}>
                        {dap}
                        {best && (
                          <div style={bestBadgeStyle}>
                            <span style={{ marginRight: 4 }}><FaDollarSign /></span> {t.prices.best}
                          </div>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={detailsRowStyle}>
                        <td colSpan={isMobile ? 4 : 5} style={detailsCellStyle}>
                          <div style={detailsContentStyle}>
                            <div>
                              <strong><FaBox /> {t.prices.minOrder}:</strong> {r.minOrder} {t.prices.amountUnit || "тонн"}
                            </div>
                            <div>
                              <strong><FaMoneyBillWave /> {t.prices.payment}:</strong> {r.payment}
                            </div>
                            <button
                              style={orderButtonStyle}
                              onClick={(e) => handleOrderClick(r.factory, e)}
                              data-factory-name={r.factory}
                            >
                              <FaShoppingCart /> {t.prices.orderBtn}
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

        <div style={isMobile ? mobileSummaryStyle : summaryStyle}>
          <div style={summaryItemStyle}>
            <FaDollarSign style={{ color: "#27ae60", marginRight: "0.5rem" }} />
            <strong>{t.prices.best}:</strong> {bestDAP} $
          </div>
          <div style={summaryItemStyle}>
            <FaChartLine style={{ color: "#3498db", marginRight: "0.5rem" }} />
            <strong>{t.prices.avg}:</strong>
            {(rawData.reduce((sum, r) => sum + r.price, 0) / rawData.length + logistics).toFixed(1)} $
          </div>
        </div>
      </div>

      {/* RequestModal component */}
      {showModal && (
        <RequestModal
          factoryName={factoryName}
          onClose={() => setShowModal(false)}
          t={t}
        />
      )}
    </div>
  );
}

// Все стили оставляй как есть, они идут ниже:
const pageStyle = {
  background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
  minHeight: "100vh",
  padding: "1rem",
  fontFamily: "'Roboto', sans-serif",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "1rem",
  maxWidth: "800px",
  margin: "0 auto 1rem",
};

const titleStyle = {
  fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
  color: "#2c3e50",
  marginBottom: "0.5rem",
};

const subtitleStyle = {
  fontSize: "clamp(0.9rem, 3vw, 1.2rem)",
  color: "#7f8c8d",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
  padding: "1rem",
  maxWidth: "1200px",
  margin: "0 auto",
};

const controlsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "1rem",
};

const mobileFilterButtonStyle = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const mobileFiltersStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1rem",
  padding: "1rem",
  background: "#f8f9fa",
  borderRadius: "8px",
};

const filterGroupStyle = {
  flex: "1",
  minWidth: "150px",
};

const labelStyle = {
  display: "flex",
  fontWeight: "600",
  marginBottom: "0.5rem",
  color: "#2c3e50",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
};

const selectWrapperStyle = {
  position: "relative",
};

const selectStyle = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  borderRadius: "6px",
  border: "1px solid #ddd",
  backgroundColor: "#fff",
  fontSize: "0.9rem",
  appearance: "none",
  cursor: "pointer",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const tableContainerStyle = {
  overflowX: "auto",
  borderRadius: "8px",
  border: "1px solid #eee",
  marginBottom: "1rem",
  WebkitOverflowScrolling: "touch",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "800px",
  fontSize: "0.95rem",
};

const mobileTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "500px",
  fontSize: "0.85rem",
};

const thStyle = {
  background: "#f8f9fa",
  padding: "0.8rem",
  textAlign: "left",
  fontWeight: "600",
  color: "#7f8c8d",
  borderBottom: "2px solid #eee",
  cursor: "pointer",
  position: "sticky",
  top: 0,
};

const thContentStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
};

const trStyle = {
  borderBottom: "1px solid #eee",
  cursor: "pointer",
};

const trAltStyle = {
  background: "#f8f9fa",
};

const expandedTrStyle = {
  background: "#e3f2fd",
};

const tdStyle = {
  padding: "0.8rem",
  textAlign: "center",
};

const linkStyle = {
  color: "#3498db",
  fontWeight: "500",
  textDecoration: "none",
};

const bestBadgeStyle = {
  position: "absolute",
  top: "-10px",
  right: "0",
  background: "#27ae60",
  color: "white",
  fontSize: "0.7rem",
  padding: "0.2rem 0.4rem",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "0.2rem",
  whiteSpace: "nowrap",
};

const detailsRowStyle = {
  background: "#f0f7ff",
};

const detailsCellStyle = {
  padding: "0",
};

const detailsContentStyle = {
  padding: "1rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "0.8rem",
  fontSize: "0.9rem",
};

const orderButtonStyle = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "0.6rem 1rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "background 0.3s",
  gridColumn: "1 / -1",
  maxWidth: "250px",
  margin: "0.5rem auto 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
};

const summaryStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  marginTop: "1rem",
  paddingTop: "1rem",
  borderTop: "1px solid #eee",
};

const mobileSummaryStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
  marginTop: "1rem",
  paddingTop: "1rem",
  borderTop: "1px solid #eee",
  fontSize: "0.9rem",
};

const summaryItemStyle = {
  background: "#f8f9fa",
  padding: "0.8rem",
  borderRadius: "8px",
  flex: "1",
  minWidth: "150px",
  display: "flex",
  alignItems: "center",
  fontSize: "0.9rem",
};
