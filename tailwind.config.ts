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
        brand: {
          50: "#FDF2F3",
          100: "#F8E2E4",
          200: "#F0B9BC",
          300: "#E2868B",
          400: "#C94850",
          500: "#B01B24",
          600: "#98161E", // Primary Logo Maroon Red
          700: "#7C1117",
          800: "#630C11",
          900: "#4B090D",
        },
        accent: {
          DEFAULT: "#D4AF37", // Warm Gold Accent
          hover: "#B89428",
          light: "#FFF9E6",
        },
        bg: {
          main: "#FAFAFA",
          surface: "#FFFFFF",
          card: "#FFFFFF",
        },
        text: {
          primary: "#1E1E1E",
          secondary: "#555555",
          muted: "#888888",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px 0 rgba(200, 35, 44, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'card': '1rem',
      }
    },
  },
  plugins: [],
};

export default config;
