import React from "react";
import "./FloatingWhatsApp.css";

const WHATSAPP_NUMBER = process.env.REACT_APP_WHATSAPP_NUMBER || "77715252683";

const WA_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.52 3.48A11.95 11.95 0 0012.03 0C5.42 0 .17 5.25.17 11.86c0 2.08.55 4.08 1.6 5.86L0 24l6.5-1.68A11.86 11.86 0 0012.03 23.7c6.61 0 11.95-5.25 11.95-11.84 0-3.17-1.24-6.15-3.46-8.38z" fill="#25D366"/>
    <path d="M17.45 14.56c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.38.22-.7.07-.32-.15-1.36-.5-2.59-1.59-.96-.86-1.61-1.92-1.8-2.23-.18-.3-.02-.46.13-.61.13-.12.3-.3.45-.45.15-.15.2-.25.3-.42.1-.17.05-.33-.02-.48-.08-.15-.68-1.63-.94-2.24-.25-.57-.5-.5-.68-.51-.18-.01-.39-.01-.6-.01s-.48.07-.73.33c-.25.26-.96.94-.96 2.3 0 1.36.99 2.68 1.13 2.86.14.17 1.96 3 4.75 4.2 3.3 1.45 3.3 0.97 3.89.9.6-.08 1.78-.72 2.03-1.41.25-.69.25-1.28.18-1.4-.07-.12-.27-.18-.57-.33z" fill="#fff"/>
  </svg>
);

export default function FloatingWhatsApp({ message }) {
  const defaultMsg = encodeURIComponent(message || "Здравствуйте! Хотел(а) уточнить по заявке.");
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMsg}`;

  return (
    <a
      className="floating-wa"
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
    >
      {WA_ICON}
      <span className="floating-wa-text">WhatsApp</span>
    </a>
  );
}
