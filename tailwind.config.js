/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // 'allura' naam ki class ban jayegi -> font-allura
        allura: ['Allura', 'cursive'], 
      },
    },
  },
  plugins: [],
}