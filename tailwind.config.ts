import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#07152f',
        skyblue: '#54c7ff',
        amberline: '#ffbf47'
      }
    }
  },
  plugins: []
}
export default config
