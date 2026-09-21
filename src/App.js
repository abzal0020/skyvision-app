import React, { useState } from "react";
import Portal from "./portal/Portal";
import Network from "./portal/Network";
import Deals from "./portal/Deals";
import CompanyPage from "./portal/CompanyPage";
import Marketplace from "./portal/Marketplace";
import { CompanyProvider } from "./portal/CompanyContext";
import useAdmin from "./catalog/useAdmin";
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
  const { admin: isAdmin } = useAdmin();
  const [open, setOpen] = useState(false);

  const labels = lang === "zh"
    ? {
        login: "登录",
        admin: "工作空间",
        email: "Email",
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
        admin: "Кабинет",
        email: "Email",
        password: "Пароль",
        signing: "Входим...",
        submit: "Войти",
        openPanel: "Открыть админку",
        logout: "Выйти",
        loading: "Загрузка...",
        error: "Не удалось войти",
      };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
  };

  if (!user) return <Link className="platform-entry" to="/portal">{lang === "zh" ? "登录平台" : "Войти в платформу"}</Link>;

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
          {(
            <>
              <div className="admin-panel-user">
                <span>{userLabel}</span>
                {profile?.role && <small>{profile.role}</small>}
              </div>
              <Link className="admin-panel-link" to="/network/me" onClick={() => setOpen(false)}>{lang === "zh" ? "我的资料与好友" : "Мой профиль и друзья"}</Link>
              <Link className="admin-panel-link" to="/portal" onClick={() => setOpen(false)}>{lang === "zh" ? "企业工作空间" : "Кабинет компании"}</Link>
              {isAdmin && <Link className="admin-panel-link" to="/admin/factories" onClick={() => setOpen(false)}>{labels.openPanel}</Link>}
              <button type="button" className="admin-panel-secondary" onClick={handleSignOut}>
                {labels.logout}
              </button>
            </>
          )}

        </div>
      )}
    </div>
  );
}

function App() {
  const { user } = useAuth();
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
      <CompanyProvider>
      <div className="app-wrapper">
        <header>
          <Link to="/" className="logo">{t.logo}</Link>
          <nav className="nav">
            <Link to="/">{t.nav.main}</Link>
            {user ? <>
              <Link to="/marketplace">{lang === "zh" ? "市场" : "Маркетплейс"}</Link>
              <Link to="/prices">{t.nav.prices}</Link>
              <Link to="/network">{lang === "zh" ? "联系人" : "Люди"}</Link>
            </> : <>
              <a href="/#participants">{lang === "zh" ? "平台参与者" : "Для кого"}</a>
              <a href="/#how-it-works">{lang === "zh" ? "使用流程" : "Как это работает"}</a>
            </>}
            <Link to="/contact">{t.nav.contact}</Link>
          </nav>

          <div className="header-actions">
            <a className="header-contacts" href={`tel:${DEFAULT_TEL_HREF}`} aria-label={`Позвонить ${t.hero.phone}`}>
              <FaPhone />
              <span>{t.hero.phone}</span>
            </a>

            {user && <Link to="/prices" className="search-btn" aria-label={lang === "zh" ? "搜索产品" : "Поиск продукции"}>
              <FaSearch />
            </Link>}

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
            <Route path="/network/*" element={<Network lang={lang} />} />
            <Route path="/deals/*" element={<Deals lang={lang} />} />
            <Route path="/company/:id" element={<CompanyPage lang={lang} />} />
            <Route path="/portal/*" element={<Portal lang={lang} />} />
            <Route path="/marketplace" element={<Marketplace lang={lang} />} />
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
      </CompanyProvider>
    </Router>
  );
}

export default App;
