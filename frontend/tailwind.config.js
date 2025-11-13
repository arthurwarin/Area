/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7fc',
          100: '#cceff9',
          200: '#99dff3',
          300: '#66cfed',
          400: '#33bfe7',
          500: '#22b5d3',
          600: '#1b91a9',
          700: '#146d7f',
          800: '#0d4954',
          900: '#06242a',
        },
        secondary: {
          50: '#e8f2fb',
          100: '#d1e4f7',
          200: '#a3caef',
          300: '#75afe7',
          400: '#4795df',
          500: '#1c5b97',
          600: '#16497c',
          700: '#11375d',
          800: '#0c243e',
          900: '#06121f',
        },
        accent: {
          50: '#fdedf1',
          100: '#fbdbe3',
          200: '#f7b7c7',
          300: '#f393ab',
          400: '#ef6f8f',
          500: '#ef486f',
          600: '#bf3a59',
          700: '#8f2b43',
          800: '#5f1c2c',
          900: '#2f0e16',
        },
        dark: {
          50: '#e5e6e7',
          100: '#cbccce',
          200: '#97999d',
          300: '#63666c',
          400: '#2f333b',
          500: '#071013',
          600: '#050c0f',
          700: '#04090b',
          800: '#030608',
          900: '#010304',
        },
        light: {
          50: '#ffffff', 
          100: '#f9f9f9',
          200: '#f3f3f3',
          300: '#ededed',
          400: '#e7e7e7',
          500: '#e1e1e1',
          600: '#b4b4b4',
          700: '#878787',
          800: '#5a5a5a',
          900: '#2d2d2d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}