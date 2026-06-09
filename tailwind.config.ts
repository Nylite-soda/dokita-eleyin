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
        brand: {
          lightBlue: '#55C9F4',
          darkBlue: '#2E5CA9',
          cyan: '#73F8FF',
          // Dark background for dark sections
          navy: '#1A3666',
        },
        // Neutral palette for text and surfaces
        ink: {
          DEFAULT: '#1A1A2E',
          muted: '#4A5568',
          faint: '#A0AEC0',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F7FBFF',  // very light blue tint — feels on-brand
          card: '#EEF7FD',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],    // headlines
        body: ['Visby CF', 'DM Sans', 'sans-serif'], // body, DM Sans as fallback
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2' }],
        'display-sm': ['1.75rem', { lineHeight: '1.25' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
