"use client";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useState } from "react";

import { AuthUser } from "@/types/auth_types";

import {
  getPermissions,
  hasPermission,
  hasShopPermission,
  isShopAdmin,
} from "./permissions";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  can: (...permissions: string[]) => boolean;
  canInShop: (
    shopId: number | null | undefined,
    ...permissions: string[]
  ) => boolean;
  isShopAdmin: (shopId?: number | null) => boolean;
  permissions: Set<string>;
  /** Re-fetches the current user from the server (e.g. after a role change). */
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

const AuthProvider = ({ children, initialUser }: Props) => {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const router = useRouter();

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    setUser(res.ok ? ((await res.json()).user as AuthUser) : null);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/signin");
    router.refresh();
  }, [router]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    can: (...permissions) => hasPermission(user, ...permissions),
    canInShop: (shopId, ...permissions) =>
      hasShopPermission(user, shopId, ...permissions),
    isShopAdmin: (shopId) => isShopAdmin(user, shopId),
    permissions: getPermissions(user),
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
