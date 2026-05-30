/**
 * ELEVATE Theme - Professional, Nature-Inspired Design System
 */

export const elevateTheme = {
  colors: {
    // Primary - Soft, muted green
    primary: "#4A7C6B",
    primaryLight: "#6B9E8A",
    primaryDark: "#3A6C5B",

    // Accents
    accentGreen: "#7CB342",
    accentOrange: "#FFB74D",
    accentPurple: "#B39DDB",
    accentBrown: "#A1887F",

    // Neutral - Warm, calming palette
    dark: "#2D3436",
    darkGray: "#3A3F47",
    mediumGray: "#6C757D",
    lightGray: "#F5F3F0",
    background: "#FAFAF8",
    border: "#E8E3DC",

    // Status
    success: "#4A7C6B",
    warning: "#FFB74D",
    error: "#C5534A",

    // Text
    textDark: "#2D3436",
    textGray: "#6C757D",
    textLight: "#9CA3AF",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },

  typography: {
    h1: {
      fontSize: "36px",
      fontWeight: 600,
      lineHeight: "44px",
      letterSpacing: "-0.5px",
    },
    h2: {
      fontSize: "24px",
      fontWeight: 600,
      lineHeight: "32px",
    },
    h3: {
      fontSize: "18px",
      fontWeight: 600,
      lineHeight: "24px",
    },
    h4: {
      fontSize: "16px",
      fontWeight: 600,
      lineHeight: "20px",
    },
    body: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "20px",
    },
    bodySmall: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "16px",
    },
    label: {
      fontSize: "12px",
      fontWeight: 600,
      lineHeight: "16px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
    },
  },

  borderRadius: {
    sm: "6px",
    md: "12px",
    lg: "16px",
    xl: "20px",
  },

  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.07)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1)",
  },
};
