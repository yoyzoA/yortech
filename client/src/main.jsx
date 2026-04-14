import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      basename="/yortech" tells React Router that all routes
      are relative to /yortech — matching our Nginx config and Vite base.
      e.g. <Link to="/archive"> resolves to /yortech/archive
    */}
    <BrowserRouter basename="/yortech">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
