import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaSearch, FaPhone, FaUserShield } from "react-icons/fa";
import Prices from "./catalog/Prices";
import Home from "./catalog/Home";
import "./catalog/catalog.css";
import Contact from "./Contact";
import RequestModal from "./catalog/Inquiry";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import "./App.css";
import "./components/HeaderAdminMenu.css";
import { locales } from "./locales";
import { supabase } from "./lib/supabaseClient";
import { useAuth } from "./context/AuthContext";
import FactoryPage from "./catalog/PublicFactory";
import { AdminList as FactoriesPage, AdminEditor as FactoryDetail } from "./catalog/Admin";

const DEFAULT_TEL_HREF = "+77715252683";

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

function App() {
  const [lang, setLangState] = useState(() => { try { return localStorage.getItem("skyvision-language") === "zh" ? "zh" : "ru"; } catch { return "ru"; } });
  const setLang = (value) => { setLangState(value); document.documentElement.lang = value === "zh" ? "zh-CN" : "ru"; try { localStorage.setItem("skyvision-language", value); } catch {} };
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

            <Link to="/prices" className="search-btn" aria-label={lang === "zh" ? "搜索产品" : "Поиск продукции"}>
              <FaSearch />
            </Link>

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
            <Route path="/" element={<Home lang={lang} openModal={openModal} />} />
            <Route path="/prices" element={<Prices lang={lang} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/factory/:slug" element={<FactoryPage lang={lang} />} />

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
