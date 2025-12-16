// обновлённый FactoryPage (только те правки, которые нужны для signed URL fallback)
// Вставь поверх существующего файла или интегрируй правки в свой компонент

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
  const [resolvedPhotos, setResolvedPhotos] = useState([]); // <- сюда попадут окончательные url
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

  // выбирает цену как раньше
  function pickPrice(factoryObj) {
    if (!factoryObj || !Array.isArray(factoryObj.factory_prices) || factoryObj.factory_prices.length === 0) return null;
    const withDates = factoryObj.factory_prices.filter(p => p && p.created_at);
    if (withDates.length > 0) {
      return [...withDates].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
    }
    return factoryObj.factory_prices[0];
  }

  // Возвращаем массив объектов { url, storage_path } чтобы знать, для каких нужно сделать signed url
  function mediaItems(factoryObj) {
    if (!factoryObj || !Array.isArray(factoryObj.factory_media)) return [];
    return factoryObj.factory_media
      .filter(m => {
        const t = (m.file_type || '').toLowerCase();
        // допускаем либо уже имеющийся url, либо storage_path (для изображений)
        return (m.url || m.storage_path) && (t.startsWith('image') || m.type === 'image' || /\.(jpe?g|png|gif|webp)$/i.test(m.storage_path || ''));
      })
      .map(m => ({
        id: m.id || m.storage_path,
        storage_path: m.storage_path,
        url: m.url || null
      }));
  }

  // Запрашиваем signed URL для тех элементов, у которых нет url
  useEffect(() => {
    let mounted = true;
    async function resolveUrls() {
      if (!factory) {
        setResolvedPhotos([]);
        return;
      }
      const items = mediaItems(factory);
      // начальный массив: если url есть — используем его, иначе null placeholder
      const initial = items.map(it => it.url || null);
      setResolvedPhotos(initial);

      // для каждого item без url сделаем запрос на серверный endpoint
      const promises = items.map(async (it, idx) => {
        if (it.url) return it.url;
        try {
          const q = '/api/media/signed?path=' + encodeURIComponent(it.storage_path) + '&expires=3600';
          const resp = await fetch(q);
          if (!resp.ok) {
            console.warn('signed fetch failed', resp.status, await resp.text());
            return null;
          }
          const json = await resp.json();
          return json.signedUrl || null;
        } catch (e) {
          console.error('signed url error', e);
          return null;
        }
      });

      const results = await Promise.all(promises);
      if (!mounted) return;
      // results is array of urls (or null). Prefer existing it.url over fetched result
      const finalUrls = items.map((it, idx) => it.url || results[idx]).filter(Boolean);
      setResolvedPhotos(finalUrls);
    }

    resolveUrls();
    return () => { mounted = false; };
  }, [factory]);

  useEffect(() => {
    if (photoIndex === null) return;
    const onKey = (e) => {
      const photos = resolvedPhotos;
      if (!photos.length) return;
      if (e.key === 'ArrowRight') setPhotoIndex(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'Escape') setPhotoIndex(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photoIndex, resolvedPhotos]);

  if (loading) return <div className="fp-loading">Загрузка...</div>;
  if (!factory) return (
    <div className="fp-loading">
      <p>{message || 'Фабрика не найдена'}</p>
      <button onClick={() => navigate('/prices')}>К списку</button>
    </div>
  );

  const priceRec = pickPrice(factory);
  const photos = resolvedPhotos; // используем resolvedPhotos для рендера
  const documents = Array.isArray(factory.factory_documents) ? factory.factory_documents : [];

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
            {/* ... остальной UI без изменений ... */}
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
