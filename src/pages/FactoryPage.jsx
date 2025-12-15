import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RequestModal from '../components/RequestModal';
import { locales } from '../locales';
import { supabase } from '../lib/supabaseClient';

export default function FactoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang] = useState('ru');
  const [showModal, setShowModal] = useState(false);
  const thumbnailsRef = useRef(null);

  const t = locales[lang]?.modal || {};

  useEffect(() => {
    const checkMobile = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('factories')
          .select('*, factory_prices(*), factory_media(*), factory_documents(*)')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        if (!mounted) return;

        if (!data) {
          setFactory(null);
          setMessage('Фабрика не найдена');
        } else {
          setFactory(data);
          setMessage(null);
        }
      } catch (err) {
        console.error('Failed to load factory', err);
        setFactory(null);
        setMessage('Ошибка загрузки данных');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // select most recent price (created_at) or first available
  function pickPrice(factoryObj) {
    if (!factoryObj || !Array.isArray(factoryObj.factory_prices) || factoryObj.factory_prices.length === 0) return null;
    const withDates = factoryObj.factory_prices.filter(p => p && p.created_at);
    if (withDates.length > 0) {
      return [...withDates].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
    }
    return factoryObj.factory_prices[0];
  }

  // derive photos array from factory_media (images first)
  function photosFromMedia(factoryObj) {
    if (!factoryObj || !Array.isArray(factoryObj.factory_media)) return [];
    const imgs = factoryObj.factory_media.filter(m => {
      const t = (m.file_type || '').toLowerCase();
      return m.url && (t.startsWith('image') || m.type === 'image' || /\.(jpe?g|png|gif|webp)$/i.test(m.url));
    });
    return imgs.map(m => m.url);
  }

  // documents
  function docsFromFactory(factoryObj) {
    if (!factoryObj) return [];
    return Array.isArray(factoryObj.factory_documents) ? factoryObj.factory_documents : [];
  }

  // keyboard navigation for modal images
  useEffect(() => {
    if (photoIndex === null) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setPhotoIndex(i => (i + 1) % photosFromMedia(factory).length);
      if (e.key === 'ArrowLeft') setPhotoIndex(i => (i - 1 + photosFromMedia(factory).length) % photosFromMedia(factory).length);
      if (e.key === 'Escape') setPhotoIndex(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photoIndex, factory]);

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
  if (!factory) return (
    <div style={{ padding: 20 }}>
      <p>{message || 'Фабрика не найдена'}</p>
      <button onClick={() => navigate('/prices')}>К списку</button>
    </div>
  );

  const priceRec = pickPrice(factory);
  const photos = photosFromMedia(factory);
  const documents = docsFromFactory(factory);

  // --- Styles (adapted from Harvest template you sent) ---
  const page = {
    background: "linear-gradient(120deg, #e8ecfd 60%, #f4f8ff 100%)",
    minHeight: "100vh",
    padding: isMobile ? "1rem" : "3rem 1rem",
    boxSizing: "border-box",
    position: "relative",
    fontFamily: "'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const glass = {
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 8px 48px 0 rgba(44,60,210,0.12), 0 1.5px 8px rgba(0,0,0,0.04)",
    borderRadius: isMobile ? "16px" : "2.3rem",
    maxWidth: "1100px",
    margin: "0 auto",
    overflow: "hidden",
    backdropFilter: "blur(4px)",
    border: "1.5px solid #f2f3fd",
    transition: "box-shadow 0.24s",
    position: "relative",
    paddingBottom: isMobile ? "1rem" : "2.2rem"
  };

  const header = {
    background: "linear-gradient(135deg, #192987 0%, #071a49 100%)",
    color: "#fff",
    padding: isMobile ? "1rem 1rem 0.9rem 1rem" : "2.2rem 2.6rem 1.3rem 2.6rem",
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: isMobile ? "16px" : "2.3rem",
    borderBottomRightRadius: isMobile ? "16px" : "2.3rem",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: isMobile ? "1.5rem" : "2.8rem",
    padding: isMobile ? "1.3rem" : "2.3rem 2.5rem 2.5rem 2.5rem",
  };

  const mediaCol = { display: "flex", flexDirection: "column", gap: "1.7rem", order: isMobile ? 2 : 1 };
  const infoCol = { lineHeight: 1.63, order: isMobile ? 1 : 2 };

  const sectionStyle = {
    marginBottom: "1.55rem",
    paddingBottom: "1.1rem",
    borderBottom: "1px solid #e0e6f3",
    background: "rgba(245,248,255,0.68)",
    borderRadius: "1.15rem",
    boxShadow: "0 1.5px 8px rgba(44,60,210,0.04)",
    padding: isMobile ? "1.1rem" : "1.25rem 1.5rem",
    transition: "box-shadow 0.18s"
  };

  const sectionTitleStyle = {
    color: "#1a237e",
    marginTop: 0,
    marginBottom: "0.85rem",
    fontSize: isMobile ? "1.08rem" : "1.19rem",
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    fontWeight: 700,
    letterSpacing: "-0.01em"
  };

  const thumbnailContainer = {
    display: "flex",
    gap: "0.7rem",
    overflowX: "auto",
    padding: "4px 0 12px 0",
    scrollbarWidth: "thin",
  };

  // small helper to format price display
  const priceText = priceRec ? `${priceRec.price ?? '—'} ${priceRec.currency || ''}` : '—';

  return (
    <div style={page}>
      <div style={glass}>
        <div style={header}>
          <h1 style={{ margin: 0, fontSize: isMobile ? "1.43rem" : "2.07rem", fontWeight: 800 }}>
            {factory.name}
          </h1>
          <p style={{ margin: "0.5rem 0 0", opacity: 0.94, display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <span style={{ background: "rgba(255,255,255,0.19)", borderRadius: "20px", padding: "3px 14px", display: "inline-flex", alignItems: "center" }}>
              {factory.city || '—'}
            </span>
            <span style={{ fontWeight: 700, color: "#ffe09d", background: "rgba(255,255,255,0.07)", borderRadius: "18px", padding:"3px 14px" }}>
              {priceRec ? `Price DAP ${priceRec.price} ${priceRec.currency || ''}` : 'Нет прайса'}
            </span>
          </p>
        </div>

        <div style={grid}>
          <div style={mediaCol}>
            {/* main media: if there is an image/video in media, show first image as large preview */}
            <div style={{ borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 8px 32px rgba(44,60,210,0.09)", position: "relative" }}>
              {photos && photos.length > 0 ? (
                <img src={photos[0]} alt="main" style={{ width: "100%", height: "380px", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: 380, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Нет медиа
                </div>
              )}
            </div>

            <div>
              <h3 style={{ ...sectionTitleStyle, marginBottom: "0.6rem" }}>Галерея производства</h3>
              <div ref={thumbnailsRef} style={thumbnailContainer} onWheel={(e) => {
                if (thumbnailsRef.current) {
                  e.preventDefault();
                  thumbnailsRef.current.scrollLeft += e.deltaY;
                }
              }}>
                {photos.length > 0 ? photos.map((src, i) => (
                  <div key={i} onClick={() => setPhotoIndex(i)} style={{ flex: "0 0 auto", width: "106px", height: "80px", borderRadius: "11px", overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 10px rgba(44,60,210,0.10)" }}>
                    <img src={src} alt={`thumb-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )) : <div>Нет фотографий</div>}
              </div>
            </div>
          </div>

          <div style={infoCol}>
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Прайс и условия</h3>
              <ul style={{ margin: 0, paddingLeft: "1rem", listStyleType: "none" }}>
                <li style={{ marginBottom: "0.6rem" }}>
                  <strong>💰 Цена со склада:</strong> {priceRec ? `${priceRec.price} ${priceRec.currency}` : '—'}
                </li>
                <li style={{ marginBottom: "0.6rem" }}>
                  <strong>🚚 Логистика + план:</strong> {factory.logistics ?? '—'} $/т
                </li>
                <li>
                  <strong>🌐 DAP до границы:</strong> {priceRec ? (priceRec.price ? `${priceRec.price + (Number(factory.logistics) || 0)} $/т` : '—') : '—'}
                </li>
              </ul>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Информация</h3>
              <div><strong>Адрес / город:</strong> {factory.city || '—'}</div>
              <div><strong>Мин. партия:</strong> {factory.min_order ?? '—'}</div>
              <div><strong>Условия оплаты:</strong> {factory.payment_terms || '—'}</div>
              <div style={{ marginTop: 10 }}>{factory.description}</div>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>Документы</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {documents && documents.length > 0 ? documents.map(d => (
                  <a key={d.id || d.url} href={d.url} target="_blank" rel="noreferrer" style={{ padding: "0.7rem", background: "#f7faff", borderRadius: 8, textDecoration: "none", color: "#1a237e" }}>
                    {d.title || d.name || d.storage_path?.split('/').pop() || d.url}
                  </a>
                )) : <div>Нет документов</div>}
              </div>
            </div>

            <button onClick={() => setShowModal(true)} style={{ width: "100%", padding: isMobile ? "12px" : "16px", background: "linear-gradient(135deg,#1a237e,#233aaf)", color: "#fff", border: 0, borderRadius: 12, cursor: "pointer", fontWeight: 700 }}>
              {t.title || 'Оставить заявку'}
            </button>
          </div>
        </div>
      </div>

      {/* photo overlay */}
      {photoIndex !== null && photos && photos.length > 0 && (
        <div onClick={() => setPhotoIndex(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1200, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i - 1 + photos.length) % photos.length); }} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", fontSize: 28, color: "#fff", background: "transparent", border: 0 }}>‹</button>
          <img src={photos[photoIndex]} alt="large" style={{ maxWidth: "94vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i + 1) % photos.length); }} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", fontSize: 28, color: "#fff", background: "transparent", border: 0 }}>›</button>
        </div>
      )}

      {showModal && (
        <RequestModal factoryName={factory.name} onClose={() => setShowModal(false)} t={t} />
      )}
    </div>
  );
}
