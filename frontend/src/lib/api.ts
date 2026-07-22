const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  // Without this, Laravel can't tell we're an API client and falls back to
  // its web behavior on auth failures (redirecting to a named route) instead
  // of returning a JSON error response.
  headers.set("Accept", "application/json");

  if (UNSAFE_METHODS.has(method)) {
    const token = getCookie("XSRF-TOKEN");
    if (token) {
      headers.set("X-XSRF-TOKEN", token);
    }
  }

  const res = await fetch(path, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export interface HealthResponse {
  status: string;
}

export function getHealth() {
  return apiFetch<HealthResponse>("/api/health");
}

export interface Role {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export function getCsrfCookie() {
  return apiFetch<void>("/sanctum/csrf-cookie");
}

export async function login(email: string, password: string) {
  await getCsrfCookie();
  await apiFetch<void>("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<void>("/api/logout", { method: "POST" });
}

export function getCurrentUser() {
  return apiFetch<AuthUser>("/api/user");
}
