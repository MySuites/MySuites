const { baseColors, appThemes } = require('../../packages/ui/colors');
const brand = appThemes.myhealth;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary & Accent
        primary: brand.light.primary,
        accent: brand.light.accent,
        'primary-dark': brand.dark.primary,
        'accent-dark': brand.dark.accent,

        // Backgrounds
        'bg-light': baseColors.light.bgLight,
        'bg-default': baseColors.light.bg,
        'bg-dark': baseColors.light.bgDark,
        
        'bg-light-dark': baseColors.dark.bgLight,
        'bg-default-dark': baseColors.dark.bg,
        'bg-dark-dark': baseColors.dark.bgDark,

        // Text & UI
        apptext: baseColors.light.text,
        'apptext-muted': baseColors.light.textMuted,
        'apptext-dark': baseColors.dark.text,
        'apptext-muted-dark': baseColors.dark.textMuted,
        
        error: baseColors.light.error,
        border: baseColors.light.border,
        'border-dark': baseColors.dark.border,
      },
    },
  },
  plugins: [],
};
