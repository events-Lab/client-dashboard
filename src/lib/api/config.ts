export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const AUTH_TOKEN_KEY = "events-lab-client-token";
export const AUTH_USER_KEY = "events-lab-client-user";

export const DEMO_CUSTOMER = {
  email: "customer@eventslab.com",
  password: "customer123",
} as const;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuth(token: string, user: AuthUser) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.localStorage.setItem("events-lab-auth", "demo");
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem("events-lab-auth");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
