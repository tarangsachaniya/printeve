const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3032"}/v1/web`;

// In-memory CSRF token cache — populated from response headers on every GET.
// Falls back to cookie for same-origin setups where cookies work fine.
let cachedCsrfToken: string | null = null;

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getCsrfToken(): string | null {
  // Prefer in-memory cache (works cross-origin where cookies are blocked)
  if (cachedCsrfToken) return cachedCsrfToken;
  // Fallback to cookie (works same-origin / local dev)
  return getCookieValue("csrf_token");
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  const method = (init.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers["x-csrf-token"] = csrf;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  // Cache CSRF token from response header whenever the server sends it
  const tokenFromHeader = res.headers.get("x-csrf-token");
  if (tokenFromHeader) {
    cachedCsrfToken = tokenFromHeader;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(json.error ?? "Request failed", res.status);
  }
  return (json.data ?? json) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
