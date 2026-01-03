import { AppBar, Box, Button, IconButton, Toolbar } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { HeaderAuthWidget, useAuth } from "../../features/auth";
import { useColorMode } from "../providers/ColorModeProvider";

export function AppHeader() {
  const { mode, toggleMode } = useColorMode();
  const { status } = useAuth();
  const location = useLocation();
  const isGraphRoute = location.pathname.startsWith("/graphs");
  const isCredentialsRoute = location.pathname.startsWith("/credentials");

  const emoji = mode === "dark" ? "☀️" : "🌙";
  const nextLabel =
    mode === "dark"
      ? "Переключить на светлую тему"
      : "Переключить на тёмную тему";
  const navButtonBaseSx = {
    textTransform: "none",
    borderRadius: 999,
    px: 1.5,
    py: 0.5,
    color: "text.secondary",
    fontWeight: 500,
    "&:hover": {
      bgcolor: "action.hover",
    },
  } as const;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 44,
          px: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* слева можно оставить пусто/логотип/название */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
          {status === "auth" && (
            <>
              <Button
                component={RouterLink}
                to="/graphs"
                sx={{
                  ...navButtonBaseSx,
                  ...(isGraphRoute && {
                    color: "text.primary",
                    bgcolor: "action.selected",
                  }),
                }}
              >
                Мои графы
              </Button>
              <Button
                component={RouterLink}
                to="/credentials"
                sx={{
                  ...navButtonBaseSx,
                  ...(isCredentialsRoute && {
                    color: "text.primary",
                    bgcolor: "action.selected",
                  }),
                }}
              >
                Креденшелы
              </Button>
            </>
          )}
        </Box>

        {/* правый угол: слева-направо toggle + auth widget */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton aria-label={nextLabel} onClick={toggleMode} size="medium">
            <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
          </IconButton>
          <HeaderAuthWidget />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
