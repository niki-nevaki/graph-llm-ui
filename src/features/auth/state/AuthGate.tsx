import { Box, CircularProgress } from "@mui/material";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  if (status === "loading") {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (status === "guest" && !isPublicRoute) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === "auth" && isPublicRoute) {
    return <Navigate to="/graphs" replace />;
  }

  return <>{children}</>;
}
