import { useEffect, useRef } from 'react';

/**
 * NewsTicker
 * A horizontally scrolling ticker bar showing article titles.
 * Displayed at the bottom of the Today page — gives the feel
 * of a live broadcast news chyron.
 *
 * @param {Array} articles - array of article objects from the current edition
 */
export default function NewsTicker({ articles = [] }) {
  const tickerRef = useRef(null);

  // Build the ticker string from all article titles
  const tickerText = articles
    .map(a => `◆  ${a.title}`)
    .join('     ');

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker || articles.length === 0) return;

    // Duplicate the content so the scroll feels seamless
    ticker.innerHTML = `${tickerText}     ${tickerText}`;

    // Calculate animation duration based on content length
    // ~60px per second feels natural for reading
    const contentWidth  = ticker.scrollWidth / 2;
    const durationSecs  = contentWidth / 60;
    ticker.style.animationDuration = `${durationSecs}s`;

  }, [tickerText, articles.length]);

  if (articles.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-terminal border-t border-phosphorDim overflow-hidden">

      {/* ── Label ─────────────────────────────────────────────────────── */}
      <div className="flex items-stretch">
        <div className="flex items-center px-3 py-2 bg-phosphor text-terminal text-xs font-display uppercase tracking-widest whitespace-nowrap shrink-0">
          ◉ Live Feed
        </div>

        {/* ── Scrolling content ─────────────────────────────────────── */}
        <div className="overflow-hidden flex-1">
          <div
            ref={tickerRef}
            className="whitespace-nowrap text-xs font-mono text-textSecondary py-2 px-4"
            style={{
              display:          'inline-block',
              animation:        'tickerScroll linear infinite',
              animationDuration: '60s',
            }}
          />
        </div>
      </div>

      {/* ── Ticker scroll keyframe (injected inline) ──────────────────── */}
      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
