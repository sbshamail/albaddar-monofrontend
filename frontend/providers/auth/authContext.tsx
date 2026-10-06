"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";

import { AuthUser } from "@/types/auth_types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Re-fetches the current user from the server (e.g. after profile edit). */
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

interface Props {
  children: React.ReactNode;
  /** User resolved server-side from the session cookie for the initial render. */
  initialUser: AuthUser | null;
}

export default function AuthProvider({ children, initialUser }: Props) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    setUser(res.ok ? ((await res.json()).user as AuthUser) : null);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
