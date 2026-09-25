/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: '#060911',
          card: 'rgba(13, 20, 36, 0.72)',
          'card-hover': 'rgba(21, 32, 56, 0.85)',
          panel: 'rgba(9, 14, 26, 0.85)',
          border: 'rgba(56, 189, 248, 0.18)',
          'border-subtle': 'rgba(148, 163, 184, 0.12)',
          'border-alert': 'rgba(239, 68, 68, 0.35)',
          accent: '#06b6d4', // cyan-500
          cyan: '#00f0ff',
          alert: '#ff3366',
          warning: '#f59e0b',
          success: '#10b981',
          radar: '#00ff9d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
        plate: ['FE-Schrift', 'Euro Plate', 'Arial Black', 'sans-serif'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
        'threat-glow': 'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.12) 0%, transparent 60%)',
        'grid-pattern': 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'beacon': 'beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        beacon: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
