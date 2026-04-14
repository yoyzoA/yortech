/**
 * ArticleDetail.jsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Note: In the current architecture, articles are rendered inline on the
 * Today page via ArticleCard's expand/collapse mechanism.
 *
 * This page is reserved for future use — e.g. if you add shareable
 * permalinks for individual articles (/yortech/article/:id).
 *
 * For now it redirects to the homepage.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Navigate } from 'react-router-dom';

export default function ArticleDetail() {
  return <Navigate to="/" replace />;
}
