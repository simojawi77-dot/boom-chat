"use client";

import { useEffect, useState } from "react";
import type { CurrentUser } from "@/lib/api";

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const value = localStorage.getItem("currentUser");
      if (!value) {
        return;
      }

      try {
        setUser(JSON.parse(value));
      } catch {
        localStorage.removeItem("currentUser");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return user;
}
