/** @type {import('tailwindcss').Config} */

// Colors read from CSS variables (see src/index.css) as "R G B" triplets so
// Tailwind's opacity modifiers (text-cream/70, bg-ink/40, ...) work.
const c = (name) => `rgb(var(--rgb-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: c('cream'),
        'cream-dark': c('cream-dark'),
        ink: c('ink'),
        'ink-soft': c('ink-soft'),
        'ink-muted': c('ink-muted'),
        line: c('line'),
        accent: c('accent'),
        copper: c('copper'),
      },
    },
  },
  plugins: [],
};
