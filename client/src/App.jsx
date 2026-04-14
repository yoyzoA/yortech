import { Routes, Route, Navigate } from 'react-router-dom';

import Today         from './pages/Today';
import Archive       from './pages/Archive';
import ArticleDetail from './pages/ArticleDetail';

export default function App() {
  return (
    <>
      {/* CRT scanline overlay — fixed, covers the whole screen */}
      <div className="scanlines" aria-hidden="true" />

      <Routes>
        {/* Default route → today's edition */}
        <Route path="/"               element={<Today />} />

        {/* Archive — list of all past editions */}
        <Route path="/archive"        element={<Archive />} />

        {/* Specific edition by date */}
        <Route path="/archive/:date"  element={<Today />} />

        {/* Catch-all → redirect home */}
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
