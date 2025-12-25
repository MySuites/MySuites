const { baseColors, appThemes } = require('./packages/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/myhealth/app/**/*.{js,jsx,ts,tsx}",
    "./apps/myhealth/components/**/*.{js,jsx,ts,tsx}",
    "./apps/myfinancials/app/**/*.{js,jsx,ts,tsx}",
    "./apps/myfinancials/components/**/*.{js,jsx,ts,tsx}",
    "./packages/ui/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary & Accent (Defaulting to myhealth for root classes)
        primary: appThemes.myhealth.light.primary,
        accent: appThemes.myhealth.light.accent,
        'primary-dark': appThemes.myhealth.dark.primary,
        'accent-dark': appThemes.myhealth.dark.accent,

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