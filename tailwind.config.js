/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        primary: {
          DEFAULT: '#1A4B8C',
          dark: '#0D3470',
          light: '#E8F0FE',
        },
        slate: {
          dark: '#1C2B3A',
          gray: '#546E7A',
          border: '#CFD8DC',
          bg: '#F5F7FA',
        },
        saffron: {
          DEFAULT: '#F57C00',
          light: '#FFF3E0',
          dark: '#E65100',
        },
        clinical: {
          green: '#2E7D32',
          greenLight: '#E8F5E9',
          red: '#C62828',
          redLight: '#FFEBEE',
          yellow: '#F9A825',
          yellowLight: '#FFF8E1',
          teal: '#00695C',
          tealLight: '#E0F2F1',
          purple: '#6A1B9A',
          purpleLight: '#F3E5F5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'marquee-slow': 'marquee 45s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
