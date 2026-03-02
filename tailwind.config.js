/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"Source Sans 3"', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0a0a09',
          900: '#141412',
          800: '#1c1b18',
          700: '#2d2b26',
          600: '#45433c',
          400: '#7a776d',
          300: '#a8a59a',
          200: '#d4d1c4',
          100: '#f5f3eb',
          50: '#faf9f5',
        },
        amber: {
          DEFAULT: '#c4953a',
          light: '#e4b75d',
          dark: '#8b6a23',
        },
        mint: '#4a9b7f',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'stagger': 'stagger 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        stagger: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'hero-pattern': 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(196, 149, 58, 0.12) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
