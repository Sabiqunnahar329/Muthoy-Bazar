/** Add the colors + font below to your existing tailwind.config.js (also add the Hind Siliguri <link> in index.html). */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0b4d3c', dark: '#083a2d', light: '#e6f1ed' },
        cta: { DEFAULT: '#a98261', dark: '#8c6747' },
        surface: '#f9fafb',
      },
      fontFamily: { sans: ['"Hind Siliguri"', 'Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
