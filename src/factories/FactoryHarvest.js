// FactoryHarvest.js — улучшенный современный дизайн
import React, { useState, useEffect } from "react";
import RequestModal from "../components/RequestModal";

function FactoryHarvest() {
  const [showModal, setShowModal] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(null);

  const photos = [
    "/photos/harvest/harvest/photo1.jpeg",
    "/photos/harvest/harvest/photo2.jpeg",
    "/photos/harvest/harvest/photo3.jpeg",
    "/photos/harvest/harvest/photo4.jpeg",
    "/photos/harvest/harvest/photo5.jpeg",
  ];

  const documents = [
    { name: "Сертификат качества", url: "/docs/harvest/certificate1.pdf" },
    { name: "Анализ продукции", url: "/docs/harvest/analysis1.jpg" },
    {
      name: "Протокол ПКМ от 29.01.2025",
      url: "/docs/harvest/harvest/Протокол%20ПКМ_29.01.2025.pdf",
    },
  ];

  /* ----------------- клавиши ----------------- */
  useEffect(() => {
    if (photoIndex === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") setPhotoIndex((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "Escape") setPhotoIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photoIndex, photos.length]);

  /* ----------------- стили ----------------- */
  const page = {
    background: "#f6f7fb",
    minHeight: "100vh",
    padding: "3rem 1rem",
  };

  const card = {
    background: "#fff",
    maxWidth: "1000px",
    margin: "0 auto",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    overflow: "hidden",
  };

  const header = {
    background: "#000080",
    color: "#fff",
    padding: "1.5rem 2rem",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    padding: "2rem",
  };

  const mediaCol = { display: "flex", flexDirection: "column", gap: "1.5rem" };

  const infoCol = { lineHeight: 1.6 };

  const bigImg = {
    maxWidth: "90%",
    maxHeight: "80vh",
    borderRadius: "10px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  };

  const overlay = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(255,255,255,0.8)", // лёгкий белый вуаль
    backdropFilter: "blur(2px)",
    padding: "2rem 1rem",
  };

  const arrowBase = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    border: 0,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    fontSize: 26,
    cursor: "pointer",
  };

  return (
    <div style={page}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <h1 style={{ margin: 0 }}>Harvest (Azamat)</h1>
          <p style={{ margin: 0, opacity: 0.85 }}>Костанай · Price DAP 257 $/т</p>
        </div>

        {/* Main grid */}
        <div style={grid}>
          {/* media column */}
          <div style={mediaCol}>
            {/* video */}
            <video
              controls
              style={{
                width: "100%",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}>
              <source src="/videos/harvest/harvestv2.mp4" type="video/mp4" />
              <source src="/videos/harvest/harvestv1.mp4" type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>

            {/* thumbnails */}
            <div style={{ display: "flex", gap: 8 }}>
              {photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="thumb"
                  onClick={() => setPhotoIndex(i)}
                  style={{
                    flex: 1,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 6,
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    transition: "0.2s transform",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ))}
            </div>
          </div>

          {/* info column */}
          <div style={infoCol}>
            <h3>Прайс</h3>
            <ul>
              <li>💰 Цена со склада: 225 $/т</li>
              <li>🚚 Логистика + план: 32 $/т</li>
              <li>🌐 DAP до границы: 257 $/т</li>
            </ul>

            <h3>Документы</h3>
            <ul>
              {documents.map((d) => (
                <li key={d.url}>📄 <a href={d.url} target="_blank" rel="noreferrer">{d.name}</a></li>
              ))}
            </ul>

            <h3>Описание</h3>
            <p>Harvest (Azamat) — крупный производитель с высокими стандартами качества.
               Предлагает стабильные объёмы и гибкие условия поставок.</p>

            <h3>Упаковка и отгрузка</h3>
            <ul>
              <li>📦 Мешки по 50 кг</li>
              <li>🚛 Быстрая отгрузка и гибкие логистические решения</li>
            </ul>

            <button
              onClick={() => setShowModal(true)}
              style={{
                marginTop: 16,
                padding: "12px 24px",
                background: "#000080",
                color: "#fff",
                border: 0,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 16,
              }}>
              Оставить заявку
            </button>
          </div>
        </div>
      </div>

      {/* ----- фотомодал ----- */}
      {photoIndex !== null && (
        <div style={overlay} onClick={() => setPhotoIndex(null)}>
          {/* arrows */}
          <button
            style={{ ...arrowBase, left: 20 }}
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i - 1 + photos.length) % photos.length); }}>
            ❮
          </button>
          <button
            style={{ ...arrowBase, right: 20 }}
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => (i + 1) % photos.length); }}>
            ❯
          </button>

          <img
            src={photos[photoIndex]}
            alt="big"
            style={bigImg}
            onClick={(e) => e.stopPropagation()}
          />

          {/* dots */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
            {photos.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setPhotoIndex(idx)}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: idx === photoIndex ? "#000080" : "#bbb",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ----- форма заявки ----- */}
      {showModal && (
        <RequestModal factoryName="Harvest (Azamat)" onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default FactoryHarvest;
