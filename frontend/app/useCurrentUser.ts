"use client";

import { useAuth } from "./providers";

export function useCurrentUser() {
  return useAuth().user;
}
