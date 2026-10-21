import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vac: {
          dark: {
            bg: '#0A0B10',
            surface: '#11131A',
            elevated: '#171A23',
            border: 'rgba(255, 255, 255, 0.08)',
            text: '#F4F5F8',
            secondary: '#9CA3AF',
            muted: '#6B7280',
          },
          light: {
            bg: '#FFFFFF',
            secondaryBg: '#F8F9FC',
            surface: '#FFFFFF',
            border: '#E7E9F0',
            text: '#171923',
            secondary: '#667085',
          },
          accent: {
            primary: '#6366F1',
            secondary: '#8B5CF6',
            lightPrimary: '#5B5CE2',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        btn: '8px',
        panel: '12px',
        preview: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
