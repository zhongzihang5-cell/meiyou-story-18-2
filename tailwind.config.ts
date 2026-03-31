import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: '#F06292', dark: '#E91E63', light: '#FCE4EC' },
        purple: { DEFAULT: '#9C6FD6', dark: '#7B3FD4', light: '#EDE7F6' },
        story: { bg: '#FBF7FF', border: '#F0E8FF', text: '#1A0A2E', muted: '#6B5B8C', faint: '#B0A0C8' },
      },
      fontFamily: { sans: ['var(--font-noto)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
export default config
