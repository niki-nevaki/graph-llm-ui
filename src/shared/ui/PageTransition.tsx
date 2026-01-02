import { Box } from "@mui/material";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <Box
      className="page-transition"
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        animation:
          "page-enter var(--motion-duration-slower) var(--motion-ease-standard)",
      }}
    >
      {children}
    </Box>
  );
}
