import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    dark: {
      colors: {
        background: "#0D0D0D",
        foreground: "#FFFFFF",
        primary: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FB7185",
          500: "#E50914",
          600: "#C5080F",
          700: "#A5070D",
          800: "#85060A",
          900: "#650508",
          DEFAULT: "#E50914",
          foreground: "#FFFFFF",
        },
        content1: "#1A1A1A",
        content2: "#222222",
        content3: "#2A2A2A",
        content4: "#333333",
      },
    },
  },
  defaultTheme: "dark",
});
