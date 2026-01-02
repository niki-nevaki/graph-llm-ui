import { alpha, createTheme } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { createTransition } from "./motion";

export function createAppTheme(mode: PaletteMode) {
  return createTheme({
    palette: { mode },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: createTransition(
              ["box-shadow", "transform"],
              "slow",
              "standard"
            ),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            transition: createTransition(
              ["transform", "box-shadow", "background-color"],
              "base",
              "standard"
            ),
            "&:hover": {
              transform: "scale(var(--motion-scale-hover))",
            },
            "&:active": {
              transform: "scale(var(--motion-scale-press))",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: createTransition(
              ["transform", "background-color"],
              "fast",
              "standard"
            ),
            "&:hover": {
              transform: "scale(var(--motion-scale-hover))",
            },
            "&:active": {
              transform: "scale(var(--motion-scale-press))",
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            transition: createTransition(["color"], "fast", "standard"),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            transition: createTransition(
              ["box-shadow", "border-color", "background-color"],
              "fast",
              "standard"
            ),
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              boxShadow: `0 0 0 3px ${alpha(
                theme.palette.primary.main,
                0.18
              )}`,
            },
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: createTransition(
              ["background-color", "transform"],
              "fast",
              "standard"
            ),
          },
        },
      },
    },
  });
}
