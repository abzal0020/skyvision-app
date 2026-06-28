import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaSearch, FaPhone, FaUserShield } from "react-icons/fa";
import Prices from "./Prices";
import Contact from "./Contact";
import Agrodan from "./factories/Agrodan";
import IBMO from "./factories/IBMO";
import FactoryMibeko from "./factories/FactoryMibeko";
import FactoryKhlebnyDom from "./factories/FactoryKhlebnyDom";
import FactoryRahmat from "./factories/FactoryRahmat";
import FactoryBrothersAgro from "./factories/FactoryBrothersAgro";
import FactoryRudni from "./factories/FactoryRudni";
import FactoryAgroplanet from "./factories/FactoryAgroplanet";
import FactoryRomana from "./factories/FactoryRomana";
import FactoryBestKostanai from "./factories/FactoryBestKostanai";
import FactoryVadisa from "./factories/FactoryVadisa";
import FactoryHarvest from "./factories/FactoryHarvest";
import FactoryAgromix from "./factories/FactoryAgromix";
import FactoryShahristan from "./factories/FactoryShahristan";
import FactoryAgrofood from "./factories/FactoryAgrofood";
import RequestModal from "./components/RequestModal";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import "./App.css";
import "./components/HeaderAdminMenu.css";
import { locales } from "./locales";
import { supabase } from "./lib/supabaseClient";
import { useAuth } from "./context/AuthContext";
import FactoryPage from "./pages/FactoryPage";
import FactoryDetail from "./pages/admin/FactoryDetail";
import FactoriesPage from "./pages/admin/FactoriesPage";

const DEFAULT_TEL_HREF = "+77715252683";

function slugifyFactoryName(name = "") {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "");
}

function HeaderAdminMenu({ lang }) {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState("");

  const labels = lang === "zh"
    ? {
        login: "登录",
        admin: "管理",
        email: "管理员邮箱",
        password: "密码",
        signing: "登录中...",
        submit: "登录",
        openPanel: "打开管理面板",
        logout: "退出",
        loading: "加载...",
        error: "登录失败",
      }
    : {
        login: "Войти",
        admin: "Админ",
        email: "Email администратора",
        password: "Пароль",
        signing: "Входим...",
        submit: "Войти",
        openPanel: "Открыть админку",
        logout: "Выйти",
        loading: "Загрузка...",
        error: "Не удалось войти",
      };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setSigning(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setEmail("");
      setPassword("");
      setOpen(false);
    } catch (error) {
      setMessage(error?.message || labels.error);
    } finally {
      setSigning(false);
    }
  };

  const handleSignOut = async () => {
    setMessage("");
    await supabase.auth.signOut();
    setOpen(false);
  };

  const userLabel = profile?.display_name || user?.email;

  return (
    <div className="admin-menu">
      <button
        type="button"
        className={`admin-trigger${user ? " signed-in" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <FaUserShield />
        <span>{loading ? labels.loading : user ? labels.admin : labels.login}</span>
      </button>

      {open && (
        <div className="admin-panel" role="dialog" aria-label={labels.login}>
          {user ? (
            <>
              <div className="admin-panel-user">
                <span>{userLabel}</span>
                {profile?.role && <small>{profile.role}</small>}
              </div>
              <Link className="admin-panel-link" to="/admin/factories" onClick={() => setOpen(false)}>
                {labels.openPanel}
              </Link>
              <button type="button" className="admin-panel-secondary" onClick={handleSignOut}>
                {labels.logout}
              </button>
            </>
          ) : (
            <form className="admin-login-form" onSubmit={handleSignIn}>
              <input
                type="email"
                placeholder={labels.email}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <input
                type="password"
                placeholder={labels.password}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="submit" disabled={signing}>
                {signing ? labels.signing : labels.submit}
              </button>
              {message && <p className="admin-login-message">{message}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Home({ t, openModal }) {
  const services = [
    { icon: "🚆", title: t.services.train, desc: t.services.trainDesc },
    { icon: "🚚", title: t.services.factoryPrices, desc: t.services.factoryPricesDesc },
    { icon: "🌏", title: t.services.intl, desc: t.services.intlDesc }
  ];

  const popularFactories = [
    { name: "Agrodan", description: t.factories.subtitle },
    { name: "IBMO", description: t.factories.subtitle },
    { name: "Mibeko", description: t.factories.subtitle },
    { name: "Khlebny Dom", description: t.factories.subtitle }
  ];

  return (
    <div>
      <section className="hero-section">
        <h1>{t.hero.title}</h1>
        <p>{t.hero.subtitle}</p>
        <div className="cta-container">
          <button className="btn-main" onClick={() => openModal(t.hero.request)}>
            {t.hero.request}
          </button>
        </div>
      </section>

      <section className="services-section">
        <h2 className="section-title">{t.services.title}</h2>
        <div className="services-grid">
          {services.map((s, idx) => (
            <div className="service-card" key={idx} onClick={() => openModal(s.title)}>
              <div className="service-icon" style={{ fontSize: "2em" }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <button className="service-btn">{t.services.orderBtn}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-content">
          <div className="about-text">
            <h2 className="section-title">{t.about.title}</h2>
            <p>{t.about.years}</p>
            <p>{t.about.tons}</p>
            <p>{t.about.clients}</p>
            <button className="btn-main" onClick={() => openModal(t.hero.request)}>
              {t.hero.request}
            </button>
          </div>
          <div className="about-image">
            <div className="image-placeholder">{t.about.imageText}</div>
          </div>
        </div>
      </section>

      <section className="factories-section">
        <h2 className="section-title">{t.factories.title}</h2>
        <div className="factories-grid">
          {popularFactories.map((factory) => (
            <Link
              to={`/factory/${slugifyFactoryName(factory.name)}`}
              className="factory-card"
              key={factory.name}
            >
              {factory.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [lang, setLang] = useState("ru");
  const [showModal, setShowModal] = useState(false);
  const [activeService, setActiveService] = useState("");
  const t = locales[lang];

  const openModal = (service) => {
    setActiveService(service);
    setShowModal(true);
  };

  return (
    <Router>
      <div className="app-wrapper">
        <header>
          <Link to="/" className="logo">{t.logo}</Link>
          <nav className="nav">
            <Link to="/">{t.nav.main}</Link>
            <Link to="/prices">{t.nav.prices}</Link>
            <Link to="/contact">{t.nav.contact}</Link>
          </nav>

          <div className="header-actions">
            <a className="header-contacts" href={`tel:${DEFAULT_TEL_HREF}`} aria-label={`Позвонить ${t.hero.phone}`}>
              <FaPhone />
              <span>{t.hero.phone}</span>
            </a>

            <button className="search-btn" type="button" aria-label="Поиск">
              <FaSearch />
            </button>

            <div className="language-switcher" aria-label="Language switcher">
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={lang === "ru" ? "lang-btn active" : "lang-btn"}
              >RU</button>
              <button
                type="button"
                onClick={() => setLang("zh")}
                className={lang === "zh" ? "lang-btn active" : "lang-btn"}
              >中文</button>
            </div>

            <HeaderAdminMenu lang={lang} />
          </div>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home t={t} openModal={openModal} />} />
            <Route path="/prices" element={<Prices t={t} />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/factory/agrodan" element={<Agrodan />} />
            <Route path="/factory/ibmo" element={<IBMO />} />
            <Route path="/factory/mibeko" element={<FactoryMibeko />} />
            <Route path="/factory/khlebny-dom" element={<FactoryKhlebnyDom />} />
            <Route path="/factory/rahmat" element={<FactoryRahmat />} />
            <Route path="/factory/brothers-agro" element={<FactoryBrothersAgro />} />
            <Route path="/factory/rudni" element={<FactoryRudni />} />
            <Route path="/factory/agroplanet" element={<FactoryAgroplanet />} />
            <Route path="/factory/romana" element={<FactoryRomana />} />
            <Route path="/factory/bestkostanai" element={<FactoryBestKostanai />} />
            <Route path="/factory/vadisa" element={<FactoryVadisa />} />
            <Route path="/factory/harvest" element={<FactoryHarvest />} />
            <Route path="/factory/agromix" element={<FactoryAgromix />} />
            <Route path="/factory/shahristan" element={<FactoryShahristan />} />
            <Route path="/factory/agrofood" element={<FactoryAgrofood />} />
            <Route path="/factory/:slug" element={<FactoryPage />} />

            <Route path="/admin/factories" element={<FactoriesPage />} />
            <Route path="/admin/factories/:id" element={<FactoryDetail />} />
          </Routes>
        </main>

        <Footer t={t} />

        <FloatingWhatsApp message="Здравствуйте! Интересует заявка по продукту/логистике." />

        {showModal && (
          <RequestModal
            factoryName={activeService}
            onClose={() => setShowModal(false)}
            t={t}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
