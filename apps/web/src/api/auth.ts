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

export const login = (username: string, password: string) =>
  apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
