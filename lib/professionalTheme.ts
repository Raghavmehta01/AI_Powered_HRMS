/**
 * Professional Design System
 * Enterprise-grade color palette and spacing
 */

export const theme = {
  colors: {
    // Primary - Deep Professional Blue
    primary: "#0052CC",
    primaryLight: "#0066FF",
    primaryDark: "#003A99",

    // Neutral - Professional Grays
    dark: "#1A1D23",
    darkGray: "#25272E",
    mediumGray: "#44474F",
    lightGray: "#F5F6F8",
    border: "#E1E4E8",
    background: "#FFFFFF",

    // Success - Professional Green
    success: "#28A745",
    successLight: "#E8F5E9",
    warning: "#FF9800",
    warningLight: "#FFF3E0",
    error: "#D32F2F",
    errorLight: "#FFEBEE",

    // Accent
    accent: "#6366F1",
    accentLight: "#E0E7FF",
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
      fontSize: "32px",
      fontWeight: 600,
      lineHeight: "40px",
      letterSpacing: "-0.5px",
    },
    h2: {
      fontSize: "24px",
      fontWeight: 600,
      lineHeight: "32px",
      letterSpacing: "-0.3px",
    },
    h3: {
      fontSize: "18px",
      fontWeight: 600,
      lineHeight: "24px",
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
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },

  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
  },
};

export const css = `
  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .professional-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #F5F6F8 0%, #FFFFFF 100%);
  }

  .professional-card {
    background: white;
    border-radius: 12px;
    border: 1px solid #E1E4E8;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
  }

  .professional-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  .score-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: #E0E7FF;
    color: #0052CC;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  .score-excellent {
    background: #E8F5E9;
    color: #28A745;
  }

  .score-good {
    background: #E3F2FD;
    color: #0052CC;
  }

  .score-fair {
    background: #FFF3E0;
    color: #FF9800;
  }

  .score-poor {
    background: #FFEBEE;
    color: #D32F2F;
  }
`;
