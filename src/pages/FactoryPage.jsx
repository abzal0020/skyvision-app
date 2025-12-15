import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RequestModal from '../components/RequestModal';
import { locales } from '../locales';
import { supabase } from '../lib/supabaseClient';
import './FactoryPage.css';

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

  function pickPrice(factoryObj) {
    if (!factoryObj || !Array.isArray(factoryObj.factory_prices) || factoryObj.factory_prices.length === 0) return null;
    const withDates = factoryObj.factory_prices.filter(p => p && p.created_at);
    if (withDates.length > 0) {
      return [...withDates].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
    }
    return factoryObj.factory_prices[0];
  }

  function photosFromMedia(factoryObj) {
    if (!factoryObj || !Array.isArray(factoryObj.factory_media)) return [];
    const imgs = factoryObj.factory_media.filter(m => {
      const t = (m.file_type || '').toLowerCase();
      return m.url && (t.startsWith('image') || m.type === 'image' || /\.(jpe?g|png|gif|webp)$/i.test(m.url));
    });
    return imgs.map(m => m.url);
  }

  function docsFromFactory(factoryObj) {
    if (!factoryObj) return [];
    return Array.isArray(factoryObj.factory_documents) ? factoryObj.factory_documents : [];
  }

  useEffect(() => {
    if (photoIndex === null) return;
    const onKey = (e) => {
      const photos = photosFromMedia(factory);
      if (!photos.length) return;
      if (e.key === 'ArrowRight') setPhotoIndex(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'Escape') setPhotoIndex(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photoIndex, factory]);

  if (loading) return <div className="fp-loading">Загрузка...</div>;
  if (!factory) return (
    <div className="fp-loading">
      <p>{message || 'Фабрика не найдена'}</p>
      <button onClick={() => navigate('/prices')}>К списку</button>
    </div>
  );

  const priceRec = pickPrice(factory);
  const photos = photosFromMedia(factory);
  const documents = docsFromFactory(factory);

  return (
    <div className={`factory-page ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="factory-glass">
        <div className="factory-header">
          <div className="header-decoration" />
          <h1 className="factory-title">{factory.name}</h1>
          <p className="factory-sub">
            <span className="factory-city">{factory.city || '—'}</span>
            <span className="price-badge">
              {priceRec ? `Price DAP ${priceRec.price} ${priceRec.currency || ''}` : 'Нет прайса'}
            </span>
          </p>

          <div className="lang-switch">
            <button onClick={() => setLang('ru')} className={lang === 'ru' ? 'active' : ''}>RU</button>
            <button onClick={() => setLang('zh')} className={lang === 'zh' ? 'active' : ''}>中文</button>
          </div>
        </div>

        <div className="factory-grid">
          <div className="media-col">
            <div className="main-media">
              {photos && photos.length > 0 ? (
                <img src={photos[0]} alt="main" className="main-media-img" />
              ) : (
                <div className="no-media">Нет медиа</div>
              )}
            </div>

            <div className="gallery-section">
              <h3 className="section-title">Галерея производства</h3>
              <div
                className="thumbnail-container"
                ref={thumbnailsRef}
                onWheel={(e) => {
                  if (thumbnailsRef.current) {
                    e.preventDefault();
                    thumbnailsRef.current.scrollLeft += e.deltaY;
                  }
                }}
              >
                {photos.length > 0 ? photos.map((src, i) => (
                  <div
                    key={i}
                    className={`gallery-thumb ${photoIndex === i ? 'active' : ''}`}
                    onClick={() => setPhotoIndex(i)}
                  >
                    <img src={src} alt={`thumb-${i}`} />
                  </div>
                )) : <div className="no-photos">Нет фотографий</div>}
              </div>
            </div>
          </div>

          <div className="info-col">
            <div className="section">
              <h3 className="section-title">Прайс и условия</h3>
              <ul className="info-list">
                <li><strong>💰 Цена со склада:</strong> {priceRec ? `${priceRec.price} ${priceRec.currency}` : '—'}</li>
                <li><strong>🚚 Логистика + план:</strong> {factory.logistics ?? '—'} $/т</li>
                <li><strong>🌐 DAP до границы:</strong> {priceRec ? (priceRec.price ? `${priceRec.price + (Number(factory.logistics) || 0)} $/т` : '—') : '—'}</li>
              </ul>
            </div>

            <div className="section">
              <h3 className="section-title">Информация</h3>
              <div><strong>Адрес / город:</strong> {factory.city || '—'}</div>
              <div><strong>Мин. партия:</strong> {factory.min_order ?? '—'}</div>
              <div><strong>Условия оплаты:</strong> {factory.payment_terms || '—'}</div>
              <div className="factory-desc">{factory.description}</div>
            </div>

            <div className="section">
              <h3 className="section-title">Документы</h3>
              <div className="docs-grid">
                {documents && documents.length > 0 ? documents.map(d => (
                  <a key={d.id || d.url} href={d.url} target="_blank" rel="noreferrer" className="doc-card">
                    {d.title || d.name || d.storage_path?.split('/').pop() || d.url}
                  </a>
                )) : <div>Нет документов</div>}
              </div>
            </div>

            <button className="request-btn" onClick={() => setShowModal(true)}>
              {t.title || 'Оставить заявку'}
            </button>
          </div>
        </div>
      </div>

      {/* photo overlay */}
      {photoIndex !== null && photos && photos.length > 0 && (
        <div className="photo-overlay" onClick={() => setPhotoIndex(null)}>
          <button className="nav-left" onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i - 1 + photos.length) % photos.length); }}>‹</button>
          <img src={photos[photoIndex]} alt="large" className="overlay-img" onClick={(e) => e.stopPropagation()} />
          <button className="nav-right" onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i + 1) % photos.length); }}>›</button>
        </div>
      )}

      {showModal && <RequestModal factoryName={factory.name} onClose={() => setShowModal(false)} t={t} />}
    </div>
  );
}
