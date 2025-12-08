import React from "react";
import "./Footer.css";

export default function Footer() {
  // Телефон в международном формате для tel: ссылки
  const telHref = "+77471654092"; // +7 747 165 40 92
  const telDisplay = "8 (747) 165-40-92";

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col left">
          <h4>Контакты</h4>
          <a className="contact-line" href={`tel:${telHref}`} aria-label={`Позвонить ${telDisplay}`}>
            📞 {telDisplay}
          </a>
          <a className="contact-line" href="https://www.SKYVISION.kz" target="_blank" rel="noopener noreferrer" aria-label="Перейти на сайт SKYVISION">
            🌐 www.SKYVISION.kz
          </a>
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
          {/* Здесь можно добавить соцсети, логотип или другие элементы */}
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2025 SKYVISION. Все права защищены.</div>
        <div className="developer">Разработка: SKYVISION</div>
      </div>
    </footer>
  );
}
