/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: ['selector', '.flowx-dark'],
  plugins: [require('tailwindcss-primeui')],
  theme: {
    extend: {
      colors: {
        // FlowX.AI brand colors
        'flowx': {
          gold: '#fdb913',
          'gold-light': '#ffe066',
          'gold-dark': '#cc950f',
          rose: '#d4376b',
          'rose-light': '#e1614b',
          purple: '#27025e',
          blue: '#0099ff',
        },
        // Surface colors for light mode
        'surface': {
          0: 'var(--p-surface-0)',
          50: 'var(--p-surface-50)',
          100: 'var(--p-surface-100)',
          200: 'var(--p-surface-200)',
          300: 'var(--p-surface-300)',
          400: 'var(--p-surface-400)',
          500: 'var(--p-surface-500)',
          600: 'var(--p-surface-600)',
          700: 'var(--p-surface-700)',
          800: 'var(--p-surface-800)',
          900: 'var(--p-surface-900)',
          950: 'var(--p-surface-950)',
        },
        // Primary color
        'primary': {
          DEFAULT: 'var(--p-primary-color)',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fdb913',
          500: '#fdb913',
          600: '#e5a711',
          700: '#cc950f',
          800: '#b3830d',
          900: '#99710b',
          950: '#805f09',
        }
      },
      backgroundColor: {
        'dark': {
          DEFAULT: '#090909',
          100: '#141517',
          200: '#1a1721',
        },
        'surface-ground': 'var(--surface-ground)',
        'surface-card': 'var(--surface-card)',
        'surface-overlay': 'var(--surface-overlay)',
      }
    },
  },
}
