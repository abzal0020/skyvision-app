import React from "react";
import { Link } from "react-router-dom";

/*
  Clean Footer component.
  - All imports/exports are at the top-level (fixes "import/export may only appear at the top level").
  - Minimal, self-contained markup and inline styles so it won't rely on other files.
  - Replace the existing src/components/Footer.js with this file.
*/

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={leftStyle}>
          <strong>SkyVision</strong>
          <div style={{ fontSize: 12, color: "#666" }}>© {new Date().getFullYear()}</div>
        </div>

        <nav style={navStyle} aria-label="Footer navigation">
          <Link to="/" style={linkStyle}>Home</Link>
          <Link to="/prices" style={linkStyle}>Prices</Link>
          <Link to="/contact" style={linkStyle}>Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

/* --- inline styles --- */
const footerStyle = {
  borderTop: "1px solid #eee",
  padding: "1rem 0",
  background: "#fafafa",
  marginTop: "2rem"
};

const containerStyle = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem"
};

const leftStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  color: "#333"
};

const navStyle = {
  display: "flex",
  gap: "1rem",
  alignItems: "center"
};

const linkStyle = {
  color: "#3498db",
  textDecoration: "none",
  fontSize: 14
};
