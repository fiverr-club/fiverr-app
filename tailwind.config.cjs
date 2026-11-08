/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fiverr: {
          green: "#1dbf73",
          dark: "#0a4226",
          deep: "#072617",
        },
      },
    },
  },
  plugins: [],
};
