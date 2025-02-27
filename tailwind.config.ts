import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
      },
      colors: {
        primary: '#2A4858', // Deep teal-gray
        secondary: '#8EADC3', // Soft blue-gray
        accent: '#95B2B8', // Light teal
      },
    },
  },
  plugins: [],
}

export default config