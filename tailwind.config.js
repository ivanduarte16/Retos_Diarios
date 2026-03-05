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
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-text)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        cta: 'var(--color-cta)',
        accent: 'var(--color-accent)',
        'accent-dark': 'var(--color-accent-dark)',
        coral: 'var(--color-coral)',
        'coral-dark': 'var(--color-coral-dark)',
        cream: 'var(--color-cream)',
        'cream-dark': 'var(--color-cream-dark)',
        mustard: 'var(--color-mustard)',
      },
      fontFamily: {
        display: ['"Fredoka"', '"Nunito"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        'paper': '0 8px 24px rgba(31, 38, 135, 0.08), 0 2px 6px rgba(15, 23, 42, 0.06)',
        'paper-lg': '0 18px 36px rgba(31, 38, 135, 0.14), 0 4px 12px rgba(15, 23, 42, 0.08)',
        'glow': '0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent), 0 10px 28px color-mix(in srgb, var(--color-primary) 22%, transparent)',
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
