import { Route } from "react-router-dom";
import { LoginPage } from "../ui/LoginPage/LoginPage";
import { RegisterPage } from "../ui/RegisterPage/RegisterPage";

export const authRoutes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </>
);
