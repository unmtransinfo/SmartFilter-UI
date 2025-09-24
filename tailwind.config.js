/** @type {import('tailwindcss').Config} */

const {heroui} = require("@heroui/react");

export default {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui({
    defaultTheme: 'dark',
    addCommonColors: true,
    layout: {}, // common layout tokens (applied to all themes)
    themes: {
      light: {
        // layout: {}, // dark theme layout tokens
        colors: {
          background: '#041529',
          primary: {
            200: '#80ffea',
            DEFAULT: '#30e0c9'
          },
          secondary: {
            100: '#b7d8f9',
            200: '#86b1db',
            DEFAULT: '#416fa7',
          },
          default: '#041529'
        },
      },
      dark: {
        // layout: {}, // dark theme layout tokens
        colors: {
          background: '#041529',
          primary: {
            200: '#80ffea',
            DEFAULT: '#30e0c9'
          },
          secondary: {
            100: '#b7d8f9',
            200: '#86b1db',
            DEFAULT: '#416fa7',
          },
          default: '#041529'
        },
      },
    }
  })],
}
