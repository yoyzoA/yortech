/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for class names
  // Only classes found here will be included in the production build
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  theme: {
    extend: {

      // ── Colour palette ──────────────────────────────────────────────────
      // The entire hacker zine colour system lives here.
      // Use these tokens in components: bg-terminal, text-phosphor, etc.
      colors: {
        // Base surfaces
        terminal:   '#0a0a0f',   // main background — near black with a hint of blue
        surface:    '#111118',   // card backgrounds
        surfaceAlt: '#16161f',   // alternate card / hover state
        border:     '#1e1e2e',   // subtle borders

        // Primary accent — phosphor green
        phosphor:   '#39ff8f',   // primary green — headlines, accents
        phosphorDim:'#1a7a42',   // dimmed green — secondary elements
        phosphorGlow:'#39ff8f',  // same as phosphor, used for glow effects

        // Secondary accent — amber
        amber:      '#ffb347',   // amber — category tags, warm accents
        amberDim:   '#8a5a1a',   // dimmed amber

        // Text hierarchy
        textPrimary:   '#e8e8e8',  // main body text
        textSecondary: '#9a9aaa',  // metadata, dates, bylines
        textMuted:     '#555566',  // placeholder, disabled

        // Semantic
        danger:  '#ff4444',
        warning: '#ffaa00',
        info:    '#44aaff',

        // Category colour coding
        catAi:       '#39ff8f',  // AI & GenAI       → phosphor green
        catDev:      '#44aaff',  // Dev Tools        → cyan blue
        catResearch: '#bf7fff',  // ML Research      → purple
        catMarket:   '#ffb347',  // Market & Trends  → amber
      },

      // ── Typography ──────────────────────────────────────────────────────
      fontFamily: {
        mono:    ['"JetBrains Mono"', 'Consolas', 'monospace'],
        display: ['"Share Tech Mono"', '"JetBrains Mono"', 'monospace'],
      },

      // ── Font sizes ───────────────────────────────────────────────────────
      fontSize: {
        'xs':  ['0.7rem',  { lineHeight: '1.4' }],
        'sm':  ['0.8rem',  { lineHeight: '1.5' }],
        'base':['0.9rem',  { lineHeight: '1.7' }],
        'lg':  ['1.05rem', { lineHeight: '1.6' }],
        'xl':  ['1.2rem',  { lineHeight: '1.5' }],
        '2xl': ['1.5rem',  { lineHeight: '1.3' }],
        '3xl': ['1.9rem',  { lineHeight: '1.2' }],
        '4xl': ['2.4rem',  { lineHeight: '1.1' }],
        '5xl': ['3rem',    { lineHeight: '1.0' }],
      },

      // ── Spacing ──────────────────────────────────────────────────────────
      // Standard Tailwind spacing is fine — no overrides needed

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm:   '2px',
        DEFAULT: '4px',
        md:   '4px',
        lg:   '6px',
      },

      // ── Box shadows ──────────────────────────────────────────────────────
      boxShadow: {
        'glow-green':  '0 0 12px rgba(57, 255, 143, 0.25)',
        'glow-amber':  '0 0 12px rgba(255, 179, 71, 0.25)',
        'card':        '0 2px 8px rgba(0, 0, 0, 0.6)',
        'card-hover':  '0 4px 16px rgba(0, 0, 0, 0.8)',
      },

      // ── Animation ────────────────────────────────────────────────────────
      animation: {
        'blink':       'blink 1s step-end infinite',
        'scanline':    'scanline 8s linear infinite',
        'fade-in':     'fadeIn 0.4s ease-in',
        'slide-up':    'slideUp 0.3s ease-out',
      },

      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // ── Background patterns ──────────────────────────────────────────────
      backgroundImage: {
        // Subtle dot grid pattern for the main background
        'dot-grid': `radial-gradient(circle, #1e1e2e 1px, transparent 1px)`,
      },

      backgroundSize: {
        'dot-grid': '24px 24px',
      },
    },
  },

  plugins: [],
};
