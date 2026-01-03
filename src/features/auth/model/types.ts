export type AuthUser = {
  id: string;
  login: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  ip: string;
  createdAt: string;
};

export type AuthStatus = "loading" | "guest" | "auth";

export type AuthError = {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
};

export function isAuthError(error: unknown): error is AuthError {
  if (!error || typeof error !== "object") {
    return false;
  }
  return "message" in error;
}
