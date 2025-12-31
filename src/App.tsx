import { Box } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { GraphEditorPage } from "./pages/GraphPage";
import { HomePage } from "./pages/HomePage";

export default function App() {
  const userName = "Username"; // позже заменишь на реального юзера из стора/авторизации

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppHeader userName={userName} />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/graph" element={<GraphEditorPage />} />
        </Routes>
      </Box>
    </Box>
  );
}
