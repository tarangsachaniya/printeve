"use client";

import * as React from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fields: { fullName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: User }>("/auth/login", { email, password });
    setUser(data.user);
  }, []);

  const register = React.useCallback(
    async (fields: { fullName: string; email: string; phone: string; password: string }) => {
      const data = await api.post<{ user: User }>("/auth/register", fields);
      setUser(data.user);
    },
    []
  );

  const logout = React.useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  const forgotPassword = React.useCallback(async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  }, []);

  const resetPassword = React.useCallback(async (token: string, password: string) => {
    await api.post("/auth/reset-password", { token, password });
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, login, register, logout, forgotPassword, resetPassword, refresh }),
    [user, loading, login, register, logout, forgotPassword, resetPassword, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
