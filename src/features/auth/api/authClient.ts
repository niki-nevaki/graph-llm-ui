import { AUTH_MODE } from "../config/authConfig";
import type { AuthUser } from "../model/types";
import { apiAuthClient } from "./apiAuthClient";
import { mockAuthClient } from "./mockAuthClient";

export type LoginDto = { login: string; password: string };
export type RegisterDto = LoginDto;

export interface AuthClient {
  login(dto: LoginDto): Promise<{ user: AuthUser; token: string }>;
  register(dto: RegisterDto): Promise<void>;
  logout(): Promise<void>;
  getMyIp(): Promise<string>;
}

export function createAuthClient(): AuthClient {
  return AUTH_MODE === "api" ? apiAuthClient : mockAuthClient;
}
