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

// Best-effort Slack reporting for every failed API call (matches the platform-wide
// "alert on all errors, including 4xx" decision). Never throws, never blocks the caller.
function reportApiFailure(input: { message: string; path: string; method: string; status?: number }): void {
  const payload = { message: input.message, path: `${input.method} ${input.path}`, status: input.status };

  if (typeof window === "undefined") {
    // Server Component / Route Handler context — no browser to round-trip a fetch
    // through, so report directly in-process. Dynamic import keeps this server-only
    // module out of the code path that actually runs in the browser bundle.
    void import("@/lib/log-error").then(({ reportClientError }) => reportClientError(payload));
    return;
  }

  fetch("/api/log-error", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
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

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch (err) {
    reportApiFailure({
      message: err instanceof Error ? err.message : "Network request failed",
      path,
      method,
    });
    throw err;
  }

  // Cache CSRF token from response header whenever the server sends it
  const tokenFromHeader = res.headers.get("x-csrf-token");
  if (tokenFromHeader) {
    cachedCsrfToken = tokenFromHeader;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json.error ?? "Request failed";
    reportApiFailure({ message, path, method, status: res.status });
    throw new ApiError(message, res.status);
  }
  return (json.data ?? json) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined }),
};
