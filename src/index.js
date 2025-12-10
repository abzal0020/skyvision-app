import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Подключаем fetch hook только в development (асинхронно)
if (process.env.NODE_ENV === 'development') {
  import('./lib/fetchHookDev').catch(() => {});
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
