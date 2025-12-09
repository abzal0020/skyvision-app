import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer({ t }) {
export default function Footer() {
  const telHref = "+77471654092"; // международный формат для tel:
  const telDisplay = "8 (747) 165-40-92";

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col left">
          <h4>{t.footer.contacts}</h4>
          <div className="contact-line">📞 {t.hero.phone}</div>
          <div className="contact-line">🌐 www.SKYVISION.kz</div>
          <h4>Контакты</h4>
          <a
            className="contact-line"
            href={`tel:${telHref}`}
            aria-label={`Позвонить ${telDisplay}`}
          >
            📞 {telDisplay}
          </a>
          <a
            className="contact-line"
            href="https://www.SKYVISION.kz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Перейти на сайт SKYVISION"
          >
            🌐 www.SKYVISION.kz
          </a>
        </div>

        <div className="footer-col center">
          <h4>{t.footer.navigation}</h4>
          <nav className="footer-nav">
            <Link to="/">{t.nav.main}</Link>
            <Link to="/prices">{t.nav.prices}</Link>
            <Link to="/contact">{t.nav.contact}</Link>
            <a href="/">Главная</a>
            <a href="/prices">Цены</a>
            <a href="/contact">Контакты</a>
          </nav>
        </div>

        <div className="footer-col right">
          {/* Can add social media or logo */}
        </div>

        <div className="footer-bottom">
          <div>© 2025 SKYVISION. {t.footer.rights}</div>
          <div className="developer">{t.footer.dev}</div>
        </div>
      </div>
    </footer>
  );
}
