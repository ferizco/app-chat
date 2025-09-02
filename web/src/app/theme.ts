import { createTheme } from "@mui/material/styles";

const tokens = {
  textPrimary: "#0b161f",
  textSecondary: "#5b5d60",
  userAvatar: "#cfe7f9",
  cardPrimary: "#ffffff",
  cardSecondary: "#f2f9ff",
  primary: "#56b8f3",
  secondary: "#f4f8fb",
  shadow: "rgba(149, 157, 165, 0.2)",
  btnbgPrimary: "#56b8f3",
  btnbgSecondary: "#f4f8fb",
  btnTextPrimary: "#ffffff",
  btnTextSecondary: "#0b161f",
  linkPrimary: "#56b8f3",
  linkSecondary: "#5b5d60",
};

declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      cardSecondary: string;
      shadowColor: string;
      btn: {
        bgPrimary: string;
        bgSecondary: string;
        textPrimary: string;
        textSecondary: string;
      };
    };
  }
  interface ThemeOptions {
    custom?: {
      cardSecondary?: string;
      shadowColor?: string;
      btn?: {
        bgPrimary?: string;
        bgSecondary?: string;
        textPrimary?: string;
        textSecondary?: string;
      };
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: tokens.primary },
    secondary: { main: tokens.secondary },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
    },
    background: {
      default: tokens.cardSecondary, 
      paper: tokens.cardPrimary, 
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    allVariants: { color: tokens.textPrimary },
  },
  custom: {
    cardSecondary: tokens.cardSecondary,
    shadowColor: tokens.shadow,
    btn: {
      bgPrimary: tokens.btnbgPrimary,
      bgSecondary: tokens.btnbgSecondary,
      textPrimary: tokens.btnTextPrimary,
      textSecondary: tokens.btnTextSecondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.custom.btn.bgPrimary,
          color: theme.custom.btn.textPrimary,
          boxShadow: `0 8px 24px ${theme.custom.shadowColor}`,
          "&:hover": { filter: "brightness(0.95)" },
        }),
        outlinedSecondary: ({ theme }) => ({
          borderColor: theme.palette.secondary.main,
          backgroundColor: theme.custom.btn.bgSecondary,
          color: theme.custom.btn.textSecondary,
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: tokens.linkPrimary,
          "&.secondary": { color: tokens.linkSecondary },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          boxShadow: `0 8px 24px ${theme.custom.shadowColor}`,
          borderRadius: 16,
        }),
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          border: "none",
          backgroundColor: theme.palette.secondary.main,
          "&:hover": { backgroundColor: theme.palette.secondary.main },
          "&.Mui-focused": { backgroundColor: theme.palette.secondary.main },
        }),
        underline: {
          "&:before": { borderBottom: "none" },
          "&:after": { borderBottom: "none" },
          "&:hover:not(.Mui-disabled):before": { borderBottom: "none" },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.primary,
          "&.Mui-focused": { color: tokens.primary },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: tokens.textPrimary,
        },
      },
    },
  },
});
