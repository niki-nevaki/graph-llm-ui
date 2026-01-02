import { createTheme } from "@mui/material";
import type { PaletteMode } from "@mui/material";

export function createAppTheme(mode: PaletteMode) {
  return createTheme({
    palette: { mode },
  });
}
