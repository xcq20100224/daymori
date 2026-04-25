import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        appleBlue: '#007AFF',
        appleBg: '#F5F7FA',
        appleText: '#1D1D1F',
        appleSubText: '#86868B',
        appleCard: '#F5F5F7'
      },
      borderRadius: {
        xl: '16px'
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0, 122, 255, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
