/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      fontFamily: { sans: ["Calibri", "Tajawal", "ui-sans-serif", "system-ui", "sans-serif"] },
      
      // Design Tokens - نظام الألوان الموحد
      colors: {
        // الألوان الأساسية
        primary: {
          50: '#f0f4f5',
          100: '#d9e2e5',
          200: '#b3c5cc',
          300: '#8da8b2',
          400: '#678b99',
          500: '#4a757c', // اللون الأساسي
          600: '#3e5e64',
          700: '#2e464b',
          800: '#1f2e32',
          900: '#0f1719',
        },
        accent: {
          50: '#fdf4f3',
          100: '#fbe8e5',
          200: '#f7d1cc',
          300: '#f3bab3',
          400: '#efa39a',
          500: '#ba6c5d', // اللون الثانوي
          600: '#a55a4b',
          700: '#8f4839',
          800: '#793627',
          900: '#632415',
        },
        bg: {
          DEFAULT: '#ffffff',
          50: '#ffffff',
          100: '#fafafa',
          200: '#f5f5f5',
          300: '#e5e5e5',
          400: '#d4d4d4',
          500: '#a3a3a3',
          600: '#737373',
          700: '#525252',
          800: '#404040',
          900: '#262626',
        },
        beige: {
          50: '#fffef9',
          100: '#fffdf3',
          200: '#fffbe7',
          300: '#fff9db',
          400: '#fff7cf',
          500: '#fff4d7', // اللون البيج
          600: '#e6dcc1',
          700: '#ccc4ab',
          800: '#b3ac95',
          900: '#99947f',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4CAF50', // اللون الأخضر
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#F44336', // اللون الأحمر
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFC107', // اللون الأصفر
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      
      // التدرج الرئيسي
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4a757c 0%, #ba6c5d 100%)',
        'gradient-primary-reverse': 'linear-gradient(135deg, #ba6c5d 0%, #4a757c 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, rgba(74, 117, 124, 0.1) 0%, rgba(186, 108, 93, 0.1) 100%)',
        'gradient-accent': 'linear-gradient(135deg, #ba6c5d 0%, #4a757c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        'gradient-error': 'linear-gradient(135deg, #F44336 0%, #d32f2f 100%)',
        'gradient-warning': 'linear-gradient(135deg, #FFC107 0%, #ffb300 100%)',
      },
      
      // ظلال مخصصة
      boxShadow: {
        'primary': '0 4px 14px 0 rgba(74, 117, 124, 0.25)',
        'accent': '0 4px 14px 0 rgba(186, 108, 93, 0.25)',
        'success': '0 4px 14px 0 rgba(76, 175, 80, 0.25)',
        'error': '0 4px 14px 0 rgba(244, 67, 54, 0.25)',
        'warning': '0 4px 14px 0 rgba(255, 193, 7, 0.25)',
        'beige': '0 4px 14px 0 rgba(255, 244, 215, 0.25)',
      },
      
      // حدود مخصصة
      borderColor: {
        'primary': '#4a757c',
        'accent': '#ba6c5d',
        'beige': '#fff4d7',
        'success': '#4CAF50',
        'error': '#F44336',
        'warning': '#FFC107',
      },
      
      // نص مخصص
      textColor: {
        'primary': '#4a757c',
        'accent': '#ba6c5d',
        'beige': '#fff4d7',
        'success': '#4CAF50',
        'error': '#F44336',
        'warning': '#FFC107',
      },
    },
  },
  plugins: [],
};

