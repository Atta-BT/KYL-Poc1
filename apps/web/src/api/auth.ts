import { apiFetch } from "./client";

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
};

type LoginResponse = {
  user: AuthUser;
};

export const login = (email: string, password: string) =>
  apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

type RegisterPayload = {
  username: string;
  password: string;
  fullName: string;
  email: string;
};

export const register = (payload: RegisterPayload) =>
  apiFetch<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
