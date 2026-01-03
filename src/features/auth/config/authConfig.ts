export type AuthMode = "mock" | "api";

export const AUTH_STORAGE_KEY = "app.auth.session.v1";

export const AUTH_MODE: AuthMode =
  import.meta.env.VITE_AUTH_MODE === "api" ? "api" : "mock";

export const AUTH_BACKGROUND_URL =
  import.meta.env.VITE_AUTH_BG_URL ?? "/auth-bg.jpg";
