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
        primary: {
          DEFAULT: '#E23E52',
          dark: '#B8283D',
          soft: '#FCE8EB',
        },
        page: {
          light: '#FFF9EC',
          dark: '#0F1117',
        },
        surface: {
          light: '#FFFDF8',
          dark: '#1A1D27',
        },
        content: {
          strong: '#111827',
          muted: '#6B7280',
        },
        border: {
          light: '#EDE9DF',
          dark: '#2A2E3B',
        },
        pending: {
          bg: '#FFF3DD',
          border: '#F6E3BE',
          text: '#B7791F',
        },
        progress: {
          bg: '#EAF2FF',
          border: '#CFE0FA',
          text: '#2563EB',
        },
        completed: {
          bg: '#EFEEDC',
          border: '#DAD8B8',
          text: '#8A9A2B',
        },
        stat: {
          red: '#E23E52',
          amber: '#F5C46B',
          olive: '#8A9A2B',
        },
        login: {
          card: '#1E1E38',
          input: '#17172B',
          border: '#2C2C4A',
          muted: '#8E8EB0',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'button': '12px',
        'input': '12px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'btn-red': '0 4px 14px rgba(226, 62, 82, 0.35)',
        'logo-glow': '0 0 25px rgba(226, 62, 82, 0.45)',
      },
      maxWidth: {
        'page': '1520px',
      },
    },
  },
  plugins: [],
};

