import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaSearch, FaPhone, FaShippingFast, FaTrain, FaTruck, FaWarehouse, FaGlobe, FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import RequestModal from "./components/RequestModal";

// Импорт страниц
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

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [activeService, setActiveService] = useState("");

  const services = [
    { icon: <FaTrain />, title: "ЖД перевозки", desc: " 40-футовых контейнеров" },
    { icon: <FaTruck />, title: "Цены заводов", desc: "информация о заводе" },
    { icon: <FaGlobe />, title: "Международные", desc: "из Казахстана в Китай" }
  ];

  const openModal = (service) => {
    setActiveService(service);
    setShowModal(true);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={heroContentStyle}>
          <h1 style={heroHeadingStyle}>Международные грузоперевозки</h1>
          <p style={heroSubheadingStyle}>Надежные решения для вашего бизнеса</p>
          
          <div style={ctaContainerStyle}>
            <button 
              style={primaryButtonStyle}
              onClick={() => openModal("Общая заявка")}
            >
              <FaCalendarAlt style={iconStyle} /> Оставить заявку
            </button>
            <div style={phoneLinkStyle}>
              <FaPhone style={iconStyle} /> 8 (747) 165-40-92
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>НАШИ УСЛУГИ</h2>
        <div style={servicesGridStyle}>
          {services.map((service, index) => (
            <div 
              key={index} 
              style={serviceCardStyle}
              onClick={() => openModal(service.title)}
            >
              <div style={serviceIconContainerStyle}>
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <button style={serviceButtonStyle}>
                Заказать <FaArrowRight />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section style={aboutSectionStyle}>
        <div style={aboutContentStyle}>
          <h2 style={sectionHeadingStyle}>О нашей компании</h2>
          <div style={aboutGridStyle}>
            <div style={aboutTextStyle}>
              <p>Более 15 лет успешной работы на рынке транспортных услуг</p>
              <p>1 500 000+ тонн доставленных грузов</p>
              <p>250+ постоянных клиентов</p>
              <button 
                style={primaryButtonStyle}
                onClick={() => openModal("Общая заявка")}
              >
                Оставить заявку
              </button>
            </div>
            <div style={aboutImageStyle}>
              <div style={imagePlaceholderStyle}>INTERLINK TERMINAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Factories Section */}
      <section style={factoriesSectionStyle}>
        <h2 style={sectionHeadingStyle}>Наши партнеры</h2>
        <p style={sectionSubheadingStyle}>Заводы и производители, с которыми мы сотрудничаем</p>
        
        <div style={factoriesGridStyle}>
          <Link to="/factory/agrodan" style={factoryCardStyle}>
            <h3>Agrodan</h3>
          </Link>
          <Link to="/factory/ibmo" style={factoryCardStyle}>
            <h3>IBMO</h3>
          </Link>
          <Link to="/factory/mibeko" style={factoryCardStyle}>
            <h3>Mibeko</h3>
          </Link>
          <Link to="/factory/khlebny-dom" style={factoryCardStyle}>
            <h3>Khlebny Dom</h3>
          </Link>
        </div>
      </section>

      {/* Request Modal */}
      {showModal && (
        <RequestModal 
          factoryName={activeService} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div style={appWrapperStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <div style={logoStyle}>Skyvision</div>
          <nav style={navLinksStyle}>
            <Link to="/" style={linkStyle}>Главная</Link>
            <Link to="/prices" style={linkStyle}>Цены</Link>
            <Link to="/contact" style={linkStyle}>Контакты</Link>
          </nav>
          <div style={headerContactsStyle}>
            <FaPhone style={phoneIconStyle} />
            <span>8 (747) 165-40-92</span>
          </div>
          <button style={searchButtonStyle}>
            <FaSearch />
          </button>
        </header>

        {/* Main */}
        <main style={mainStyle}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prices" element={<Prices />} />
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

        {/* Footer */}
        <footer style={footerStyle}>
          <div style={footerColumnsStyle}>
            <div style={footerColumnStyle}>
              <h3 style={footerHeadingStyle}>Skyvision</h3>
              <p>Логистические решения для вашего бизнеса</p>
            </div>
            <div style={footerColumnStyle}>
              <h3 style={footerHeadingStyle}>Контакты</h3>
              <p><FaPhone style={footerIconStyle} /> 8 (707) 187-13-70</p>
              <p>Казахстан, Алматы</p>
            </div>
          </div>
          <div style={footerBottomStyle}>
            <p style={{ margin: 0 }}>© 2025 Skyvision. Все права защищены.</p>
            <p style={{ margin: 0 }}>Сделано с любовью 💚</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Стили (оставлены ваши оригинальные с добавлением новых)
const appWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  fontFamily: "'Roboto', sans-serif",
  color: "#333",
};

const headerStyle = {
  backgroundColor: "rgba(44, 62, 80, 1)",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1rem 2rem",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};

const logoStyle = {
  fontSize: "1.8rem",
  fontWeight: "bold",
};

const navLinksStyle = {
  display: "flex",
  gap: "2rem",
  alignItems: "center",
};

const linkStyle = {
  color: "white",
  fontSize: "1rem",
  textDecoration: "none",
  transition: "color 0.3s",
  ":hover": {
    opacity: 0.8,
  },
};

const headerContactsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const phoneIconStyle = {
  fontSize: "1.2rem",
};

const searchButtonStyle = {
  backgroundColor: "transparent",
  color: "white",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer",
};

const mainStyle = {
  flex: "1",
};

const footerStyle = {
  backgroundColor: "rgba(44, 62, 80, 1)",
  color: "white",
  padding: "2rem 2rem 1rem",
};

const footerColumnsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "2rem",
  marginBottom: "2rem",
};

const footerColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const footerHeadingStyle = {
  fontSize: "1.2rem",
  marginBottom: "1rem",
  color: "rgba(44, 62, 80, 1)",
};

const footerIconStyle = {
  marginRight: "0.5rem",
};

const footerBottomStyle = {
  borderTop: "1px solid rgba(255,255,255,0.1)",
  paddingTop: "1.5rem",
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.9rem",
};

// Home Page Styles
const heroSectionStyle = {
  background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "white",
  padding: "5rem 2rem",
  textAlign: "center",
};

const heroContentStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const heroHeadingStyle = {
  fontSize: "2.5rem",
  marginBottom: "1rem",
  fontWeight: "bold",
};

const heroSubheadingStyle = {
  fontSize: "1.5rem",
  marginBottom: "3rem",
  opacity: 0.9,
};

const ctaContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  marginTop: "2rem"
};

const primaryButtonStyle = {
  backgroundColor: "rgba(44, 62, 80, 1)",
  color: "white",
  border: "none",
  padding: "1rem 2rem",
  borderRadius: "4px",
  fontSize: "1.1rem",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background 0.3s",
  ":hover": {
    backgroundColor: "rgba(44, 62, 80, 1)"
  }
};

const phoneLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.2rem",
  fontWeight: "bold"
};

const iconStyle = {
  marginRight: "0.5rem"
};

const sectionStyle = {
  padding: "5rem 2rem",
  maxWidth: "1200px",
  margin: "0 auto",
};

const sectionHeadingStyle = {
  fontSize: "2rem",
  textAlign: "center",
  marginBottom: "2rem",
  color: "rgba(44, 62, 80, 1)",
};

const servicesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "2rem",
  maxWidth: "1000px",
  margin: "0 auto",
};

const serviceCardStyle = {
  backgroundColor: "rgba(255,255,255,0.1)",
  padding: "2rem",
  borderRadius: "8px",
  backdropFilter: "blur(5px)",
  transition: "transform 0.3s",
  cursor: "pointer",
  ":hover": {
    transform: "translateY(-5px)",
  },
};

const serviceIconContainerStyle = {
  fontSize: "2.5rem",
  marginBottom: "1rem",
  color: "rgba(44, 62, 80, 1)",
};

const serviceButtonStyle = {
  marginTop: "1rem",
  backgroundColor: "transparent",
  color: "rgba(44, 62, 80, 1)",
  border: "1px solid rgba(44, 62, 80, 1)",
  padding: "0.5rem 1rem",
  borderRadius: "4px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  transition: "all 0.3s",
  ":hover": {
    backgroundColor: "rgba(44, 62, 80, 1)",
    color: "white"
  }
};

const aboutSectionStyle = {
  padding: "5rem 2rem",
  backgroundColor: "#f8f9fa",
};

const aboutContentStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const aboutGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "3rem",
  alignItems: "center",
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
  },
};

const aboutTextStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  fontSize: "1.1rem",
  lineHeight: "1.6",
};

const aboutImageStyle = {
  position: "relative",
  height: "300px",
};

const imagePlaceholderStyle = {
  backgroundColor: "#ddd",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  color: "#777",
  fontSize: "1.5rem"
};

const factoriesSectionStyle = {
  padding: "5rem 2rem",
  maxWidth: "1200px",
  margin: "0 auto",
};

const sectionSubheadingStyle = {
  textAlign: "center",
  marginBottom: "3rem",
  fontSize: "1.2rem",
  color: "#555",
};

const factoriesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1.5rem",
};

const factoryCardStyle = {
  backgroundColor: "white",
  padding: "1.5rem",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  textDecoration: "none",
  color: "#333",
  textAlign: "center",
  transition: "transform 0.3s, box-shadow 0.3s",
  ":hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
};

export default App;