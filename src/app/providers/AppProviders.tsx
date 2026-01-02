import GlobalStyles from "@mui/material/GlobalStyles";
import { StyledEngineProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

import "../styles/global.css";
import { ColorModeProvider } from "./ColorModeProvider";
import { MotionProvider } from "./MotionProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <StyledEngineProvider enableCssLayer>
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <MotionProvider>
          <ColorModeProvider>{children}</ColorModeProvider>
        </MotionProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  );
}
