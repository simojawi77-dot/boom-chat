"use client";
import { useEffect, useState } from "react";
import type { CurrentUser } from "@/lib/api";
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => { const value = localStorage.getItem("currentUser"); if (value) { try { setUser(JSON.parse(value)); } catch { localStorage.removeItem("currentUser"); } } }, []);
  return user;
}
