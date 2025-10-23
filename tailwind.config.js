/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3f4f6",
          foreground: "#111827",
        },
        accent: {
          DEFAULT: "#f3f4f6",
          foreground: "#111827",
        },
        background: "#ffffff",
        foreground: "#111827",
        muted: {
          DEFAULT: "#f9fafb",
          foreground: "#6b7280",
        },
        border: "#e5e7eb",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  darkMode: ["class", '[data-theme="dark"]'],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
