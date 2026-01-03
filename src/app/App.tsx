import { Route, Routes } from "react-router-dom";
import { credentialsRoutes } from "../features/credentials";
import { GraphEditorPage } from "../pages/GraphEditorPage";
import { HomePage } from "../pages/HomePage";
import { AppShell } from "./layout/AppShell";

export default function App() {
  const userName = "Пользователь"; // позже заменишь на реального юзера из стора/авторизации

  return (
    <AppShell userName={userName}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/graph" element={<GraphEditorPage />} />
        {credentialsRoutes}
      </Routes>
    </AppShell>
  );
}
