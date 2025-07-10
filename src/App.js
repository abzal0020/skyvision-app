import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Добро пожаловать на Skyvision</h1>
      <p>Находите актуальные цены заводов и оставляйте заявки на доставку.</p>
      <p>查看工厂最新价格并提交物流申请.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* шапка ― класс header для адаптива */}
      <nav className="header" style={{ backgroundColor: "#000080", padding: "1rem" }}>
        <Link to="/"       style={linkStyle}>Главная</Link>
        <Link to="/prices" style={linkStyle}>Цены</Link>
        <Link to="/contact" style={linkStyle}>Контакты</Link>
      </nav>

      {/* контент ― класс page с «умными» отступами */}
      <div className="page">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/prices"        element={<Prices />} />
          <Route path="/contact"       element={<Contact />} />

          <Route path="/factory/agrodan"        element={<Agrodan />} />
          <Route path="/factory/ibmo"           element={<IBMO />} />
          <Route path="/factory/mibeko"         element={<FactoryMibeko />} />
          <Route path="/factory/khlebny-dom"    element={<FactoryKhlebnyDom />} />
          <Route path="/factory/rahmat"         element={<FactoryRahmat />} />
          <Route path="/factory/brothers-agro"  element={<FactoryBrothersAgro />} />
          <Route path="/factory/rudni"          element={<FactoryRudni />} />
          <Route path="/factory/agroplanet"     element={<FactoryAgroplanet />} />
          <Route path="/factory/romana"         element={<FactoryRomana />} />
          <Route path="/factory/bestkostanai"   element={<FactoryBestKostanai />} />
          <Route path="/factory/vadisa"         element={<FactoryVadisa />} />
          <Route path="/factory/harvest"        element={<FactoryHarvest />} />
          <Route path="/factory/agromix"        element={<FactoryAgromix />} />
          <Route path="/factory/shahristan"     element={<FactoryShahristan />} />
          <Route path="/factory/agrofood"       element={<FactoryAgrofood />} />
        </Routes>
      </div>
    </Router>
  );
}

const linkStyle = {
  color: "white",
  marginRight: "1rem",
  textDecoration: "none",
  fontSize: "18px",
};

export default App;
