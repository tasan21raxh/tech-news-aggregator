/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans  : ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50 : '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      animation: {
        'fade-in'  : 'fadeIn 0.4s ease-out',
        'slide-up' : 'slideUp 0.4s ease-out',
        'shimmer'  : 'shimmer 1.8s infinite linear',
      },
      keyframes: {
        fadeIn  : { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp : { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer : { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
