import { Link } from 'react-router-dom';
import { formatEditionDate } from '../hooks/useEdition';

// ASCII divider string — repeated to fill the width
const ASCII_LINE = '─'.repeat(80);

/**
 * The newspaper masthead — displayed at the top of every edition page.
 */
export default function ZineHeader({ date, articleCount }) {
  const displayDate = formatEditionDate(date);

  return (
    <header className="w-full pt-8 pb-4 px-4 md:px-8 animate-fade-in">

      {/* ── Top meta bar ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-center text-textMuted text-xs font-mono mb-3 tracking-widest uppercase">
        <span>Vol. I  ·  yorgoassal.com/yortech</span>
        <span>{articleCount ? `${articleCount} articles` : ''}</span>
      </div>

      {/* ── ASCII top rule ────────────────────────────────────────────── */}
      <div className="ascii-divider mb-2" aria-hidden="true">
        {'═'.repeat(80)}
      </div>

      {/* ── Masthead title ────────────────────────────────────────────── */}
      <div className="text-center py-4">
        <h1 className="font-display text-5xl md:text-6xl text-phosphor text-glow-green tracking-widest uppercase">
          YorTech
          <span className="cursor" aria-hidden="true" />
        </h1>
        <p className="text-textSecondary text-xs tracking-widest uppercase mt-2 font-mono">
          Daily Tech &amp; Science Briefing  ·  Curated by AI  ·  Written for Engineers
        </p>
      </div>

      {/* ── ASCII bottom rule ─────────────────────────────────────────── */}
      <div className="ascii-divider mt-2 mb-3" aria-hidden="true">
        {'═'.repeat(80)}
      </div>

      {/* ── Edition date + navigation bar ────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs font-mono">

        {/* Date */}
        <span className="text-phosphor tracking-wide">
          {displayDate || 'Latest Edition'}
        </span>

        {/* Navigation */}
        <nav className="flex gap-6 text-textSecondary uppercase tracking-widest">
          <Link
            to="/"
            className="hover:text-phosphor transition-colors duration-150"
          >
            [ Today ]
          </Link>
          <Link
            to="/archive"
            className="hover:text-phosphor transition-colors duration-150"
          >
            [ Archive ]
          </Link>
          <a
            href="https://yorgoassal.com"
            className="hover:text-phosphor transition-colors duration-150"
          >
            [ Portfolio ]
          </a>
        </nav>
      </div>

      {/* ── ASCII section divider ─────────────────────────────────────── */}
      <div className="ascii-divider mt-3" aria-hidden="true">
        {ASCII_LINE}
      </div>
    </header>
  );
}
