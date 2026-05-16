import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import { initTheme } from './utils/theme.js';
import { initLocale } from './utils/i18n.jsx';

initTheme();
initLocale();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '12px', background: '#0F6E56', color: '#fff' },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
