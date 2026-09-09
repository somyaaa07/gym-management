/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral / surface scale — light theme
        ink: {
          950: '#170F30', // deep purple-black — dark panels, overlays, camera screens
          900: '#F8F7FC', // app background (near-white lavender) + light text-on-accent
          800: '#FFFFFF', // card / surface background
          700: '#EEECF8', // hairline borders / subtle surfaces
          600: '#E0DDF2', // stronger borders / dividers
          500: '#77728F', // muted icon / secondary tone
          400: '#938EAE', // placeholder / subtle helper text
        },
        // Text scale
        bone: {
          100: '#181534', // primary heading / body text
          200: '#4B4664', // secondary text
          300: '#8B87A3', // tertiary / inactive nav text
        },
        // Primary brand — violet
        volt: {
          400: '#8C7EF8',
          500: '#6C5DD3',
          600: '#4B3ACB',
        },
        // Danger / alerts
        ember: {
          400: '#FF9088',
          500: '#FF5A5F',
          600: '#E23B4C',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        tightish: '-0.01em',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(23,15,48,0.04) inset',
        soft: '0 1px 2px rgba(23,15,48,0.04), 0 8px 24px -6px rgba(23,15,48,0.10)',
        card: '0 2px 8px -2px rgba(23,15,48,0.06), 0 12px 32px -12px rgba(108,93,211,0.18)',
        glow: '0 8px 24px -6px rgba(108,93,211,0.45)',
        nav: '0 -2px 20px -4px rgba(23,15,48,0.10)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #8C7EF8 0%, #6C5DD3 55%, #4B3ACB 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(140,126,248,0.14) 0%, rgba(75,58,203,0.08) 100%)',
        'gradient-dark': 'linear-gradient(160deg, #241755 0%, #170F30 75%)',
      },
    },
  },
  plugins: [],
};
