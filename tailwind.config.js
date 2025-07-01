/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'arabic': ['Noto Sans Arabic', 'Tahoma', 'Arial Unicode MS', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'gentle-bounce': 'gentleBounce 2s ease-in-out infinite',
        'logo-enhanced': 'logoEnhanced 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        gentleBounce: {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-5px)'
          }
        },
        logoEnhanced: {
          '0%, 100%': {
            transform: 'translateY(0px) scale(1) rotate(0deg)',
            filter: 'drop-shadow(0 8px 16px rgba(220, 38, 38, 0.5)) drop-shadow(0 0 25px rgba(220, 38, 38, 0.3))'
          },
          '25%': {
            transform: 'translateY(-6px) scale(1.03) rotate(1deg)',
            filter: 'drop-shadow(0 12px 24px rgba(220, 38, 38, 0.6)) drop-shadow(0 0 35px rgba(220, 38, 38, 0.4))'
          },
          '50%': {
            transform: 'translateY(-12px) scale(1.08) rotate(0deg)',
            filter: 'drop-shadow(0 16px 32px rgba(220, 38, 38, 0.7)) drop-shadow(0 0 45px rgba(220, 38, 38, 0.5))'
          },
          '75%': {
            transform: 'translateY(-6px) scale(1.03) rotate(-1deg)',
            filter: 'drop-shadow(0 12px 24px rgba(220, 38, 38, 0.6)) drop-shadow(0 0 35px rgba(220, 38, 38, 0.4))'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};