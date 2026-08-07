const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './data/**/*.{mdx,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        '9/16': '56.25%',
      },
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      gradientColorStops: {
        // https://coolors.co/2d00f7-6a00f4-8900f2-a100f2-b100e8-bc00dd-d100d1-db00b6-e500a4-f20089
        'gradient-1-start': '#F20089',
        'gradient-1-end': '#D100D1',
        'gradient-2-start': '#D100D1',
        'gradient-2-end': '#A100F2',
        'gradient-3-start': '#A100F2',
        'gradient-3-end': '#2D00F7',
      },
      colors: {
        // zinc-950 was added in Tailwind 3.3; this project runs Tailwind 3.2.4,
        // so it is defined here to keep dark surfaces (bg-zinc-950) working.
        zinc: {
          950: '#09090b',
        },
        // Rosa mexicano: orange is remapped to the brand pink palette so all
        // existing orange-* utility classes render as Mexican pink.
        orange: {
          50: '#FDF0F6',
          100: '#FDD1D9',
          200: '#FBA4BC',
          300: '#F575A5',
          400: '#EB519B',
          500: '#DE1D8D',
          600: '#BE1588',
          700: '#9F0E7F',
          800: '#800972',
          900: '#6A0568',
        },
        primary: {
          100: '#FDD1D9',
          200: '#FBA4BC',
          300: '#F575A5',
          400: '#EB519B',
          500: '#DE1D8D',
          600: '#BE1588',
          700: '#9F0E7F',
          800: '#800972',
          900: '#6A0568',
        },
        'primary-color': {
          100: '#FDD1D9',
          200: '#FBA4BC',
          300: '#F575A5',
          400: '#EB519B',
          500: '#DE1D8D',
          600: '#BE1588',
          700: '#9F0E7F',
          800: '#800972',
          900: '#6A0568',
        },
        'primary-color-dark': {
          100: '#FDD1D9',
          200: '#FBA4BC',
          300: '#F575A5',
          400: '#EB519B',
          500: '#DE1D8D',
          600: '#BE1588',
          700: '#9F0E7F',
          800: '#800972',
          900: '#6A0568',
        },
        'background-color': '#000',
        green: colors.violet,
        gray: colors.neutral,
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.orange.600'),
              fontWeight: '500',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              textDecorationColor: 'rgba(190, 21, 136, 0.3)',
              '&:hover': {
                color: theme('colors.orange.500'),
                textDecorationColor: theme('colors.orange.500'),
              },
              code: { color: theme('colors.orange.600') },
            },
            'h1,h2,h3,h4,h5,h6': {
              color: theme('colors.gray.900'),
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              scrollMarginTop: '5rem',
            },
            h1: { fontSize: theme('fontSize.3xl') },
            h2: {
              fontSize: theme('fontSize.2xl'),
              paddingBottom: '0.4rem',
              borderBottom: `1px solid ${theme('colors.gray.200')}`,
            },
            h3: { fontSize: theme('fontSize.xl') },
            h4: { fontSize: theme('fontSize.lg') },
            strong: { color: theme('colors.gray.900'), fontWeight: '600' },
            code: {
              color: theme('colors.orange.700'),
              backgroundColor: theme('colors.orange.50'),
              borderRadius: '0.375rem',
              padding: '0.15rem 0.35rem',
              fontWeight: '500',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            pre: {
              backgroundColor: '#0f1117',
              color: theme('colors.gray.100'),
              borderRadius: '0.75rem',
              border: `1px solid ${theme('colors.gray.200')}`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              code: {
                backgroundColor: 'transparent',
                color: 'inherit',
                padding: 0,
                fontWeight: '400',
                borderRadius: 0,
              },
            },
            details: {
              backgroundColor: theme('colors.gray.50'),
              border: `1px solid ${theme('colors.gray.200')}`,
              borderRadius: '0.75rem',
              padding: '0.75rem 1.25rem',
              summary: {
                fontWeight: '600',
                color: theme('colors.gray.900'),
                cursor: 'pointer',
              },
            },
            blockquote: {
              color: theme('colors.gray.700'),
              borderLeftColor: theme('colors.orange.400'),
              backgroundColor: theme('colors.orange.50'),
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '0.75rem 1.25rem',
              fontStyle: 'normal',
            },
            img: {
              borderRadius: '0.75rem',
              border: `1px solid ${theme('colors.gray.200')}`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            },
            hr: { borderColor: theme('colors.gray.200') },
            'ul li::marker': { color: theme('colors.orange.500') },
            'ol li::marker': { color: theme('colors.orange.500'), fontWeight: '600' },
            th: { color: theme('colors.gray.900') },
            thead: { borderBottomColor: theme('colors.gray.300') },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.orange.400'),
              fontWeight: '500',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              textDecorationColor: 'rgba(235, 81, 155, 0.3)',
              '&:hover': {
                color: theme('colors.orange.300'),
                textDecorationColor: theme('colors.orange.300'),
              },
              code: { color: theme('colors.orange.400') },
            },
            'h1,h2,h3,h4,h5,h6': { color: theme('colors.gray.100') },
            h2: { borderBottomColor: theme('colors.gray.700') },
            strong: { color: theme('colors.gray.100') },
            code: {
              color: theme('colors.orange.400'),
              backgroundColor: theme('colors.gray.800'),
            },
            pre: {
              backgroundColor: '#0a0c12',
              borderColor: theme('colors.gray.800'),
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            },
            details: {
              backgroundColor: theme('colors.gray.800'),
              borderColor: theme('colors.gray.700'),
              summary: { color: theme('colors.gray.100') },
            },
            blockquote: {
              color: theme('colors.gray.300'),
              borderLeftColor: theme('colors.orange.400'),
              backgroundColor: theme('colors.gray.800'),
            },
            img: {
              borderColor: theme('colors.gray.700'),
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            },
            hr: { borderColor: theme('colors.gray.700') },
            'ul li::marker': { color: theme('colors.orange.400') },
            'ol li::marker': { color: theme('colors.orange.400') },
            th: { color: theme('colors.gray.100') },
            thead: { borderBottomColor: theme('colors.gray.700') },
            tbody: {
              tr: {
                borderBottomColor: theme('colors.gray.700'),
              },
            },
          },
        },
      }),
      keyframes: {
        shrink: {
          '0% , 100%': {
            height: '0.75rem',
          },
          '50%': {
            height: '0.375rem',
          },
        },
        'bg-hue-animation': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(180deg)' },
          '100%': { filter: 'hue-rotate(0deg)' },
        },
        'fade-away': {
          '0%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0.2,
          },
        },
        expand: {
          '0% , 100%': {
            height: '0.375rem',
          },
          '50%': {
            height: '0.75rem',
          },
        },
        'gradient-foreground-1': {
          '0%, 16.667%, 100%': {
            opacity: 1,
          },
          '33.333%, 83.333%': {
            opacity: 0,
          },
        },
        'gradient-background-1': {
          '0%, 16.667%, 100%': {
            opacity: 0,
          },
          '25%, 91.667%': {
            opacity: 1,
          },
        },
        'gradient-foreground-2': {
          '0%, 100%': {
            opacity: 0,
          },
          '33.333%, 50%': {
            opacity: 1,
          },
          '16.667%, 66.667%': {
            opacity: 0,
          },
        },
        'gradient-background-2': {
          '0%, to': {
            opacity: 1,
          },
          '33.333%, 50%': {
            opacity: 0,
          },
          '25%, 58.333%': {
            opacity: 1,
          },
        },
        'gradient-foreground-3': {
          '0%, 50%, 100%': {
            opacity: 0,
          },
          '66.667%, 83.333%': {
            opacity: 1,
          },
        },
        'gradient-background-3': {
          '0%, 58.333%, 91.667%, 100%': {
            opacity: 1,
          },
          '66.667%, 83.333%': {
            opacity: 0,
          },
        },
      },
      animation: {
        'fade-text': '10s ease-in-out 3s 1 normal forwards running fade-away',
        shrink: 'shrink ease-in-out 1.5s infinite',
        expand: 'expand ease-in-out 1.5s infinite',
        'hue-animation': 'bg-hue-animation 10s infinite',
        'gradient-background-1': 'gradient-background-1 8s infinite',
        'gradient-foreground-1': 'gradient-foreground-1 8s infinite',
        'gradient-background-2': 'gradient-background-2 8s infinite',
        'gradient-foreground-2': 'gradient-foreground-2 8s infinite',
        'gradient-background-3': 'gradient-background-3 8s infinite',
        'gradient-foreground-3': 'gradient-foreground-3 8s infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
