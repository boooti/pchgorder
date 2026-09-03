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
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bccadc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#243b53',
          600: '#102a43',
          700: '#0b1d3a',
          800: '#09152b',
          900: '#050c1b',
        },
        navy: {
          50: '#f0f4f9',
          100: '#dbe4f0',
          200: '#b8c9e1',
          300: '#8ca8cf',
          400: '#5e84ba',
          500: '#3d64a2',
          600: '#254378',
          700: '#1b325c',
          800: '#112242',
          900: '#0b162c',
          950: '#060b17',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
