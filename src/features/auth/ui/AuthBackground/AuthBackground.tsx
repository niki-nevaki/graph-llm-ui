import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { AUTH_BACKGROUND_URL } from "../../config/authConfig";

type AuthBackgroundProps = {
  children: ReactNode;
};

export function AuthBackground({ children }: AuthBackgroundProps) {
  const backgroundImage = AUTH_BACKGROUND_URL
    ? `url(${AUTH_BACKGROUND_URL})`
    : "none";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        backgroundColor: "background.default",
        backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </Box>
  );
}
