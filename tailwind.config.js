/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Notion-inspired color palette
        border: 'rgba(55, 53, 47, 0.09)',
        input: 'rgba(55, 53, 47, 0.09)',
        ring: '#2383e2',
        background: '#ffffff',
        foreground: '#37352f',

        primary: {
          DEFAULT: '#2383e2',
          foreground: '#ffffff',
          light: 'rgba(35, 131, 226, 0.1)',
        },

        secondary: {
          DEFAULT: '#f7f6f3',
          foreground: '#37352f',
        },

        muted: {
          DEFAULT: '#fbfbfa',
          foreground: '#787774',
          light: '#9b9a97',
        },

        card: {
          DEFAULT: '#ffffff',
          foreground: '#37352f',
        },

        danger: {
          DEFAULT: '#eb5757',
          foreground: '#ffffff',
          light: 'rgba(235, 87, 87, 0.1)',
        },

        success: {
          DEFAULT: '#0a7b6c',
          light: 'rgba(10, 123, 108, 0.1)',
        },

        warning: {
          DEFAULT: '#f7b731',
          light: 'rgba(247, 183, 49, 0.1)',
        },

        purple: {
          DEFAULT: '#9065b0',
          light: 'rgba(144, 101, 176, 0.1)',
        },

        // Custom color palette
        brandy: {
          50: 'oklch(95.69% 0.017 35.34)',
          100: 'oklch(91.51% 0.034 38.63)',
          200: 'oklch(83.01% 0.071 37.25)',
          300: 'oklch(75.04% 0.110 37.77)',
          400: 'oklch(67.54% 0.150 37.37)',
          500: 'oklch(61.43% 0.187 36.63)',
          600: 'oklch(52.05% 0.156 36.50)',
          700: 'oklch(42.53% 0.123 36.96)',
          800: 'oklch(32.33% 0.089 36.95)',
          900: 'oklch(21.48% 0.050 38.81)',
          950: 'oklch(17.94% 0.037 39.80)',
        },

        'crimson-violet': {
          50: 'oklch(95.39% 0.014 350.09)',
          100: 'oklch(91% 0.028 349.50)',
          200: 'oklch(81.90% 0.062 350.48)',
          300: 'oklch(73.01% 0.094 351.89)',
          400: 'oklch(64.38% 0.130 353.78)',
          500: 'oklch(56.46% 0.161 356.47)',
          600: 'oklch(48.14% 0.136 356.30)',
          700: 'oklch(39.42% 0.106 355.91)',
          800: 'oklch(30.22% 0.077 355.39)',
          900: 'oklch(20.32% 0.042 354.01)',
          950: 'oklch(17% 0.033 351.49)',
        },

        navy: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        'autumn-leaf': {
          50: '#fff7ed',
          100: '#fed7aa',
          200: '#fdba74',
          300: '#fb923c',
          400: '#f97316',
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
          800: '#7c2d12',
          900: '#431407',
          950: '#241c12',
        },

        'deep-forest': {
          50: 'oklch(97.23% 0.018 170.10)',
          100: 'oklch(94.42% 0.037 168.37)',
          200: 'oklch(89.09% 0.072 166.97)',
          300: 'oklch(83.91% 0.104 165.39)',
          400: 'oklch(79.31% 0.133 163.10)',
          500: 'oklch(75.21% 0.156 160.13)',
          600: 'oklch(63.73% 0.130 160.38)',
          700: 'oklch(51.71% 0.103 160.79)',
          800: 'oklch(39.22% 0.077 161.12)',
          900: 'oklch(25.34% 0.044 162.56)',
          950: 'oklch(20.94% 0.034 164.20)',
        },

        // Removed dark palette; app is light-only
      },

      boxShadow: {
        'notion-sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'notion-md': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'notion-lg': '0 8px 16px rgba(0, 0, 0, 0.08)',
        'notion-xl': '0 12px 24px rgba(0, 0, 0, 0.09)',
      },

      borderRadius: {
        'notion-sm': '3px',
        'notion-md': '6px',
        'notion-lg': '8px',
      },

      spacing: {
        'notion-xs': '4px',
        'notion-sm': '8px',
        'notion-md': '16px',
        'notion-lg': '24px',
        'notion-xl': '32px',
        'notion-2xl': '48px',
      },

      animation: {
        'notion-fade': 'notionFade 0.2s ease-out',
        'notion-slide': 'notionSlide 0.15s ease-out',
      },

      keyframes: {
        notionFade: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        notionSlide: {
          '0%': { transform: 'translateX(-2px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
