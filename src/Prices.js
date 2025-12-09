import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestModal from "./components/RequestModal";
import {
  FaSort, FaSortUp, FaSortDown,
  FaCity, FaIndustry, FaWarehouse, FaShippingFast, FaDollarSign,
  FaChartLine, FaBox, FaMoneyBillWave, FaShoppingCart, FaBars, FaTimes
} from "react-icons/fa";
import { supabase } from "./lib/supabaseClient";

// стили импортируются из отдельного модуля
import {
  pageStyle, headerStyle, titleStyle, subtitleStyle, cardStyle, controlsStyle,
  mobileFilterButtonStyle, mobileFiltersStyle, filterGroupStyle, labelStyle,
  selectWrapperStyle, selectStyle, tableContainerStyle, tableStyle, mobileTableStyle,
  thStyle, thContentStyle, trStyle, trAltStyle, expandedTrStyle, tdStyle, linkStyle,
  bestBadgeStyle, detailsRowStyle, detailsCellStyle, detailsContentStyle, orderButtonStyle,
  summaryStyle, mobileSummaryStyle, summaryItemStyle
} from "./pricesStyles";

export default function Prices({ t }) {
  const navigate = useNavigate();
  const logistics = 38;

  const [factories, setFactories] = useState([]); // данные из БД
  const [loading, setLoading] = useState(true);
  const [filterCity, setCity] = useState("Все");
  const [sort, setSort] = useState({ field: "dap", asc: true });
  const [expandedRow, setExpandedRow] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Загрузка фабрик + прайсов и определение роли
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Узнаём пользователя и роль
        let user = null;
        try {
          const { data: userData } = await supabase.auth.getUser();
          user = userData?.user ?? null;
        } catch (e) {
          user = null;
        }

        let admin = false;
        if (user) {
          try {
            const { data: profile, error: profErr } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
            if (!profErr && profile?.role === 'admin') admin = true;
          } catch (e) {
            admin = false;
          }
        }
        if (!mounted) return;
        setIsAdmin(admin);

        // Запрос фабрик: обязательно запрашиваем city
        let query = supabase
          .from('factories')
          .select('id, name, slug, city, published, factory_prices(id, title, price, currency)');

        if (!admin) {
          query = query.eq('published', true);
        }

        const { data, error } = await query.order('name', { ascending: true });
        if (error) throw error;
        if (mounted) setFactories(data || []);
      } catch (err) {
        console.error('Failed to load factories:', err);
        if (mounted) setFactories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Города на странице (вытаскиваем из загруженных данных, поле city может не существовать)
  const cityOptions = useMemo(() => {
    const cities = [...new Set((factories || []).map(f => (f.city ?? '—')))].filter(Boolean);
    return ["Все", ...cities];
  }, [factories]);

  // Подготовка массива для отображения
  const rawData = useMemo(() => {
    return (factories || []).map(f => {
      // выбираем "показательный" прайс: первый или null
      const priceRec = (f.factory_prices && f.factory_prices.length > 0) ? f.factory_prices[0] : null;
      return {
        id: f.id,
        city: f.city || '—',
        factory: f.name,
        slug: f.slug,
        price: priceRec ? (priceRec.price ?? 0) : 0,
        currency: priceRec ? (priceRec.currency || '') : '',
        minOrder: f.min_order || 20,
        payment: f.payment_terms || '50% предоплата'
      };
    });
  }, [factories]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filtered = useMemo(
    () => rawData.filter(r => filterCity === "Все" || r.city === filterCity),
    [rawData, filterCity]
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
    e.stopPropagation();
    setSelectedFactory(factoryName);
    setShowOrderModal(true);
  };

  // Edit button: переходим в админку по id (видна только админам)
  const handleEdit = (factoryId, e) => {
    e.stopPropagation();
    navigate(`/admin/factories/${factoryId}`);
  };

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;

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
continue

/* --- стили (оставлены ваши текущие стили; вставьте их ниже или импортируйте из текущего файла) --- */
/* ... все стили как в вашем оригинале (pageStyle, headerStyle, ...) ... */
const pageStyle = {
  background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
  minHeight: "100vh",
  padding: "1rem",
  fontFamily: "'Roboto', sans-serif",
};
/* (остальные стили — скопируйте их из вашего текущего файла, они не изменились) */
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

/* --- стили (оставлены ваши текущие стили; вставьте их ниже или импортируйте из текущего файла) --- */
/* ... все стили как в вашем оригинале (pageStyle, headerStyle, ...) ... */
/* (копируйте стили из вашего текущего файла, они не изменились) */

/* --- стили (оставлены ваши текущие стили; вставьте их ниже или импортируйте из текущего файла) --- */
/* ... все стили как в вашем оригинале (pageStyle, headerStyle, ...) ... */
const pageStyle = {
  background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
  minHeight: "100vh",
  padding: "1rem",
  fontFamily: "'Roboto', sans-serif",
};
/* (остальные стили — скопируйте их из вашего текущего файла, они не изменились) */
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
