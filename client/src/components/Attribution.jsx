/**
 * Attribution.jsx
 * Displays source citation and image credit at the bottom of every article.
 * Required by both journalistic ethics and Pexels terms of service.
 */
export default function Attribution({ article }) {
  const { source_name, source_author, source_url, image_credit } = article;

  return (
    <div className="mt-3 pt-3 border-t border-border text-xs font-mono text-textMuted space-y-1">

      {/* ── Source citation ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-phosphorDim uppercase tracking-widest">Source:</span>
        <a
          href={source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-textSecondary hover:text-phosphor transition-colors duration-150 underline underline-offset-2"
        >
          {source_name}
          {source_author && ` — ${source_author}`}
        </a>
        <span className="text-textMuted">↗</span>
      </div>

      {/* ── Image credit (Pexels attribution) ────────────────────────── */}
      {image_credit && (
        <div className="flex items-center gap-2">
          <span className="text-phosphorDim uppercase tracking-widest">Image:</span>
          <span className="text-textMuted">{image_credit}</span>
        </div>
      )}
    </div>
  );
}
