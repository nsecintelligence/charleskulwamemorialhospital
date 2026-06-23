/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hospital: {
          red: '#D32F2F',
          'red-dark': '#B71C1C',
          green: '#2E7D32',
          'green-dark': '#1B5E20',
        },
      },
    },
  },
  plugins: [],
};
