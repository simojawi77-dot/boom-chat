const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

export type CurrentUser = { id?: string; username: string; email?: string; displayName?: string; firstName?: string; lastName?: string; city?: string; avatarUrl?: string };

export function storeAuthTokens(payload: { accessToken: string; refreshToken: string; user?: CurrentUser }) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("accessToken", payload.accessToken);
  localStorage.setItem("refreshToken", payload.refreshToken);
  if (payload.user) localStorage.setItem("currentUser", JSON.stringify(payload.user));
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
}

export async function loginUser(email: string, password: string) {
  return request<{ user: CurrentUser; accessToken: string; refreshToken: string }>(
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
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female';
  city?: string;
  dateOfBirth?: string;
  phone?: string;
}) {
  return request<{ user: CurrentUser; accessToken: string; refreshToken: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    },
  );
}

export async function fetchCurrentUser() {
  return request<{
    id: string;
    username: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    city?: string;
    dateOfBirth?: string;
    phone?: string;
  }>("/profile/me");
}

export type Group = { id: string; name: string; description?: string; avatarUrl?: string; memberCount?: number; members?: unknown[] };
export function fetchMyGroups() { return request<Group[]>("/groups"); }
export function createGroup(payload: { name: string; description?: string }) { return request<Group>("/groups", { method: "POST", body: JSON.stringify(payload) }); }

export type DirectoryUser = { id: string; username: string; displayName?: string; firstName?: string; lastName?: string; city?: string; bio?: string };
export function searchUsers(query = "") { return request<DirectoryUser[]>(`/users?q=${encodeURIComponent(query)}`); }
export type Message = { id: string; senderId: string; receiverId?: string; content: string; createdAt: string };
export function fetchConversation(userId: string) { return request<Message[]>(`/chat/conversation/${userId}`); }
export function sendMessage(payload: { receiverId?: string; groupId?: string; content: string }) { return request<Message>("/chat/messages", { method: "POST", body: JSON.stringify(payload) }); }

export function updateMyProfile(payload: { displayName?: string; bio?: string }) { return request<CurrentUser & { bio?: string }>("/profile/me", { method: "PATCH", body: JSON.stringify(payload) }); }
