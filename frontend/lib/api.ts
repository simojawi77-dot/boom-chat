const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const LOGIN_PATH = "/login";
const REFRESH_PATH = "/auth/refresh";

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  retryOn401?: boolean;
}

export type CurrentUser = {
  id?: string;
  username: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  city?: string;
  dateOfBirth?: string;
  phone?: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  bio?: string;
  createdAt?: string;
};

type AuthTokens = { accessToken: string; refreshToken: string; user?: CurrentUser };

let refreshTokensPromise: Promise<AuthTokens> | null = null;

async function readResponseData(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  return contentType.includes("application/json")
    ? await response.json()
    : await response.text();
}

function getStoredRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("refreshToken");
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH);
  }
}

async function refreshAccessToken(): Promise<AuthTokens> {
  if (typeof window === "undefined") {
    throw new Error("Refresh is only available in the browser");
  }

  if (!refreshTokensPromise) {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }

    refreshTokensPromise = (async () => {
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${refreshToken}`);

      const response = await fetch(`${API_URL}${REFRESH_PATH}`, {
        method: "POST",
        headers,
      });
      const data = await readResponseData(response);

      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message?: string }).message)
            : typeof data === "string"
              ? data
              : "Refresh failed";

        throw new Error(message);
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !("accessToken" in data) ||
        !("refreshToken" in data)
      ) {
        throw new Error("Invalid refresh response");
      }

      const payload = data as AuthTokens;
      storeAuthTokens(payload);
      return payload;
    })();
  }

  try {
    return await refreshTokensPromise;
  } finally {
    refreshTokensPromise = null;
  }
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

  const data = await readResponseData(response);

  if (!response.ok) {
    if (response.status === 401 && options.auth !== false) {
      if (options.retryOn401 === false) {
        clearAuthTokens();
        redirectToLogin();
        throw new Error("Unauthorized");
      }

      try {
        await refreshAccessToken();
        return request<T>(path, {
          ...options,
          retryOn401: false,
        });
      } catch (error) {
        clearAuthTokens();
        redirectToLogin();
        throw error;
      }
    }

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

export function updateStoredCurrentUser(user: Partial<CurrentUser> | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    localStorage.removeItem("currentUser");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.dispatchEvent(new Event("auth:changed"));
}

export function storeAuthTokens(payload: AuthTokens) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("accessToken", payload.accessToken);
  localStorage.setItem("refreshToken", payload.refreshToken);
  if (payload.user) {
    updateStoredCurrentUser(payload.user);
  }
  window.dispatchEvent(new Event("auth:changed"));
}

export function clearAuthTokens() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  window.dispatchEvent(new Event("auth:changed"));
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
  gender?: "male" | "female";
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
  return request<CurrentUser>('/profile/me');
}

export type Group = {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  memberCount?: number;
  members?: unknown[];
  myRole?: "admin" | "member";
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

type PaginationOptions = {
  limit?: number;
  before?: string;
};

function buildPaginationQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  return query.toString();
}

export function fetchMyGroups(options: PaginationOptions = {}) {
  const query = buildPaginationQuery(options);

  return request<PaginatedResponse<Group>>(
    `/groups${query ? `?${query}` : ""}`,
  );
}

export function createGroup(payload: { name: string; description?: string }) {
  return request<Group>("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type DirectoryUser = {
  id: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  bio?: string;
};

export function searchUsers(query = "", options: PaginationOptions = {}) {
  const params = buildPaginationQuery({ q: query, ...options });

  return request<PaginatedResponse<DirectoryUser>>(`/users?${params}`);
}

export type Message = { id: string; senderId: string; receiverId?: string; content: string; createdAt: string };
export type PaginatedMessagesResponse<T> = { items: T[]; nextCursor: string | null; hasMore: boolean };
export function fetchConversation(
  userId: string,
  options: { limit?: number; before?: string } = {},
) {
  const params = new URLSearchParams();

  if (options.limit !== undefined) {
    params.set("limit", String(options.limit));
  }

  if (options.before) {
    params.set("before", options.before);
  }

  const query = params.toString();

  return request<PaginatedMessagesResponse<Message>>(
    `/chat/conversation/${userId}${query ? `?${query}` : ""}`,
  );
}
export function sendMessage(payload: { receiverId?: string; groupId?: string; content: string }) { return request<Message>("/chat/messages", { method: "POST", body: JSON.stringify(payload) }); }

export function updateMyProfile(payload: { displayName?: string; bio?: string }) { return request<CurrentUser & { bio?: string }>("/profile/me", { method: "PATCH", body: JSON.stringify(payload) }); }

export type Post = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<CurrentUser, "id" | "username" | "displayName" | "firstName" | "lastName" | "city" | "avatarUrl" | "bio"> | null;
};

export function fetchPosts(options: PaginationOptions = {}) {
  const query = buildPaginationQuery(options);
  return request<PaginatedResponse<Post>>(`/posts${query ? `?${query}` : ""}`);
}

export function createPost(content: string) {
  return request<Post>("/posts", { method: "POST", body: JSON.stringify({ content }) });
}

export function deletePost(id: string) {
  return request<{ success: boolean }>(`/posts/${id}`, { method: "DELETE" });
}
