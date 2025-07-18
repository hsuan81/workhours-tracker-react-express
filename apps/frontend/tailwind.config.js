/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-black": "#181d2a",
        "custom-gray": "#e8ebed",
        "custom-blue": "#748efe",
        "custom-white": "#ffffff",
        "custom-red": "#ee4b2b",
      },
    },
  },
  plugins: [],
}
