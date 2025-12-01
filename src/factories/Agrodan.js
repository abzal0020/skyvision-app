// FactoryAgrodan.js — сделано в том же стиле, что и Harvest
import React, { useState, useEffect } from "react";
import RequestModal from "../components/RequestModal";

function FactoryAgrodan() {
  const [showModal, setShowModal] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(null);

  const photos = [
    "/photos/agrodan/photo1.jpeg",
    "/photos/agrodan/photo2.jpeg",
    "/photos/agrodan/photo3.jpeg",
  ];

  const documents = [
    { name: "Сертификат качества", url: "/docs/agrodan/certificate1.pdf" },
    { name: "Анализ продукции",   url: "/docs/agrodan/analysis1.jpg" }
  ];

  /* клавиши */
  useEffect(() => {
    if (photoIndex === null) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") setPhotoIndex((i)=>(i+1)%photos.length);
      if (e.key === "ArrowLeft")  setPhotoIndex((i)=>(i-1+photos.length)%photos.length);
      if (e.key === "Escape")     setPhotoIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photoIndex, photos.length]);

  /* стили, такие же как в Harvest */
  const page = { background: "#f6f7fb", minHeight: "100vh", padding: "3rem 1rem" };
  const card = { background: "#fff", maxWidth: 1000, margin: "0 auto", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" };
  const header = { background: "#000080", color: "#fff", padding: "1.5rem 2rem" };
  const grid  = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", padding: "2rem" };
  const mediaCol = { display: "flex", flexDirection: "column", gap: "1.5rem" };
  const infoCol  = { lineHeight: 1.6 };
  const overlay = { position: "fixed", inset:0, zIndex:1000, background:"rgba(255,255,255,0.8)", backdropFilter:"blur(2px)", display:"flex", flexDirection:"column", alignItems:"center", padding:"2rem 1rem" };
  const bigImg = { maxWidth:"90%", maxHeight:"80vh", borderRadius:10, boxShadow:"0 6px 18px rgba(0,0,0,0.25)" };
  const arrowBase = { position:"absolute", top:"50%", transform:"translateY(-50%)", width:44, height:44, border:0, borderRadius:"50%", background:"rgba(0,0,0,0.45)", color:"#fff", fontSize:26, cursor:"pointer", lineHeight:"44px", textAlign:"center" };

  return (
    <div style={page}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <h1 style={{margin:0}}>Agrodan KsT</h1>
          <p style={{margin:0, opacity:0.85}}>Костанай · Price DAP 228 $/т</p>
        </div>

        <div style={grid}>
          {/* MEDIA */}
          <div style={mediaCol}>
            <video controls style={{width:"100%", borderRadius:10, boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
              <source src="/videos/Agrodan/Agrodanvideo.mp4" type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
            <div style={{display:"flex", gap:8}}>
              {photos.map((s,i)=>(
                <img key={i} src={s} alt="thumb" onClick={()=>setPhotoIndex(i)}
                     style={{flex:1,height:80,objectFit:"cover",borderRadius:6,cursor:"pointer",boxShadow:"0 2px 6px rgba(0,0,0,0.08)"}}/>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div style={infoCol}>
            <h3>Прайс</h3>
            <ul>
              <li>💰 Цена со склада: 190 $/т</li>
              <li>🚚 Логистика + план: 38 $/т</li>
              <li>🌐 DAP до границы: 228 $/т</li>
            </ul>

            <h3>Документы</h3>
            <ul>
              {documents.map(d=>(
                <li key={d.url}>📄 <a href={d.url} target="_blank" rel="noreferrer">{d.name}</a></li>
              ))}
            </ul>

            <h3>Описание</h3>
            <p>Agrodan KsT — производитель с быстрыми загрузками и устойчивым качеством продукции.</p>

            <h3>Упаковка и отгрузка</h3>
            <ul>
              <li>📦 Мешки по 50 кг</li>
              <li>🚛 До 3 вагонов в день</li>
            </ul>

            <button onClick={()=>setShowModal(true)} style={{marginTop:16,padding:"12px 24px",background:"#000080",color:"#fff",border:0,borderRadius:6,cursor:"pointer",fontSize:16}}>Оставить заявку</button>
          </div>
        </div>
      </div>

      {/* Photo modal */}
      {photoIndex!==null && (
        <div style={overlay} onClick={()=>setPhotoIndex(null)}>
          <button style={{...arrowBase,left:20}} onClick={e=>{e.stopPropagation();setPhotoIndex(i=>(i-1+photos.length)%photos.length);}}>❮</button>
          <button style={{...arrowBase,right:20}} onClick={e=>{e.stopPropagation();setPhotoIndex(i=>(i+1)%photos.length);}}>❯</button>
          <img src={photos[photoIndex]} alt="big" style={bigImg} onClick={e=>e.stopPropagation()}/>
          <div style={{display:"flex",gap:8,marginTop:12}} onClick={e=>e.stopPropagation()}>
            {photos.map((_,idx)=>(
              <span key={idx} onClick={()=>setPhotoIndex(idx)} style={{width:12,height:12,borderRadius:"50%",background:idx===photoIndex?"#000080":"#bbb",cursor:"pointer"}}/>
            ))}
          </div>
        </div>
      )}

      {/* Request modal */}
      {showModal && <RequestModal factoryName="Agrodan KsT" onClose={()=>setShowModal(false)}/>}
    </div>
  );
}

export default FactoryAgrodan;
