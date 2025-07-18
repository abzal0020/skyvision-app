function Home({ t, openModal }) {
  const services = [ /* ... */ ];
  return (
    <div>
      <section className="hero-section">{/* ... */}</section>
      <section className="services-section">{/* ... */}</section>
      
      {/* СЕКЦИЯ О КОМПАНИИ */}
      <section className="about-company">
        <h2 className="section-title">{t.aboutCompany.title}</h2>
        <p style={{whiteSpace: "pre-line"}}>{t.aboutCompany.description}</p>
        <h3>{t.aboutCompany.principlesTitle}</h3>
        <ol>
          {t.aboutCompany.principles.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
        <h3>{t.aboutCompany.advantagesTitle}</h3>
        <ol>
          {t.aboutCompany.advantages.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      </section>
      
      <section className="about-section">{/* ... */}</section>
      <section className="factories-section">{/* ... */}</section>
    </div>
  );
}