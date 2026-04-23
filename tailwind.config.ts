import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 5-subject taxonomy — stable, load-bearing for Lyle's mental model
        subject: {
          reading: '#D94F4F',
          writing: '#2AADAD',
          math:    '#E8970A',
          science: '#3E9E3E',
          social:  '#7B4FCC',
        },
        // Joelle's side — warm, editorial, muted-saturated
        adult: {
          bg:      '#F7F3EE',
          surface: '#FFFFFF',
          ink:     '#1A1208',
          muted:   '#7A6A5A',
          accent:  '#C4611A',
          border:  '#E0D8CF',
        },
        // Learner side — warm pastels, kid-joyful
        learner: {
          bg:      '#FEF9F0',
          surface: '#FFFFFF',
          ink:     '#2A1A0A',
          muted:   '#8A7060',
          accent:  '#E8970A',
          border:  '#F0E8D8',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        rounded: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
