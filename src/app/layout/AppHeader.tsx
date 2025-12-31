import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { useColorMode } from "../providers/ColorModeProvider";

export function AppHeader({ userName }: { userName: string }) {
  const { mode, toggleMode } = useColorMode();

  const emoji = mode === "dark" ? "☀️" : "🌙";
  const nextLabel =
    mode === "dark" ? "Switch to light theme" : "Switch to dark theme";

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
        <Box sx={{ flex: 1 }} />

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
