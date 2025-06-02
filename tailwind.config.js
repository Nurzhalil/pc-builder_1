/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tech-dark': '#0a0f1c',
        'tech-blue': '#0ea5e9',
        'tech-cyan': '#22d3ee',
        'tech-indigo': '#6366f1',
      },
      backgroundImage: {
        'tech-gradient': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'tech-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      animation: {
        'tech-pulse': 'tech-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'tech-pulse': {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)',
          },
          '50%': {
            opacity: .9,
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
  plugins: [],
};