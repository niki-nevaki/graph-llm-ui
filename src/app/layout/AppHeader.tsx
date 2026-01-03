import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useColorMode } from "../providers/ColorModeProvider";

export function AppHeader({ userName }: { userName: string }) {
  const { mode, toggleMode } = useColorMode();
  const location = useLocation();
  const isGraphRoute = location.pathname.startsWith("/graph");
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
          <Button
            component={RouterLink}
            to="/graph"
            sx={{
              ...navButtonBaseSx,
              ...(isGraphRoute && {
                color: "text.primary",
                bgcolor: "action.selected",
              }),
            }}
          >
            Граф
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
        </Box>

        {/* правый угол: слева-направо toggle + username */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton aria-label={nextLabel} onClick={toggleMode} size="medium">
            <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
          </IconButton>

          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {userName}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
