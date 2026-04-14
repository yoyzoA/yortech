import { useState } from 'react';
import Attribution from './Attribution';

// Maps category keys to display labels and CSS classes
const CATEGORY_CONFIG = {
  ai_genai:    { label: 'AI & GenAI',        badge: 'badge-ai'       },
  dev_tools:   { label: 'Dev Tools',          badge: 'badge-dev'      },
  ml_research: { label: 'ML Research',        badge: 'badge-research' },
  market:      { label: 'Market & Trends',    badge: 'badge-market'   },
};

/**
 * ArticleCard
 * Renders a single article as a newspaper card.
 * Supports two sizes: 'lead' (full-width featured story) and 'default'.
 *
 * @param {Object}  article  - article data from the API
 * @param {boolean} isLead   - true for the featured lead story
 */
export default function ArticleCard({ article, isLead = false }) {
  const [expanded, setExpanded] = useState(isLead);

  const cat    = CATEGORY_CONFIG[article.category] || { label: article.category, badge: 'badge-dev' };
  const keywords = article.keywords || [];

  return (
    <article
      className={`card p-4 flex flex-col gap-3 animate-slide-up ${
        isLead ? 'border-phosphorDim shadow-glow-green' : ''
      }`}
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      {article.image_url && (
        <div className={`w-full overflow-hidden rounded ${isLead ? 'h-52' : 'h-36'}`}>
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity duration-300"
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* ── Header row ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">

        {/* Category badge + lead marker */}
        <div className="flex items-center gap-2 flex-wrap">
          {isLead && (
            <span className="badge text-phosphor border-phosphor text-glow-green">
              ★ Lead
            </span>
          )}
          <span className={`badge ${cat.badge}`}>
            {cat.label}
          </span>
        </div>

        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="text-textMuted hover:text-phosphor text-xs font-mono uppercase tracking-widest transition-colors duration-150 whitespace-nowrap"
          aria-expanded={expanded}
        >
          {expanded ? '[ − ]' : '[ + ]'}
        </button>
      </div>

      {/* ── Title ─────────────────────────────────────────────────────── */}
      <h2 className={`font-display text-textPrimary leading-tight ${
        isLead ? 'text-xl' : 'text-base'
      }`}>
        {article.title}
      </h2>

      {/* ── Summary (collapsible) ─────────────────────────────────────── */}
      {expanded && (
        <div className="animate-fade-in">
          <p className="text-textSecondary text-sm leading-relaxed font-mono">
            {article.summary}
          </p>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {keywords.map(kw => (
                <span
                  key={kw}
                  className="text-xs font-mono text-textMuted border border-border px-2 py-0.5 rounded"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}

          {/* Read original link */}
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-mono text-phosphorDim hover:text-phosphor uppercase tracking-widest transition-colors duration-150"
          >
            Read Original →
          </a>

          {/* Attribution */}
          <Attribution article={article} />
        </div>
      )}
    </article>
  );
}
