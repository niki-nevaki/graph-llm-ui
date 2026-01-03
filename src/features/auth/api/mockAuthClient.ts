import type { AuthClient } from "./authClient";
import type { AuthError } from "../model/types";

function createAuthError(message: string, fieldErrors?: Record<string, string>) {
  const error: AuthError = { message, fieldErrors };
  return error;
}

async function delay(ms = 300) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuthClient: AuthClient = {
  async login({ login, password }) {
    await delay();
    if (login === "admin@llmui.local" && password === "admin123") {
      return {
        user: { id: "mock-user", login },
        token: `mock-token-${Date.now()}`,
      };
    }
    throw createAuthError("Неверный логин или пароль", {
      login: "Неверный логин или пароль",
      password: "Неверный логин или пароль",
    });
  },
  async register({ login, password }) {
    await delay();
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
    } catch {
      // ignore network errors in mock mode
    }
  },
  async logout() {
    await delay(150);
  },
  async getMyIp() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
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
