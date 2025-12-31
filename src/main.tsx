import GlobalStyles from "@mui/material/GlobalStyles";
import { StyledEngineProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router";
import App from "./App";
import "./index.css";
import { ColorModeProvider } from "./theme/ColorModeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StyledEngineProvider enableCssLayer>
        <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
        <ColorModeProvider>
          <App />
        </ColorModeProvider>
      </StyledEngineProvider>
    </BrowserRouter>
  </React.StrictMode>
);
