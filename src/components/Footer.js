import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer({ t }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col left">
          <h4>{t.footer.contacts}</h4>
          <div className="contact-line">📞 {t.hero.phone}</div>
          <div className="contact-line">🌐 www.SKYVISION.kz</div>
        </div>

        <div className="footer-col center">
          <h4>{t.footer.navigation}</h4>
          <nav className="footer-nav">
            <Link to="/">{t.nav.main}</Link>
            <Link to="/prices">{t.nav.prices}</Link>
            <Link to="/contact">{t.nav.contact}</Link>
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
