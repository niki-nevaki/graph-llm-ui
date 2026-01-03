import { Box } from "@mui/material";
import type { ReactNode } from "react";

import { AppHeader } from "./AppHeader";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader />
      <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>{children}</Box>
    </Box>
  );
}
