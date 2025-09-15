/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'sans-serif'],
      },
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
        
        // Dark mode colors
        dark: {
          background: '#191919',
          secondary: '#202020',
          tertiary: '#2f2f2f',
          border: 'rgba(255, 255, 255, 0.055)',
          borderMedium: 'rgba(255, 255, 255, 0.094)',
        }
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
      
      fontSize: {
        'notion-xs': ['12px', { lineHeight: '16px', letterSpacing: '0.04em' }],
        'notion-sm': ['14px', { lineHeight: '20px' }],
        'notion-base': ['15px', { lineHeight: '22px' }],
        'notion-lg': ['16px', { lineHeight: '24px' }],
        'notion-xl': ['18px', { lineHeight: '26px' }],
        'notion-2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        'notion-3xl': ['32px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
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