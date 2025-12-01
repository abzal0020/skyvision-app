import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaSearch, FaPhone, FaGlobe } from "react-icons/fa";
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
import "./App.css";
import { locales } from "./locales";

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
          <div className="hero-phone">
            <FaPhone /> {t.hero.phone}
          </div>
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
          {popularFactories.map((factory, idx) => (
            <Link to={`/factory/${factory.name.toLowerCase()}`} className="factory-card" key={idx}>
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
          <div className="logo">{t.logo}</div>
          <nav className="nav">
            <Link to="/">{t.nav.main}</Link>
            <Link to="/prices">{t.nav.prices}</Link>
            <Link to="/contact">{t.nav.contact}</Link>
          </nav>
          <div className="header-contacts">
            <FaPhone />
            <span>{t.hero.phone}</span>
          </div>
          <button className="search-btn">
            <FaSearch />
          </button>
          <div>
            <button
              onClick={() => setLang("ru")}
              className={lang === "ru" ? "lang-btn active" : "lang-btn"}
            >RU</button>
            <button
              onClick={() => setLang("zh")}
              className={lang === "zh" ? "lang-btn active" : "lang-btn"}
            >中文</button>
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
          </Routes>
        </main>
        <footer>
          <div className="footer-columns">
            <div className="footer-column">
              <div className="footer-heading">{t.footer.contacts}</div>
              <div><FaPhone /> {t.hero.phone}</div>
              <div><FaGlobe /> www.SKYVISION.kz</div>
            </div>
            <div className="footer-column">
              <div className="footer-heading">{t.footer.navigation}</div>
              <Link to="/" className="footer-link">{t.nav.main}</Link>
              <Link to="/prices" className="footer-link">{t.nav.prices}</Link>
              <Link to="/contact" className="footer-link">{t.nav.contact}</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 SKYVISION. {t.footer.rights}</span>
            <span>{t.footer.dev}</span>
          </div>
        </footer>
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
