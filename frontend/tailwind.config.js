/** @type {import('tailwindcss').Config} */
// AtonixCorp GS-WSF 1.0 — Tailwind Configuration
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GS-WSF Brand Color System
        brand: {
          black:  '#000000',
          dark:   '#0A0A0A',
          accent: '#0050FF',
          card:   '#111111',
          border: '#222222',
          muted:  '#333333',
          white:  '#FFFFFF',
        },
        // primary → accent alias (backward compat)
        primary: {
          DEFAULT: '#0050FF',
          50:  '#EBF0FF',
          100: '#D6E0FF',
          200: '#ADC2FF',
          300: '#84A3FF',
          400: '#5B85FF',
          500: '#0050FF',
          600: '#0044D6',
          700: '#0038AD',
          800: '#002C85',
          900: '#001F5C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '1440px',
      },
      fontSize: {
        'hero-lg': ['64px', { lineHeight: '1.1', fontWeight: '700' }],
        'hero-md': ['48px', { lineHeight: '1.15', fontWeight: '700' }],
        'hero-sub': ['22px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        '30': '7.5rem',   // 120px — GS-WSF section spacing
      },
    },
  },
  plugins: [],
}
