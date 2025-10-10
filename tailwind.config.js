/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'primary-text': 'var(--color-primary-text)',
        'secondary-text': 'var(--color-secondary-text)',
        'primary-accent': 'var(--color-primary-accent)',
        'primary-accent-light': 'var(--color-primary-accent-light)',
        'primary-accent-dark': 'var(--color-primary-accent-dark)',
        'secondary-accent': 'var(--color-secondary-accent)',
        highlight: 'var(--color-highlight)',
        borders: 'var(--color-borders)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        disabled: 'var(--color-disabled)',
        'disabled-text': 'var(--color-disabled-text)'
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)'
      }
    }
  },
  plugins: []
};
