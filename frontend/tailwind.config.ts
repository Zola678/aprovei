import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lilac: {
          light: "#7B4FA6", // Pontos de brilho
          DEFAULT: "#5B2E82", // Tom principal
          dark: "#2E1245", // Sombras, cantos, dobras
        },
        orange: {
          DEFAULT: "#FF6B00", // Unitel accent
          glow: "rgba(255,107,0,0.7)",
        },
        "orange-accent": "#FF6B00",
        "lilac-base": "#5B2E82",
        white: "#FFFFFF",
        // Keeping legacy colors just in case some components still use them
        primary: "#5B2E82", 
        "primary-dark": "#2E1245",
        "primary-light": "#7B4FA6",
        secondary: "#ec4899",
        "secondary-light": "#f472b6",
        accent: "#FF6B00",
        background: "#2E1245", // Deep background
        surface: "#5B2E82",
        text: "#FFFFFF",
        "text-muted": "rgba(255, 255, 255, 0.6)",
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        title: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // The beam effect over white text
        'orange-beam': 'linear-gradient(110deg, #FFFFFF 30%, #FF6B00 48%, #FFEAD9 52%, #FFFFFF 65%)',
      },
      boxShadow: {
        'orange-glow': '0 0 16px rgba(255,107,0,0.55), 0 0 32px rgba(255,107,0,0.25)',
      },
      dropShadow: {
        'orange-glow': '0 0 6px rgba(255,107,0,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.3' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        beamSlide: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        networkFlow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 8s ease-in-out infinite',
        'scan': 'scanLine 3s ease-in-out',
        'beam': 'beamSlide 4s infinite',
        'network-flow': 'networkFlow 2s linear infinite',
      }
    },
  },
  plugins: [],
};
export default config;
