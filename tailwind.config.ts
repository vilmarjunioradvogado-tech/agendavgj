import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f3ef',
          100: '#e8e2d6',
          200: '#d4c8ae',
          300: '#bba87f',
          400: '#a88f5a',
          500: '#9a7d47',
          600: '#84673b',
          700: '#6b5132',
          800: '#59422c',
          900: '#4c3828',
          950: '#2a1e14',
        },
        gold: {
          50:  '#fdf9ed',
          100: '#faf0cc',
          200: '#f4de94',
          300: '#eec65c',
          400: '#e8b134',
          500: '#d99620',
          600: '#c07616',
          700: '#9e5716',
          800: '#82441a',
          900: '#6c3919',
          950: '#3e1d09',
          DEFAULT: '#C4952A',
          light: '#E8C46A',
          dark:  '#8B6E2A',
        },
        charcoal: {
          50:  '#f6f6f7',
          100: '#e1e2e5',
          200: '#c3c5cb',
          300: '#9ca0aa',
          400: '#767b88',
          500: '#5c606e',
          600: '#4a4d59',
          700: '#3d3f49',
          800: '#34363e',
          900: '#2e3038',
          950: '#0f1117',
          DEFAULT: '#0F1117',
        },
        cream: {
          50:  '#fafaf8',
          100: '#f5f4f0',
          200: '#eceae3',
          300: '#dedad0',
          400: '#ccc8ba',
          500: '#b9b4a3',
          600: '#a39d8e',
          700: '#8a8478',
          800: '#716b62',
          900: '#5d5850',
          DEFAULT: '#FAFAF8',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.6s ease-out forwards',
        'fade-up':      'fadeUp 0.7s ease-out forwards',
        'slide-right':  'slideRight 0.6s ease-out forwards',
        'slide-left':   'slideLeft 0.6s ease-out forwards',
        'scale-in':     'scaleIn 0.5s ease-out forwards',
        'line-grow':    'lineGrow 1s ease-out forwards',
        'shimmer':      'shimmer 2s linear infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        lineGrow: {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':     'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'texture-diagonal':   "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4952A' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'in-expo':  'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
}

export default config
