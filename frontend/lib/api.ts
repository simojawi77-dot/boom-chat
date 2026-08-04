const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token && options.auth !== false) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message)
        : typeof data === "string"
          ? data
          : "Request failed";

    throw new Error(message);
  }

  return data as T;
}

export function storeAuthTokens(payload: { accessToken: string; refreshToken: string }) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("accessToken", payload.accessToken);
  localStorage.setItem("refreshToken", payload.refreshToken);
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export async function loginUser(email: string, password: string) {
  return request<{ user: unknown; accessToken: string; refreshToken: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    },
  );
}

export async function registerUser(payload: {
  username: string;
  email: string;
  password: string;
}) {
  return request<{ user: unknown; accessToken: string; refreshToken: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    },
  );
}

export async function fetchCurrentUser() {
  return request<{ id: string; username: string; email: string }>("/profile/me");
}
