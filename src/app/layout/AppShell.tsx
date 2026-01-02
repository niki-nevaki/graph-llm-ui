import { Box } from "@mui/material";
import type { ReactNode } from "react";

import { AppHeader } from "./AppHeader";

type Props = {
  userName: string;
  children: ReactNode;
};

export function AppShell({ userName, children }: Props) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader userName={userName} />
      <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}
