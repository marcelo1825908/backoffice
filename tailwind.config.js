/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Custom POS colors - POSPOINT Theme (Dark Mode)
        pos: {
          // Main backgrounds - Dark
          'bg-primary': '#263544',
          'bg-secondary': '#445b71',
          'bg-tertiary': '#344963',
          'bg-quaternary': '#1b2836',
          'bg-accent': '#1b2430',

          // Borders and dividers - Dark
          'border-primary': '#a3aebc',
          'border-secondary': '#3b4f66',
          'border-accent': '#ffffff',
          'border-light': '#2a3544',

          // Text colors - Dark
          'text-primary': '#f5f5f7',
          'text-secondary': '#e5e7eb',
          'text-muted': '#cbd5f5',
          'text-disabled': '#8b92b0',

          // Interactive elements - Dark
          'interactive-primary': '#445b71',
          'interactive-hover': '#5a7189',
          'interactive-active': '#3b4f66',
          'interactive-border': 'rgba(255,255,255,0.35)',
          'interactive-border-hover': '#ffffff',

          // Status colors
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
          'info': '#3b82f6',
        },
      },
    },
  },
  plugins: [],
}

