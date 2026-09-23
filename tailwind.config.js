/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8EEE8',
        'surface-section': '#F6E7DF',
        surface: '#FBEFE9',
        'surface-hover': '#F6E4DA',
        'primary-text': '#171717',
        'secondary-text': '#5F5A57',
        coral: {
          DEFAULT: '#E66F52',
          hover: '#D65F42',
          soft: '#F4B09D',
          light: '#FCEBE6',
        },
        border: 'rgba(23, 23, 23, 0.10)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '28px',
        '5xl': '36px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 20px 50px rgba(40, 20, 10, 0.08)',
        card: '0 10px 30px rgba(30, 15, 8, 0.04)',
        hover: '0 24px 60px rgba(40, 20, 10, 0.12)',
        float: '0 15px 35px rgba(230, 111, 82, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'spin-very-slow': 'spin 20s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marquee-reverse 25s linear infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(8px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
