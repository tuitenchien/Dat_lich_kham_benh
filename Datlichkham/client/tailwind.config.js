/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fd',
          300: '#93d2fb',
          400: '#60b8f8',
          500: '#3b99f4',
          600: '#2578e9',
          700: '#1d60d6',
          800: '#1d4eac',
          900: '#1e4388',
          950: '#172a54',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        medicare: {
          blue:   '#1a6ef8',
          cyan:   '#00c2e0',
          light:  '#e8f4ff',
          dark:   '#0f2554',
          gray:   '#f5f7fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'header': '0 2px 20px rgba(0,0,0,0.08)',
        'card':   '0 4px 24px rgba(26,110,248,0.10)',
      },
    },
  },
  plugins: [],
}
