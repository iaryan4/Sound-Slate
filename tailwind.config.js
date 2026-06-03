/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070b19',
        surface: 'rgba(15, 23, 42, 0.4)',
        primary: '#6366f1',
        secondary: '#14b8a6',
        accent: '#38bdf8',
        'accent-purple': '#818cf8',
        'accent-green': '#34d399',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
