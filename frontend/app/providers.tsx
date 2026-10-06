"use client";

import { ThemeProvider } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearAuthTokens, fetchCurrentUser, type CurrentUser } from "@/lib/api";
import Loading from "./components/Loading";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: CurrentUser | null;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PUBLIC_PATHS = new Set(["/login", "/register"]);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      status: "unauthenticated" as const,
      user: null,
      refreshAuth: async () => {},
    };
  }

  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);

  const refreshAuth = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const hasStoredSession = Boolean(
      window.localStorage.getItem("accessToken") || window.localStorage.getItem("refreshToken"),
    );

    if (!hasStoredSession) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setStatus("authenticated");
    } catch {
      clearAuthTokens();
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    // Defer past the effect body: refreshAuth calls setState synchronously on
    // its "no stored session" path, which the react-hooks lint rule forbids.
    const frame = window.requestAnimationFrame(() => {
      void refreshAuth();
    });

    const onAuthChanged = () => {
      void refreshAuth();
    };

    window.addEventListener("auth:changed", onAuthChanged);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("auth:changed", onAuthChanged);
    };
  }, [refreshAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      refreshAuth,
    }),
    [refreshAuth, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useAuth();
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!isPublicPath && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [isPublicPath, router, status]);

  if (status === "loading" && !isPublicPath) {
    return <Loading />;
  }

  return <>{children}</>;
}

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}