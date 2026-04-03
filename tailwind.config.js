/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#020617",
          glass: "rgba(15, 23, 42, 0.6)",
          border: "rgba(99, 102, 241, 0.15)",
          borderHover: "rgba(99, 102, 241, 0.3)",
        }
      }
    },
  },
  plugins: [],
}
