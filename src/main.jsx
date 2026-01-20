import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { measurePageLoad, checkMemoryUsage } from './utils/performance';

// 성능 모니터링
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    measurePageLoad();
    checkMemoryUsage();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
