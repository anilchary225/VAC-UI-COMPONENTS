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
        // Atrium & VAC Twilight Color Palette
        twilight: {
          sidebar: {
            top: '#251A48',
            middle: '#1A1236',
            bottom: '#120C27',
            active: '#3A2968',
            border: 'rgba(167, 139, 250, 0.15)',
            text: '#F4F5F8',
            muted: '#7C7299',
            lavender: '#C4B5FD',
          },
          accent: {
            primary: '#5B4FF5',   // Vivid Atrium Purple
            secondary: '#181A25', // Deep Ink Pill Black
            lavender: '#D8B4FE',  // Light Self-Help Lavender
            pink: '#FF4081',      // Notification Pink Pill
            emerald: '#10B981',   // On Track Mint
            amber: '#F59E0B',     // At Risk Warm Amber
            red: '#DC2626',       // Emergency Red
          },
          surface: {
            bg: '#F5F6FA',        // Canvas Background
            card: '#FFFFFF',      // White Card
            border: '#E8EAEF',    // Subtle Card Border
            title: '#161722',     // Deep Obsidian Text
            muted: '#6B7280',     // Muted Gray Text
          },
        },
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
            bg: '#F5F6FA',
            secondaryBg: '#FFFFFF',
            surface: '#FFFFFF',
            border: '#E8EAEF',
            text: '#161722',
            secondary: '#6B7280',
          },
          accent: {
            primary: '#5B4FF5',
            secondary: '#8B5CF6',
            lightPrimary: '#5B4FF5',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        btn: '9999px', // Pill buttons matching image
        panel: '16px', // Rounded-2xl card panels matching image
        preview: '24px', // Larger containers matching image
      },
    },
  },
  plugins: [],
};

export default config;
