import type { ReactNode } from "react";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { createAuthClient, type LoginDto } from "../api/authClient";
import { clearSession, loadSession, saveSession } from "../model/storage";
import type { AuthSession, AuthStatus, AuthUser } from "../model/types";

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  ip: string | null;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authClient = useMemo(() => createAuthClient(), []);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  const updateSession = useCallback((next: AuthSession | null) => {
    setSession(next);
    if (next) {
      saveSession(next);
      setStatus("auth");
    } else {
      clearSession();
      setStatus("guest");
    }
  }, []);

  const refreshIp = useCallback(
    async (current: AuthSession) => {
      const ip = await authClient.getMyIp();
      const next = { ...current, ip: ip || "unknown" };
      updateSession(next);
    },
    [authClient, updateSession]
  );

  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      setSession(stored);
      setStatus("auth");
      void refreshIp(stored);
    } else {
      setStatus("guest");
    }
  }, [refreshIp]);

  const login = useCallback(
    async (dto: LoginDto) => {
      const response = await authClient.login(dto);
      const ip = await authClient.getMyIp();
      const nextSession: AuthSession = {
        token: response.token,
        user: response.user,
        ip: ip || "unknown",
        createdAt: new Date().toISOString(),
      };
      updateSession(nextSession);
    },
    [authClient, updateSession]
  );

  const logout = useCallback(async () => {
    await authClient.logout();
    updateSession(null);
  }, [authClient, updateSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      ip: session?.ip ?? null,
      login,
      logout,
    }),
    [status, session, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
