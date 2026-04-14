import { Link }           from 'react-router-dom';
import { useArchive, formatEditionDate } from '../hooks/useEdition';
import ZineHeader from '../components/ZineHeader';

// Loading skeleton row
const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-4 py-3 border-b border-border">
    <div className="h-4 w-32 bg-surface rounded" />
    <div className="h-4 w-48 bg-surface rounded" />
    <div className="h-4 w-16 bg-surface rounded ml-auto" />
  </div>
);

export default function Archive() {
  const { editions, loading, error } = useArchive();

  return (
    <div className="min-h-screen pb-16">

      {/* ── Masthead ───────────────────────────────────────────────────── */}
      <ZineHeader />

      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-4">

        {/* ── Section header ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <span className="font-display text-phosphor text-sm uppercase tracking-widest">
            ◈  Edition Archive
          </span>
          <div className="flex-1 border-t border-border" />
          <span className="text-textMuted text-xs font-mono">
            {!loading && `${editions.length} edition${editions.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <p className="text-danger text-sm font-mono text-center py-12">
            {'> Error loading archive: '}{error}
          </p>
        )}

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* ── Empty ─────────────────────────────────────────────────────── */}
        {!loading && !error && editions.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-phosphorDim text-xl mb-3">
              {'> No editions yet_'}
            </p>
            <p className="text-textSecondary text-sm font-mono">
              The archive will populate once YorTech publishes its first edition.
            </p>
          </div>
        )}

        {/* ── Edition list ──────────────────────────────────────────────── */}
        {!loading && !error && editions.length > 0 && (
          <div className="space-y-0 animate-fade-in">

            {/* Column headers */}
            <div className="flex items-center gap-4 pb-2 mb-2 border-b border-phosphorDim text-xs font-mono text-phosphorDim uppercase tracking-widest">
              <span className="w-10">#</span>
              <span className="w-36">Date</span>
              <span className="flex-1">Edition</span>
              <span className="w-20 text-right">Articles</span>
            </div>

            {editions.map((edition, index) => (
              <Link
                key={edition.id}
                to={`/archive/${edition.date}`}
                className="flex items-center gap-4 py-3 border-b border-border hover:bg-surfaceAlt transition-colors duration-150 group px-2 -mx-2 rounded"
              >
                {/* Index */}
                <span className="w-10 text-textMuted text-xs font-mono">
                  {String(editions.length - index).padStart(3, '0')}
                </span>

                {/* Raw date */}
                <span className="w-36 text-textSecondary text-xs font-mono">
                  {edition.date}
                </span>

                {/* Full formatted date */}
                <span className="flex-1 text-textPrimary text-sm font-mono group-hover:text-phosphor transition-colors duration-150">
                  {formatEditionDate(edition.date)}
                </span>

                {/* Article count */}
                <span className="w-20 text-right text-textMuted text-xs font-mono">
                  {edition.article_count} art.
                </span>

                {/* Arrow indicator */}
                <span className="text-textMuted group-hover:text-phosphor transition-colors duration-150 text-xs">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <div className="mt-10">
          <Link
            to="/"
            className="text-xs font-mono text-textMuted hover:text-phosphor uppercase tracking-widest transition-colors duration-150"
          >
            ← Back to Today
          </Link>
        </div>
      </main>
    </div>
  );
}
