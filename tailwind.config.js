/** @type {import('tailwindcss').Config} */
/* Once Upon A Time — Tailwind config.
   Mirrors design-system.css tokens exactly so utility classes drop in cleanly
   alongside our existing canonical CSS. Source of truth lives in design-system.css;
   when a brand token changes there, update here too (or via the deferred design-tokens layer).
*/
module.exports = {
  content: [
    './*.html',
    './shopify-theme/**/*.liquid',
    './shopify-theme/**/*.json',
    './once-upon-a-time-assets/**/*.js',
    './src/**/*.{css,js}',
  ],
  theme: {
    extend: {
      // ===== Brand colors — mirror --rose / --garden / --pillar / --blush / --beginning / --snow ramps =====
      colors: {
        rose: {
          50:  '#F2E8E6',
          100: '#F2DCD8',
          200: '#D9B3AB',
          300: '#BF8E84',
          400: '#A66D62',
          DEFAULT: '#8B5044',  // rose-500
          500: '#8B5044',
          600: '#734238',
          700: '#59332B',
          800: '#40251F',
          900: '#261613',
        },
        garden: {
          50:  '#EAEBD8',
          100: '#E0E0BF',
          200: '#C5C789',
          300: '#B8BA6E',
          400: '#9FA14F',
          500: '#858735',
          DEFAULT: '#6B6D20',  // canonical brand green
          600: '#6B6D20',
          700: '#535419',
          800: '#3A3B11',
          900: '#262611',
        },
        pillar: {
          50:  '#D5CDD0',
          100: '#C6BEC1',
          200: '#AA9DA2',
          300: '#837178',
          400: '#6C565F',
          DEFAULT: '#4C2F3B',  // pillar-500
          500: '#4C2F3B',
          600: '#402731',
          700: '#321F27',
          800: '#27181E',
          900: '#1C1216',
        },
        sky:       '#E2F6FE',
        blush:     '#E5AA9C',
        beginning: '#FFF5EE',
        snow:      '#FFFCFA',
        ink: {
          DEFAULT: '#262422',
          muted:   '#5C544E',
          stone:   '#343330',
        },
        line: '#E5DCCF',
        n: {
          50:  '#F2ECE7',
          100: '#E5DFDA',
          200: '#CCC2BC',
          300: '#BFB3AA',
          400: '#A69B94',
          500: '#8B827C',
          600: '#736B66',
          700: '#59544F',
          800: '#403C39',
          900: '#262422',
        },
        // Semantic
        danger:  { 50: '#F0E4E4', 100: '#F0C3C0', 200: '#F09690', 300: '#E57067', DEFAULT: '#D63D32', 500: '#D63D32', 700: '#BD352C', 800: '#A32E26', 900: '#8A2720' },
        warning: { 50: '#F7E4CB', 100: '#F7D7AD', 300: '#F7B256', DEFAULT: '#F79009', 500: '#F79009', 700: '#C47207', 900: '#915505' },
        success: { 50: '#D3EBE0', 100: '#A4EBCA', 300: '#67E5AB', DEFAULT: '#17B26A', 500: '#17B26A', 700: '#10804C', 900: '#0A4D2E' },
        info:    { 50: '#D4E6FA', 100: '#BBDAFA', 300: '#71B3FA', DEFAULT: '#2E90FA', 500: '#2E90FA', 700: '#2573C7', 900: '#1B5594' },
        // Button primary — Woody Brown (Figma Buttons/Button-brand override variant)
        'button-primary': '#462B36',
      },

      // ===== Typography =====
      fontFamily: {
        serif: ['Voltra', 'Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans:  ['Chivo', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        micro:    ['12px', { lineHeight: '1.4' }],
        label:    ['14px', { lineHeight: '1.43' }],
        base:     ['16px', { lineHeight: '1.50' }],
        md:       ['18px', { lineHeight: '1.50' }],
        lg:       ['20px', { lineHeight: '1.50' }],
        subtitle: ['24px', { lineHeight: '1.50' }],
        xl:       ['32px', { lineHeight: '1.50' }],
        h4:       ['32px', { lineHeight: '1.30' }],
        h3:       ['40px', { lineHeight: '1.30' }],
        h2:       ['48px', { lineHeight: '1.30' }],
        h1:       ['64px', { lineHeight: '1.30' }],
      },

      // ===== Spacing — 8px rhythm (matches --s-1..--s-9) =====
      spacing: {
        '1':   '4px',
        '2':   '8px',
        '3':   '12px',
        '4':   '16px',
        '5':   '24px',
        '6':   '32px',
        '7':   '48px',
        '8':   '64px',
        '9':   '96px',
        '10':  '10px',
        '28':  '28px',
        section: '44px',
      },

      // ===== Surface effects =====
      borderRadius: {
        sm:  '8px',
        DEFAULT: '12px',
        md:  '16px',
        lg:  '20px',
        xl:  '32px',
        pill: '999px',
      },
      boxShadow: {
        xs:  '0 1px 2px rgba(10,13,18,.05)',
        sm:  '0 1px 2px rgba(38,36,34,.06)',
        DEFAULT: '0 1px 2px rgba(38,36,34,.06)',
        md:  '0 8px 24px rgba(38,36,34,.10)',
        lg:  '0 24px 48px rgba(38,36,34,.14)',
        // Newsletter Card v2_dropshadow exact (hover state)
        card: '0 4px 6px 0 rgba(166,109,98,.35), 0 4px 4px 0 rgba(0,0,0,.18)',
      },

      // ===== Container / layout =====
      maxWidth: {
        wrap: '1280px',
      },

      // ===== Motion =====
      transitionTimingFunction: {
        brand: 'cubic-bezier(.2,.8,.2,1)',
      },
      transitionDuration: {
        1: '150ms',
        2: '300ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
