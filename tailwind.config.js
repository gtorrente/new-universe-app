/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#9333ea',
        'brand-pink': '#ec4899',
      },
      fontFamily: {
        'neue': ['Neue Haas Grotesk', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'neue-bold': ['Neue Haas Grotesk Bold', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
