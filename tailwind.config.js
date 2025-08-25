/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Регистрируем наши кастомные цвета, используя CSS переменные
      backgroundColor: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        muted: 'var(--color-bg-muted)',
      },
      textColor: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',
      },
      borderColor: {
        primary: 'var(--color-border-primary)',
        secondary: 'var(--color-border-secondary)',
      },
    },
  },
  plugins: [],
};