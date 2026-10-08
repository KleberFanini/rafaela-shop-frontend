/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        rg: {
          dark: '#0f0e0e',
          surface: '#1a1818',
          rose: '#c59a84',
          roseLight: '#e4baa4',
          gold: '#b8865a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}