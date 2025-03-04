"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-inter)',
    allVariants: {
      fontWeight: 700, // This ensures all MUI typography elements use bold weight
    },
  },
});

export default theme;
