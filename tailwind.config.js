/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'departure-mono': ['DepartureMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
