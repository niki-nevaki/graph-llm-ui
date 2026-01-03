import { Route } from "react-router-dom";
import { CredentialsListPage } from "../pages/CredentialsListPage/CredentialsListPage";
import { CredentialCreatePage } from "../pages/CredentialCreatePage/CredentialCreatePage";
import { CredentialEditPage } from "../pages/CredentialEditPage/CredentialEditPage";

export const credentialsRoutes = (
  <>
    <Route path="/credentials" element={<CredentialsListPage />} />
    <Route path="/credentials/new" element={<CredentialCreatePage />} />
    <Route path="/credentials/:id" element={<CredentialEditPage />} />
  </>
);
