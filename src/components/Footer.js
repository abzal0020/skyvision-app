import React from 'react';
import { Link } from 'react-router-dom';
export default function Footer({t}) { return <footer className="sv-footer"><div><strong>SKYVISION</strong><div>© {new Date().getFullYear()} · {t.footer.rights}</div></div><nav aria-label={t.footer.navigation}><Link to="/">{t.nav.main}</Link><Link to="/prices">{t.nav.prices}</Link><Link to="/contact">{t.nav.contact}</Link></nav></footer>; }
