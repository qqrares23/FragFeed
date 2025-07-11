/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'gradient': 'gradient 4s ease-in-out infinite',
        'wave-text': 'waveText 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'mobile-bounce': 'mobileBounce 1.5s ease-in-out infinite',
        'mobile-slide': 'mobileSlide 0.6s ease-out forwards',
        'mobile-scale': 'mobileScale 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
        gradient: {
          '0%': { 
            backgroundPosition: '0% 50%' 
          },
          '50%': { 
            backgroundPosition: '100% 50%' 
          },
          '100%': { 
            backgroundPosition: '0% 50%' 
          },
        },
        waveText: {
          '0%, 40%, 100%': { 
            transform: 'translateY(0) scale(1)',
          },
          '20%': { 
            transform: 'translateY(-10px) scale(1.1)',
          },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
          },
        },
        mobileBounce: {
          '0%, 20%, 50%, 80%, 100%': { 
            transform: 'translateY(0) scale(1)',
          },
          '40%': { 
            transform: 'translateY(-8px) scale(1.05)',
          },
          '60%': { 
            transform: 'translateY(-4px) scale(1.02)',
          },
        },
        mobileSlide: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(-20px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0) scale(1)' 
          },
        },
        mobileScale: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.8) rotate(-5deg)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1) rotate(0deg)' 
          },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}