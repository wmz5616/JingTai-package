/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0c0e12',
          navy: '#141721',
          surface: '#1d212c',
          gold: '#c5a880',
          'gold-light': '#e3ceb0',
          'gold-dark': '#a98c63',
          cream: '#faf9f6',
          muted: '#6b7280',
          border: '#e4e4e7',
          'border-dark': '#27272a',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif SC"', '"Songti SC"', '"Source Han Serif SC"', 'STSong', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
        'luxury-hover': '0 30px 60px -15px rgba(197, 168, 128, 0.15)',
        gold: '0 10px 25px -5px rgba(197, 168, 128, 0.3)',
      },
    },
  },
  plugins: [],
};
