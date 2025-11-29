/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {colors: {
                     brown: {
                       700: '#7c2d12',  // marrom clássico de faixa
                     }
                   }
                   },
  },
  plugins: [],
}