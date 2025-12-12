import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestModal from "./components/RequestModal";
import {
  FaSort, FaSortUp, FaSortDown,
  FaCity, FaIndustry, FaWarehouse, FaShippingFast, FaDollarSign,
  FaChartLine, FaBox, FaMoneyBillWave, FaShoppingCart, FaBars, FaTimes
} from "react-icons/fa";
import { supabase } from "./lib/supabaseClient";

/* STATIC_FACTORIES unchanged (kept small for brevity) */
const STATIC_FACTORIES = [
  { id: "s1", city: "Костанай", factory: "Agrodan KsT", price: 190, minOrder: 20, payment: "50% предоплата", slug: "agrodan" },
  { id: "s2", city: "Костанай", factory: "Mibeko", price: 195, minOrder: 25, payment: "50% предоплата", slug: "mibeko" },
  { id: "s3", city: "Костанай", factory: "Khlebny Dom", price: 195, minOrder: 15, payment: "50% предоплата", slug: "khlebny-dom" },
  { id: "s4", city: "Костанай", factory: "Rahmat", price: 190, minOrder: 20, payment: "50% предоплата", slug: "rahmat" },
  { id: "s5", city: "Костанай", factory: "IBMO (Magomed)", price: 185, minOrder: 30, payment: "50% предоплата", slug: "ibmo" },
  { id: "s6", city: "Рудный", factory: "Rudni (Marat)", price: 200, minOrder: 15, payment: "50% предоплата", slug: "rudni" },
  { id: "s7", city: "Костанай", factory: "Brothers Agro", price: 195, minOrder: 20, payment: "50% предоплата", slug: "brothers-agro" },
  { id: "s8", city: "Костанай", factory: "Agroplanet", price: 195, minOrder: 25, payment: "60% предоплата", slug: "agroplanet" },
  { id: "s9", city: "Костанай", factory: "Romana", price: 195, minOrder: 20, payment: "50% предоплата", slug: "romana" },
  { id: "s10", city: "Костанай", factory: "Best Kostanai (malik)", price: 195, minOrder: 30, payment: "50% предоплата", slug: "best-kostanai" },
  { id: "s11", city: "Костанай", factory: "Vadisa m", price: 195, minOrder: 20, payment: "50% предоплата", slug: "vadisa" },
  { id: "s12", city: "Костанай", factory: "Harvest (Azamat)", price: 205, minOrder: 15, payment: "50% предоплата", slug: "harvest" },
  { id: "s13", city: "Костанай", factory: "Agromix", price: 195, minOrder: 20, payment: "50% предоплата", slug: "agromix" },
  { id: "s14", city: "Костанай", factory: "Shahristan agro", price: 190, minOrder: 25, payment: "50% предоплата", slug: "shahristan" },
  { id: "s15", city: "Костанай", factory: "Agrofood export", price: 195, minOrder: 20, payment: "50% предоплата", slug: "agrofood" },
];

export default function Prices({ t }) {
  const navigate = useNavigate();
  const logistics = 38;

  const [factories, setFactories] = useState([]); // from DB
  const [loading, setLoading] = useState(true);
  const [filterCity, setCity] = useState("Все");
  const [sort, setSort] = useState({ field: "dap", asc: true });
  const [expandedRow, setExpandedRow] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load factories from Supabase and determine role
  const fetchFactories = async () => {
    setLoading(true);
    try {
      // Attempt to determine user and role
      let user = null;
      try {
        const userRes = await supabase.auth.getUser();
        user = userRes?.data?.user ?? null;
      } catch (e) {
        user = null;
      }

      let admin = false;
      if (user) {
        try {
          const { data: profile, error: profErr } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (!profErr && profile?.role === "admin") admin = true;
        } catch (e) {
          admin = false;
        }
      }
      setIsAdmin(admin);

      // Query factories (include nested factory_prices with created_at)
      let query = supabase
        .from("factories")
        .select("id, name, slug, city, published, min_order, payment_terms, factory_prices(id, price, currency, unit, min_qty, note, created_at)")
        .order("name", { ascending: true });

      if (!admin) query = query.eq("published", true);

      const { data, error } = await query;
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) {
        setFactories(data);
      } else {
        setFactories([]);
      }
    } catch (err) {
      console.error("Failed to load factories:", err);
      setFactories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  // Realtime: subscribe to factory changes AND to factory_prices changes to refresh list when prices are added/updated/deleted
  useEffect(() => {
    // subscribe factories (existing)
    const ch1 = supabase
      .channel('public:factories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'factories' },
        (payload) => {
          // Re-fetch full list to get nested prices in sync
          fetchFactories();
        }
      )
      .subscribe()
      .catch(e => console.warn('subscribe factories failed', e));

    // subscribe factory_prices (important to refresh prices)
    const ch2 = supabase
      .channel('public:factory_prices')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'factory_prices' },
        (payload) => {
          // on any change to prices, refresh list
          fetchFactories();
        }
      )
      .subscribe()
      .catch(e => console.warn('subscribe factory_prices failed', e));

    return () => {
      try { supabase.removeChannel(ch1); } catch (e) { /* ignore */ }
      try { supabase.removeChannel(ch2); } catch (e) { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(typeof window !== "undefined" ? window.innerWidth < 768 : false);
    if (typeof window !== "undefined") window.addEventListener("resize", handleResize);
    return () => { if (typeof window !== "undefined") window.removeEventListener("resize", handleResize); };
  }, []);

  // Prepare data for UI: prefer DB factories, otherwise static
  const normalizedData = useMemo(() => {
    if (factories && factories.length > 0) {
      return factories.map(f => {
        const priceRec = (f.factory_prices && f.factory_prices.length > 0)
          ? [...f.factory_prices].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0]
          : null;
        return {
          id: f.id,
          city: f.city || "—",
          factory: f.name,
          slug: f.slug || "",
          price: priceRec ? (priceRec.price ?? 0) : 0,
          currency: priceRec ? (priceRec.currency ?? "") : "",
          minOrder: f.min_order ?? 20,
          payment: f.payment_terms ?? "50% предоплата",
          note: priceRec ? (priceRec.note || "") : ""
        };
      });
    }
    // fallback to static
    return STATIC_FACTORIES.map(s => ({
      id: s.id,
      city: s.city,
      factory: s.factory,
      slug: s.slug,
      price: s.price,
      currency: "USD",
      minOrder: s.minOrder,
      payment: s.payment,
      note: ""
    }));
  }, [factories]);

  // City options from normalizedData
  const cityOptions = useMemo(() => {
    const cities = [...new Set(normalizedData.map(r => r.city || "—"))];
    return ["Все", ...cities];
  }, [normalizedData]);

  // Filtering and sorting
  const filtered = useMemo(
    () => normalizedData.filter(r => filterCity === "Все" || r.city === filterCity),
    [normalizedData, filterCity]
  );

  const sorted = useMemo(() => {
    const dir = sort.asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = sort.field === "dap" ? a.price + logistics : a.price;
      const bv = sort.field === "dap" ? b.price + logistics : b.price;
      return av > bv ? dir : -dir;
    });
  }, [filtered, sort]);

  const bestDAP = sorted.length ? Math.min(...sorted.map(r => r.price + logistics)) : 0;

  const sortIcon = (field) =>
    sort.field !== field ? <FaSort /> : sort.asc ? <FaSortUp /> : <FaSortDown />;

  const toggleSort = (field) =>
    setSort(prev => prev.field === field ? { field, asc: !prev.asc } : { field, asc: true });

  const toggleRow = (index) => setExpandedRow(expandedRow === index ? null : index);

  const handleOrderClick = (factoryName, e) => {
    e && e.stopPropagation();
    setSelectedFactory(factoryName);
    setShowOrderModal(true);
  };

  const handleEdit = (factoryId, e) => {
    e && e.stopPropagation();
    navigate(`/admin/factories/${factoryId}`);
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{t?.prices?.title ?? "Prices"}</h1>
        <p style={subtitleStyle}>{t?.prices?.subtitle ?? "Compare factory prices"}</p>
      </div>

      <div style={cardStyle}>
        {isMobile ? (
          <>
            <button
              style={mobileFilterButtonStyle}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <FaTimes /> : <FaBars />} {t?.prices?.filters ?? "Filters"}
            </button>
            {showFilters && (
              <div style={mobileFiltersStyle}>
                <div style={filterGroupStyle}>
                  <label style={labelStyle}><FaCity /> {t?.prices?.city ?? "City"}:</label>
                  <div style={selectWrapperStyle}>
                    <select
                      style={selectStyle}
                      value={filterCity}
                      onChange={e => setCity(e.target.value)}
                    >
                      {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={filterGroupStyle}>
                  <label style={labelStyle}><FaChartLine /> {t?.prices?.filters ?? "Sort"}:</label>
                  <div style={selectWrapperStyle}>
                    <select
                      style={selectStyle}
                      value={sort.field}
                      onChange={e => setSort(prev => ({ ...prev, field: e.target.value }))}
                    >
                      <option value="dap">{t?.prices?.dap ?? "DAP"}</option>
                      <option value="price">{t?.prices?.warehouse ?? "Price"}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={controlsStyle}>
            <div style={filterGroupStyle}>
              <label style={labelStyle}><FaCity /> {t?.prices?.city ?? "City"}:</label>
              <div style={selectWrapperStyle}>
                <select style={selectStyle} value={filterCity} onChange={e => setCity(e.target.value)}>
                  {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={filterGroupStyle}>
              <label style={labelStyle}><FaChartLine /> {t?.prices?.filters ?? "Sort"}:</label>
              <div style={selectWrapperStyle}>
                <select style={selectStyle} value={sort.field} onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value }))}>
                  <option value="dap">{t?.prices?.dap ?? "DAP"}</option>
                  <option value="price">{t?.prices?.warehouse ?? "Price"}</option>
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
                    {!isMobile && <FaCity />} {t?.prices?.city ?? "City"} {sortIcon("city")}
                  </div>
                </th>
                <th style={thStyle}>
                  <div style={thContentStyle}>
                    {!isMobile && <FaIndustry />} {t?.prices?.factory ?? "Factory"}
                  </div>
                </th>
                <th style={thStyle} onClick={() => toggleSort("price")}>
                  <div style={thContentStyle}>
                    {!isMobile && <FaWarehouse />} {t?.prices?.warehouse ?? "Price"} {sortIcon("price")}
                  </div>
                </th>
                {!isMobile && (
                  <th style={thStyle}>
                    <div style={thContentStyle}>
                      <FaShippingFast /> {t?.prices?.logistics ?? "Logistics"}
                    </div>
                  </th>
                )}
                <th style={{ ...thStyle, background: "#2c3e50" }} onClick={() => toggleSort("dap")}>
                  <div style={{ ...thContentStyle, color: "white" }}>
                    {!isMobile && <FaDollarSign />} {t?.prices?.dap ?? "DAP"} {sortIcon("dap")}
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
                  <React.Fragment key={r.id + "_" + i}>
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
                        <Link to={`/factory/${r.slug}`} style={linkStyle}>
                          {isMobile ? (r.factory.split(' ')[0]) : r.factory}
                        </Link>
                      </td>
                      <td style={tdStyle}>{r.price} {r.currency}</td>
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
                            <span style={{ marginRight: 4 }}><FaDollarSign /></span> {t?.prices?.best ?? "Best"}
                          </div>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr style={detailsRowStyle}>
                        <td colSpan={isMobile ? 4 : 5} style={detailsCellStyle}>
                          <div style={detailsContentStyle}>
                            <div>
                              <strong><FaBox /> {t?.prices?.minOrder ?? "Min order"}:</strong> {r.minOrder} {t?.prices?.amountUnit || "тонн"}
                            </div>
                            <div>
                              <strong><FaMoneyBillWave /> {t?.prices?.payment ?? "Payment"}:</strong> {r.payment}
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button
                                style={orderButtonStyle}
                                onClick={(e) => handleOrderClick(r.factory, e)}
                              >
                                <FaShoppingCart /> {t?.prices?.orderBtn ?? "Order"}
                              </button>

                              {isAdmin && (
                                <button
                                  style={{ ...orderButtonStyle, background: "#34495e" }}
                                  onClick={(e) => handleEdit(r.id, e)}
                                >
                                  {t?.prices?.editBtn || "Edit"}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>Нет доступных фабрик</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={isMobile ? mobileSummaryStyle : summaryStyle}>
          <div style={summaryItemStyle}>
            <FaDollarSign style={{ color: "#27ae60", marginRight: "0.5rem" }} />
            <strong>{t?.prices?.best ?? "Best"}:</strong> {bestDAP} $
          </div>
          <div style={summaryItemStyle}>
            <FaChartLine style={{ color: "#3498db", marginRight: "0.5rem" }} />
            <strong>{t?.prices?.avg ?? "Avg"}:</strong>
            {(normalizedData.reduce((sum, r) => sum + r.price, 0) / (normalizedData.length || 1) + logistics).toFixed(1)} $
          </div>
        </div>
      </div>

      {/* RequestModal */}
      {showOrderModal && (
        <RequestModal
          factoryName={selectedFactory}
          onClose={() => setShowOrderModal(false)}
          t={t}
        />
      )}
    </div>
  );
}

/* --- стили (одна декларация) --- */
/* (styles unchanged — keep as in your file) */
const pageStyle = {
  background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
  minHeight: "100vh",
  padding: "1rem",
  fontFamily: "'Roboto', sans-serif",
};
const headerStyle = { textAlign: "center", marginBottom: "1rem", maxWidth: "800px", margin: "0 auto 1rem" };
const titleStyle = { fontSize: "clamp(1.5rem, 5vw, 2.2rem)", color: "#2c3e50", marginBottom: "0.5rem" };
const subtitleStyle = { fontSize: "clamp(0.9rem, 3vw, 1.2rem)", color: "#7f8c8d" };
const cardStyle = { background: "#fff", borderRadius: "12px", boxShadow: "0 5px 15px rgba(0,0,0,0.08)", padding: "1rem", maxWidth: "1200px", margin: "0 auto" };
const controlsStyle = { display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" };
const mobileFilterButtonStyle = { background: "#3498db", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" };
const mobileFiltersStyle = { display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: "8px" };
const filterGroupStyle = { flex: "1", minWidth: "150px" };
const labelStyle = { display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#2c3e50", marginBottom: "0.5rem" };
const selectWrapperStyle = { position: "relative" };
const selectStyle = { width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid #ddd", backgroundColor: "#fff", fontSize: "0.9rem", appearance: "none", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" };
const tableContainerStyle = { overflowX: "auto", borderRadius: "8px", border: "1px solid #eee", marginBottom: "1rem", WebkitOverflowScrolling: "touch" };
const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "800px", fontSize: "0.95rem" };
const mobileTableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "500px", fontSize: "0.85rem" };
const thStyle = { background: "#f8f9fa", padding: "0.8rem", textAlign: "left", fontWeight: "600", color: "#7f8c8d", borderBottom: "2px solid #eee", cursor: "pointer", position: "sticky", top: 0 };
const thContentStyle = { display: "flex", alignItems: "center", gap: "0.3rem" };
const trStyle = { borderBottom: "1px solid #eee", cursor: "pointer" };
const trAltStyle = { background: "#f8f9fa" };
const expandedTrStyle = { background: "#e3f2fd" };
const tdStyle = { padding: "0.8rem", textAlign: "center" };
const linkStyle = { color: "#3498db", fontWeight: "500", textDecoration: "none" };
const bestBadgeStyle = { position: "absolute", top: "-10px", right: "0", background: "#27ae60", color: "white", fontSize: "0.7rem", padding: "0.2rem 0.4rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.2rem", whiteSpace: "nowrap" };
const detailsRowStyle = { background: "#f0f7ff" };
const detailsCellStyle = { padding: "0" };
const detailsContentStyle = { padding: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.8rem", fontSize: "0.9rem" };
const orderButtonStyle = { background: "#3498db", color: "white", border: "none", padding: "0.6rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "600", transition: "background 0.3s", gridColumn: "1 / -1", maxWidth: "250px", margin: "0.5rem auto 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.9rem" };
const summaryStyle = { display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee" };
const mobileSummaryStyle = { display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #eee", fontSize: "0.9rem" };
const summaryItemStyle = { background: "#f8f9fa", padding: "0.8rem", borderRadius: "8px", flex: "1", minWidth: "150px", display: "flex", alignItems: "center", fontSize: "0.9rem" };
