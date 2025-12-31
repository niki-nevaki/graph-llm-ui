import type { PaletteMode } from "@mui/material";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import * as React from "react";

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
  setMode: (mode: PaletteMode) => void;
};

const ColorModeContext = React.createContext<ColorModeContextValue | null>(
  null
);

const STORAGE_KEY = "themeMode";

function getInitialMode(): PaletteMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  // fallback: системная тема
  const prefersDark =
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  return prefersDark ? "dark" : "light";
}

export function useColorMode() {
  const ctx = React.useContext(ColorModeContext);
  if (!ctx)
    throw new Error("useColorMode must be used inside ColorModeProvider");
  return ctx;
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<PaletteMode>(() =>
    getInitialMode()
  );

  const setMode = React.useCallback((next: PaletteMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleMode = React.useCallback(() => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setMode]);

  const theme = React.useMemo(() => {
    return createTheme({
      palette: { mode },
      // сюда можно позже добавить ваши overrides
    });
  }, [mode]);

  const value = React.useMemo(
    () => ({ mode, toggleMode, setMode }),
    [mode, toggleMode, setMode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
