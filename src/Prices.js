/* src/Prices.js */
import React, { useState, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown, FaStar } from "react-icons/fa";

const logistics = 32;
const rawData = [
  { city: "Костанай", factory: "Agrodan KsT",       price: 215, rating: 4.3 },
  { city: "Костанай", factory: "Mibeko",            price: 215, rating: 4.1 },
  { city: "Костанай", factory: "Khlebny Dom",       price: 215, rating: 4.7 },
  { city: "Костанай", factory: "Rahmat",            price: 215, rating: 4.0 },
  { city: "Костанай", factory: "IBMO (Magomed)",    price: 210, rating: 3.8 },
  { city: "Рудный",   factory: "Rudni (Marat)",     price: 220, rating: 4.9 },
  { city: "Костанай", factory: "Brothers Agro",     price: 215, rating: 4.4 },
  { city: "Костанай", factory: "Agroplanet",        price: 217, rating: 4.5 },
  { city: "Костанай", factory: "Romana",            price: 215, rating: 4.5 },
  { city: "Костанай", factory: "Best Kostanai (malik)", price: 215, rating: 4.2 },
  { city: "Костанай", factory: "Vadisa m",          price: 215, rating: 4.4 },
  { city: "Костанай", factory: "Harvest (Azamat)",  price: 225, rating: 4.7 },
  { city: "Костанай", factory: "Agromix",           price: 210, rating: 4.7 },
  { city: "Костанай", factory: "Shahristan agro",   price: 225, rating: 4.0 },
  { city: "Костанай", factory: "Agrofood export",   price: 225, rating: 4.8 },
];

/* ---------- карты ссылок ---------- */
const links = {
  "Agrodan KsT":           "/factory/agrodan",
  "Mibeko":                "/factory/mibeko",
  "Khlebny Dom":           "/factory/khlebny-dom",
  "Rahmat":                "/factory/rahmat",
  "IBMO (Magomed)":        "/factory/ibmo",
  "Rudni (Marat)":         "/factory/rudni",
  "Brothers Agro":         "/factory/brothers-agro",
  "Agroplanet":            "/factory/agroplanet",
  "Romana":                "/factory/romana",
  "Best Kostanai (malik)": "/factory/bestkostanai",
  "Vadisa m":              "/factory/vadisa",
  "Harvest (Azamat)":      "/factory/harvest",
  "Agromix":               "/factory/agromix",
  "Shahristan agro":       "/factory/shahristan",
  "Agrofood export":       "/factory/agrofood",
};

export default function Prices() {
  const [filterCity, setCity] = useState("Все");
  const [sort, setSort] = useState({ field: null, asc: true });

  /* ---------- фильтр ---------- */
  const filtered = useMemo(
    () => rawData.filter(r => filterCity === "Все" || r.city === filterCity),
    [filterCity]
  );

  /* ---------- сортировка ---------- */
  const sorted = useMemo(() => {
    if (!sort.field) return filtered;

    const dir = sort.asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av =
        sort.field === "dap" ? a.price + logistics : sort.field === "rating" ? a.rating : a.price;
      const bv =
        sort.field === "dap" ? b.price + logistics : sort.field === "rating" ? b.rating : b.price;
      return av > bv ? dir : -dir;
    });
  }, [filtered, sort]);

  /* ---------- лучший DAP ---------- */
  const bestDAP = Math.min(...rawData.map(r => r.price + logistics));

  /* ---------- helpers ---------- */
  const sortIcon = (field) =>
    sort.field !== field ? <FaSort /> : sort.asc ? <FaSortUp /> : <FaSortDown />;

  const toggleSort = (field) =>
    setSort(prev =>
      prev.field === field ? { field, asc: !prev.asc } : { field, asc: true }
    );

  /* ---------- UI ---------- */
  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ marginBottom: 20 }}>Цены на кормовую муку (DAP до границы)</h2>

        {/* фильтр + сортировка */}
        <div style={controls}>
          <div>
            <label style={label}>Город:</label>
            <select style={select} value={filterCity} onChange={e => setCity(e.target.value)}>
              <option>Все</option>
              {[...new Set(rawData.map(r => r.city))].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Сортировка:</label>
            <select
              style={select}
              value={sort.field ? `${sort.field}-${sort.asc ? "asc" : "desc"}` : ""}
              onChange={e => {
                const v = e.target.value;
                if (!v) return setSort({ field: null, asc: true });
                const [field, dir] = v.split("-");
                setSort({ field, asc: dir === "asc" });
              }}
            >
              <option value="">—</option>
              <option value="price-asc">Склад ↑</option>
              <option value="price-desc">Склад ↓</option>
              <option value="dap-asc">DAP ↑</option>
              <option value="dap-desc">DAP ↓</option>
              <option value="rating-desc">Рейтинг</option>
            </select>
          </div>
        </div>

        {/* таблица */}
        <div className="tableWrap">
          <table className="priceTable">
            <thead>
              <tr>
                <th style={th} onClick={() => toggleSort("city")}>Город {sortIcon("city")}</th>
                <th style={th}>Завод</th>
                <th style={th} onClick={() => toggleSort("price")}>Склад $ {sortIcon("price")}</th>
                <th style={th}>Логистика</th>
                <th style={th} onClick={() => toggleSort("dap")}>DAP $ {sortIcon("dap")}</th>
                <th style={th} onClick={() => toggleSort("rating")}>★ {sortIcon("rating")}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const dap = r.price + logistics;
                const best = dap === bestDAP;
                return (
                  <tr key={r.factory} style={i % 2 ? rowAlt : {}}>
                    <td style={td}>{r.city}</td>
                    <td style={td}>
                      {links[r.factory] ? (
                        <a href={links[r.factory]} style={link}>
                          {r.factory}
                        </a>
                      ) : (
                        r.factory
                      )}
                    </td>
                    <td style={td}>{r.price}</td>
                    <td style={td}>{logistics}</td>
                    <td style={{ ...td, fontWeight: best && 600, color: best && "#00790c" }}>
                      {dap} {best && <FaStar style={{ marginLeft: 4 }} />}
                    </td>
                    <td style={td}>{r.rating.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------ стили ------ */
const page = { background: "#f6f7fb", minHeight: "100vh", padding: "3rem 1rem" };

const card = {
  background: "#fff",
  maxWidth: 1100,
  margin: "0 auto",
  borderRadius: 12,
  padding: "2rem",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const controls = { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 };
const label = { display: "block", fontWeight: 600, marginBottom: 4 };
const select = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 14,
};

const th = {
  background: "#000080",
  color: "#fff",
  padding: "12px 8px",
  textAlign: "left",
  position: "sticky",
  top: 0,
  cursor: "pointer",
  userSelect: "none",
};
const td = { padding: "10px 8px", textAlign: "center" };
const rowAlt = { background: "#f0f4ff" };
const link = { color: "#000080", textDecoration: "underline" };
