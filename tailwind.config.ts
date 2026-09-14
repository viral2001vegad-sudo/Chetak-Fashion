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
          50: "#FDF2F2",
          100: "#F8E8E9",
          200: "#F1C5C7",
          300: "#E39296",
          400: "#D35A60",
          500: "#C8232C", // Primary Logo Red
          600: "#B01B24",
          700: "#98161E", // Primary Dark
          800: "#7C151B",
          900: "#65161A",
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
