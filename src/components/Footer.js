import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col left">
          <h4>Контакты</h4>
          <div className="contact-line">📞 8 (747) 165-40-92</div>
          <div className="contact-line">🌐 www.SKYVISION.kz</div>
        </div>

        <div className="footer-col center">
          <h4>Навигация</h4>
          <nav className="footer-nav">
            <a href="/">Главная</a>
            <a href="/prices">Цены</a>
            <a href="/contacts">Контакты</a>
          </nav>
        </div>

        <div className="footer-col right">
          {/* Можно добавить соцсети или логотип */}
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2025 SKYVISION. Все права защищены.</div>
        <div className="developer">Разработка: SKYVISION</div>
      </div>
    </footer>
  );
}
