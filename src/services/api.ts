import { authService } from "./auth.service";

type ApiOptions = RequestInit & { skipAuth?: boolean; retry?: boolean };

export async function apiFetch(input: string, init: ApiOptions = {}) {
  const { skipAuth, retry, headers, ...rest } = init;
  const hdrs = new Headers(headers || {});
  if (!skipAuth) {
    const token = authService.getAccessToken();
    if (token) hdrs.set("Authorization", `Bearer ${token}`);
  }
  if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");

  const res = await fetch(input, { ...rest, headers: hdrs });

  if (res.status === 401 || res.status === 403) {
    if (!retry) {
      try {
        await authService.refreshTokens();
        const newHeaders = new Headers(headers || {});
        const newToken = authService.getAccessToken();
        if (newToken) newHeaders.set("Authorization", `Bearer ${newToken}`);
        if (!newHeaders.has("Content-Type"))
          newHeaders.set("Content-Type", "application/json");
        return fetch(input, { ...rest, headers: newHeaders } as RequestInit);
      } catch {
        authService.clearTokens();
        window.location.href = "/login";
      }
    }
  }

  return res;
}
