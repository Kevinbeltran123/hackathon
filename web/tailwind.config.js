
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          amber: "#FFB020",
          green: "#3BB273",
          blue: "#2D6CDF"
        }
      }
    },
  },
  plugins: [],
}
