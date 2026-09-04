/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0F1113',
          900: '#14161A',
          800: '#1B1E23',
          700: '#22262C',
          600: '#2B3036',
          500: '#3A4149',
          400: '#5C646D',
        },
        bone: {
          100: '#F5F4EF',
          200: '#E9E7DE',
          300: '#C9C7BC',
        },
        volt: {
          400: '#D6F94E',
          500: '#C7ED2E',
          600: '#A8CC1E',
        },
        ember: {
          400: '#FF7A54',
          500: '#FF5A3C',
          600: '#E0432A',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      letterSpacing: {
        tightish: '-0.01em',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(245,244,239,0.06) inset',
      },
    },
  },
  plugins: [],
};
