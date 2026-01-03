import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGate, authRoutes } from "../features/auth";
import { credentialsRoutes } from "../features/credentials";
import { GraphsListPage } from "../features/graphs/ui/GraphsListPage";
import { GraphEditorPage } from "../pages/GraphEditorPage";
import { AppShell } from "./layout/AppShell";

export default function App() {
  return (
    <AppShell>
      <AuthGate>
        <Routes>
          {authRoutes}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/graphs" element={<GraphsListPage />} />
          <Route path="/graphs/:graphId" element={<GraphEditorPage />} />
          <Route path="/graph" element={<Navigate to="/graphs" replace />} />
          {credentialsRoutes}
        </Routes>
      </AuthGate>
    </AppShell>
  );
}
