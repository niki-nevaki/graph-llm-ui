import type { AuthClient } from "./authClient";
import type { AuthError } from "../model/types";

function createAuthError(message: string, status?: number) {
  const error: AuthError = { message, code: status ? String(status) : undefined };
  return error;
}

export const apiAuthClient: AuthClient = {
  async login({ login, password }) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (!response.ok) {
      throw createAuthError("Не удалось войти", response.status);
    }
    const data = (await response.json()) as {
      user: { id: string; login: string };
      token: string;
    };
    return data;
  },
  async register({ login, password }) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (!response.ok) {
      throw createAuthError("Не удалось зарегистрироваться", response.status);
    }
  },
  async logout() {
    await fetch("/api/auth/logout", { method: "POST" });
  },
  async getMyIp() {
    try {
      const response = await fetch("/api/auth/ip");
      if (!response.ok) {
        return "unknown";
      }
      const data = (await response.json()) as { ip?: string };
      return data.ip ?? "unknown";
    } catch {
      return "unknown";
    }
  },
};
