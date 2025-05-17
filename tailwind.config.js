/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default {
  content: [
    './src/renderer/src/**/*.{ts,tsx}',  // ★React ファイルを含める
    './index.html'
  ],
  theme: { extend: {} },
  plugins: [],
};
