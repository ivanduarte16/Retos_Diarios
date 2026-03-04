/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDF6EC',
        'cream-dark': '#F5ECD8',
        coral: '#E8614A',
        'coral-dark': '#C94832',
        mustard: '#F0B429',
        'mustard-dark': '#D49A1A',
        ink: '#1A1A1A',
        surface: '#FFFFFF',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'paper': '0 2px 16px 0 rgba(26,26,26,0.08), 0 1px 4px 0 rgba(26,26,26,0.06)',
        'paper-lg': '0 8px 32px 0 rgba(26,26,26,0.12), 0 2px 8px 0 rgba(26,26,26,0.08)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
