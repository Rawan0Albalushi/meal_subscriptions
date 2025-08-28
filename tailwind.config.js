/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      fontFamily: { sans: ["Calibri", "Tajawal", "ui-sans-serif", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

