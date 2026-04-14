import { useParams } from 'react-router-dom';

import { useEdition }    from '../hooks/useEdition';
import ZineHeader        from '../components/ZineHeader';
import ArticleCard       from '../components/ArticleCard';
import NewsTicker        from '../components/NewsTicker';

// Maps category keys to section display order and labels
const SECTION_ORDER = ['ai_genai', 'dev_tools', 'ml_research', 'market'];

const SECTION_LABELS = {
  ai_genai:    { label: '01  /  AI & GenAI',         color: 'text-catAi'       },
  dev_tools:   { label: '02  /  Dev Tools & Releases', color: 'text-catDev'     },
  ml_research: { label: '03  /  ML & AI Research',    color: 'text-catResearch' },
  market:      { label: '04  /  Market & Trends',     color: 'text-catMarket'   },
};

// ASCII divider between sections
const SectionDivider = ({ label, color }) => (
  <div className="flex items-center gap-3 my-6">
    <span className={`font-display text-xs uppercase tracking-widest ${color}`}>
      {label}
    </span>
    <div className="flex-1 border-t border-border" />
  </div>
);

// Loading skeleton — shown while fetching
const LoadingSkeleton = () => (
  <div className="px-4 md:px-8 py-8 space-y-6 animate-pulse">
    <div className="h-48 bg-surface rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-surface rounded" />
      ))}
    </div>
  </div>
);

// Empty state — shown when no editions exist yet
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
    <p className="font-display text-phosphorDim text-2xl mb-4">
      {'> No editions yet_'}
    </p>
    <p className="text-textSecondary text-sm font-mono max-w-md">
      YorTech publishes every weekday at 08:00 GMT.
      Check back Monday through Friday for your daily briefing.
    </p>
    <div className="mt-6 text-textMuted text-xs font-mono uppercase tracking-widest">
      {'[ standing by... ]'}
    </div>
  </div>
);

// Error state
const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
    <p className="font-display text-danger text-xl mb-4">
      {'> Error loading edition_'}
    </p>
    <p className="text-textSecondary text-sm font-mono">{message}</p>
  </div>
);

/**
 * Today — the main newspaper front page.
 * Also used for archive/:date — the useParams() hook
 * provides the date when viewing a past edition.
 */
export default function Today() {
  const { date }                    = useParams();
  const { edition, loading, error } = useEdition(date || null);

  // Group articles by category, separating out the lead story
  const groupByCategory = (articles = []) => {
    const lead    = articles.find(a => a.is_lead);
    const nonLead = articles.filter(a => !a.is_lead);

    const grouped = {};
    SECTION_ORDER.forEach(cat => { grouped[cat] = []; });
    nonLead.forEach(a => {
      if (grouped[a.category]) grouped[a.category].push(a);
    });

    return { lead, grouped };
  };

  return (
    <div className="min-h-screen pb-16">

      {/* ── Masthead ───────────────────────────────────────────────────── */}
      <ZineHeader
        date={edition?.date}
        articleCount={edition?.articles?.length}
      />

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 md:px-8">

        {loading && <LoadingSkeleton />}
        {error   && <ErrorState message={error} />}
        {!loading && !error && !edition && <EmptyState />}

        {!loading && !error && edition && (() => {
          const { lead, grouped } = groupByCategory(edition.articles);

          return (
            <div className="animate-fade-in">

              {/* ── Lead story ────────────────────────────────────────── */}
              {lead && (
                <section className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-xs text-phosphor uppercase tracking-widest">
                      ★  Lead Story
                    </span>
                    <div className="flex-1 border-t border-phosphorDim" />
                  </div>
                  <ArticleCard article={lead} isLead={true} />
                </section>
              )}

              {/* ── Category sections ────────────────────────────────── */}
              {SECTION_ORDER.map(cat => {
                const articles = grouped[cat];
                if (!articles || articles.length === 0) return null;

                const sectionMeta = SECTION_LABELS[cat];

                return (
                  <section key={cat} className="mb-8">
                    <SectionDivider
                      label={sectionMeta.label}
                      color={sectionMeta.color}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {articles.map(article => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          isLead={false}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* ── Footer ───────────────────────────────────────────── */}
              <footer className="mt-12 mb-4 text-center">
                <div className="ascii-divider mb-4" aria-hidden="true">
                  {'─'.repeat(80)}
                </div>
                <p className="text-textMuted text-xs font-mono">
                  YorTech  ·  Curated by Claude Haiku  ·  Images via Pexels
                  <span className="mx-2">·</span>
                  <a
                    href="https://yorgoassal.com"
                    className="text-phosphorDim hover:text-phosphor transition-colors"
                  >
                    yorgoassal.com
                  </a>
                </p>
              </footer>

            </div>
          );
        })()}
      </main>

      {/* ── Scrolling ticker ──────────────────────────────────────────── */}
      {edition?.articles && (
        <NewsTicker articles={edition.articles} />
      )}
    </div>
  );
}
