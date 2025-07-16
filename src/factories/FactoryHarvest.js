// FactoryHarvest.js — улучшенный современный дизайн
import React, { useState, useEffect, useRef } from "react";
import RequestModal from "../components/RequestModal";

function FactoryHarvest() {
  const [showModal, setShowModal] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const thumbnailsRef = useRef(null);

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

  // Определение мобильного устройства и обработка ресайза
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Обработка клавиш для галереи
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

  // Стили
  const page = {
    background: "#f6f7fb",
    minHeight: "100vh",
    padding: isMobile ? "1rem" : "3rem 1rem",
  };

  const card = {
    background: "#fff",
    maxWidth: "1000px",
    margin: "0 auto",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const header = {
    background: "linear-gradient(135deg, #000080 0%, #1a237e 100%)",
    color: "#fff",
    padding: isMobile ? "1rem" : "1.5rem 2rem",
    position: "relative",
    overflow: "hidden"
  };

  const headerDecoration = {
    position: "absolute",
    top: "-50px",
    right: "-50px",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: isMobile ? "1.5rem" : "2rem",
    padding: isMobile ? "1.5rem" : "2rem",
  };

  const mediaCol = { 
    display: "flex", 
    flexDirection: "column", 
    gap: "1.5rem",
    order: isMobile ? 2 : 1
  };

  const infoCol = { 
    lineHeight: 1.6,
    order: isMobile ? 1 : 2
  };

  const bigImg = {
    width: "100%",
    maxHeight: "80vh",
    objectFit: "contain",
    borderRadius: "10px",
  };

  const overlay = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0,0,0,0.92)",
    padding: isMobile ? "1rem" : "2rem",
    overflowY: "auto"
  };

  const arrowBase = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: isMobile ? 50 : 60,
    height: isMobile ? 50 : 60,
    border: 0,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: isMobile ? 24 : 28,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
    backdropFilter: "blur(4px)",
    zIndex: 1001
  };

  const sectionStyle = {
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #f0f0f0"
  };

  const sectionTitleStyle = {
    color: "#1a237e",
    marginTop: 0,
    marginBottom: "0.75rem",
    fontSize: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  };

  const thumbnailContainer = {
    display: "flex",
    gap: "0.5rem",
    overflowX: "auto",
    padding: "4px 0 12px 0",
    scrollbarWidth: "thin",
    msOverflowStyle: "none",
    scrollbarColor: "#d0d0d0 transparent",
  };

  return (
    <div style={page}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <div style={headerDecoration}></div>
          <h1 style={{ margin: 0, fontSize: isMobile ? "1.5rem" : "1.8rem" }}>Harvest (Azamat)</h1>
          <p style={{ 
            margin: "0.5rem 0 0", 
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: isMobile ? "0.9rem" : "1rem"
          }}>
            <span style={{ 
              background: "rgba(255,255,255,0.2)", 
              borderRadius: "20px", 
              padding: "2px 10px",
              display: "inline-flex",
              alignItems: "center"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: "4px" }}>
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor"/>
                <path d="M12 11.5C13.1046 11.5 14 10.6046 14 9.5C14 8.39543 13.1046 7.5 12 7.5C10.8954 7.5 10 8.39543 10 9.5C10 10.6046 10.8954 11.5 12 11.5Z" fill="#000080"/>
              </svg>
              Костанай
            </span>
            <span style={{ fontWeight: 600 }}>Price DAP 257 $/т</span>
          </p>
        </div>

        {/* Main grid */}
        <div style={grid}>
          {/* media column */}
          <div style={mediaCol}>
            {/* video */}
            <div style={{ 
              borderRadius: "12px", 
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              position: "relative"
            }}>
              <video
                controls
                style={{
                  width: "100%",
                  display: "block"
                }}>
                <source src="/videos/harvest/harvestv2.mp4" type="video/mp4" />
                <source src="/videos/harvest/harvestv1.mp4" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            </div>

            {/* thumbnails */}
            <div style={{ position: "relative" }}>
              <h3 style={{ 
                ...sectionTitleStyle,
                marginBottom: "0.5rem" 
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#1a237e"/>
                </svg>
                Галерея производства
              </h3>
              <div 
                ref={thumbnailsRef}
                style={thumbnailContainer}
                onWheel={(e) => {
                  if (thumbnailsRef.current) {
                    e.preventDefault();
                    thumbnailsRef.current.scrollLeft += e.deltaY;
                  }
                }}
              >
                {photos.map((src, i) => (
                  <div 
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    style={{
                      flex: "0 0 auto",
                      width: "100px",
                      height: "80px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                      position: "relative",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.12)";
                    }}
                  >
                    <img
                      src={src}
                      alt="thumb"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* info column */}
          <div style={infoCol}>
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#1a237e"/>
                </svg>
                Прайс и условия
              </h3>
              <ul style={{ 
                margin: "0.5rem 0", 
                paddingLeft: "1.5rem",
                listStyleType: "none"
              }}>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "flex-start" }}>
                  <div style={{ 
                    background: "#e8f5e9", 
                    borderRadius: "50%", 
                    width: "24px", 
                    height: "24px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "8px",
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#4caf50">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>💰 Цена со склада:</strong> 225 $/т
                    <div style={{ fontSize: "0.9em", color: "#666", marginTop: "2px" }}>Без учета доставки</div>
                  </div>
                </li>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "flex-start" }}>
                  <div style={{ 
                    background: "#e3f2fd", 
                    borderRadius: "50%", 
                    width: "24px", 
                    height: "24px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "8px",
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#2196f3">
                      <path d="M20 8H17V4H7V8H4C2.9 8 2 8.9 2 10V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V10C22 8.9 21.1 8 20 8ZM9 6H15V8H9V6ZM20 20H4V10H20V20ZM13 12V18H11V12H13Z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>🚚 Логистика + план:</strong> 32 $/т
                    <div style={{ fontSize: "0.9em", color: "#666", marginTop: "2px" }}>До границы РФ/Казахстан</div>
                  </div>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ 
                    background: "#fff8e1", 
                    borderRadius: "50%", 
                    width: "24px", 
                    height: "24px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "8px",
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff9800">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>🌐 DAP до границы:</strong> 257 $/т
                    <div style={{ fontSize: "0.9em", color: "#666", marginTop: "2px" }}>Все включено</div>
                  </div>
                </li>
              </ul>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#1a237e"/>
                </svg>
                Документы
              </h3>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                gap: "0.75rem"
              }}>
                {documents.map((d) => (
                  <a 
                    key={d.url} 
                    href={d.url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0.75rem",
                      background: "#f5f7ff",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#1a237e",
                      transition: "all 0.2s",
                      border: "1px solid #e0e0e0"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.background = "#e8ebff";
                      e.currentTarget.transform = "translateY(-2px)";
                      e.currentTarget.boxShadow = "0 4px 8px rgba(0,0,100,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.background = "#f5f7ff";
                      e.currentTarget.transform = "translateY(0)";
                      e.currentTarget.boxShadow = "none";
                    }}
                  >
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "#1a237e",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "12px",
                      flexShrink: 0
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"/>
                      </svg>
                    </div>
                    <span style={{ fontWeight: 500 }}>{d.name}</span>
                  </a>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15.4V3.4L19 9.4L12 15.4ZM21 15C21 16.7 19.7 18.1 18 18.3V18H6V18.3C4.3 18.1 3 16.7 3 15V5C3 3.9 3.9 3 5 3H7V1H9V3H15V1H17V3H19C20.1 3 21 3.9 21 5V15Z" fill="#1a237e"/>
                </svg>
                Описание
              </h3>
              <p style={{ 
                margin: "0.5rem 0", 
                lineHeight: 1.7,
                background: "#f9faff",
                padding: "1rem",
                borderRadius: "8px",
                borderLeft: "3px solid #1a237e"
              }}>
                <strong>Harvest (Azamat)</strong> — современное производство с высокими стандартами качества ISO 9001. 
                Специализируемся на производстве премиальных сортов муки. 
                Предлагаем стабильные объёмы поставок и гибкие условия сотрудничества.
              </p>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 2H4C3 2 2 2.9 2 4V7.01C2 7.73 2.43 8.35 3 8.7V20C3 21.1 4.1 22 5 22H19C19.9 22 21 21.1 21 20V8.7C21.57 8.35 22 7.73 22 7.01V4C22 2.9 21 2 20 2ZM19 20H5V9H19V20ZM20 7H4V4H20V7Z" fill="#1a237e"/>
                  <path d="M15 12H9V14H15V12Z" fill="#1a237e"/>
                </svg>
                Упаковка и отгрузка
              </h3>
              <ul style={{ 
                margin: "0.5rem 0", 
                paddingLeft: "1.5rem",
                listStyleType: "none"
              }}>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center" }}>
                  <div style={{ 
                    width: "24px", 
                    height: "24px", 
                    background: "#f5f7ff", 
                    borderRadius: "6px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "10px",
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a237e">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z"/>
                    </svg>
                  </div>
                  <span><strong>📦 Мешки по 50 кг</strong> - двойная упаковка</span>
                </li>
                <li style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ 
                    width: "24px", 
                    height: "24px", 
                    background: "#f5f7ff", 
                    borderRadius: "6px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "10px",
                    flexShrink: 0
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a237e">
                      <path d="M20 8H17V4H7V8H4C2.9 8 2 8.9 2 10V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V10C22 8.9 21.1 8 20 8ZM9 6H15V8H9V6ZM20 20H4V10H20V20ZM13 12V18H11V12H13Z"/>
                    </svg>
                  </div>
                  <span><strong>🚛 Отгрузка:</strong> 48 часов после оплаты</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowModal(true)}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: "linear-gradient(135deg, #000080 0%, #1a237e 100%)",
                color: "#fff",
                border: 0,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(26, 35, 126, 0.25)",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.background = "linear-gradient(135deg, #1a237e 0%, #303f9f 100%)";
                e.currentTarget.boxShadow = "0 6px 16px rgba(26, 35, 126, 0.35)";
                e.currentTarget.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.background = "linear-gradient(135deg, #000080 0%, #1a237e 100%)";
                e.currentTarget.boxShadow = "0 4px 12px rgba(26, 35, 126, 0.25)";
                e.currentTarget.transform = "translateY(0)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM19 18H5C4.45 18 4 17.55 4 17V8L10.94 12.34C11.59 12.75 12.41 12.75 13.06 12.34L20 8V17C20 17.55 19.55 18 19 18ZM12 11L4 6H20L12 11Z"/>
              </svg>
              Оставить заявку
            </button>
          </div>
        </div>
      </div>

      {/* ----- фотомодал ----- */}
      {photoIndex !== null && (
        <div style={overlay} onClick={() => setPhotoIndex(null)}>
          {/* Close button */}
          <button
            style={{
              position: "absolute",
              top: isMobile ? "16px" : "24px",
              right: isMobile ? "16px" : "24px",
              background: "rgba(255,255,255,0.15)",
              border: 0,
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 1001
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIndex(null);
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          {/* arrows */}
          <button
            style={{ ...arrowBase, left: isMobile ? "12px" : "24px" }}
            onClick={(e) => { 
              e.stopPropagation(); 
              setPhotoIndex((i) => (i - 1 + photos.length) % photos.length); 
            }}
            onMouseEnter={(e) => e.currentTarget.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={(e) => e.currentTarget.background = "rgba(255,255,255,0.15)"}
          >
            ❮
          </button>
          <button
            style={{ ...arrowBase, right: isMobile ? "12px" : "24px" }}
            onClick={(e) => { 
              e.stopPropagation(); 
              setPhotoIndex((i) => (i + 1) % photos.length); 
            }}
            onMouseEnter={(e) => e.currentTarget.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={(e) => e.currentTarget.background = "rgba(255,255,255,0.15)"}
          >
            ❯
          </button>

          <div style={{ 
            position: "relative",
            width: "100%",
            maxWidth: "90vw",
            textAlign: "center"
          }}>
            <img
              src={photos[photoIndex]}
              alt="big"
              style={bigImg}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* counter */}
          <div style={{ 
            color: "#fff", 
            marginTop: "16px",
            fontSize: "1.1rem",
            textAlign: "center",
            background: "rgba(0,0,0,0.5)",
            padding: "6px 16px",
            borderRadius: "20px"
          }}>
            {photoIndex + 1} / {photos.length}
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