"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, Role } from "@/types";

interface AuthUser extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => ({ ok: false }),
  register: () => ({ ok: false }),
  logout: () => {},
  updateProfile: () => {},
});

const USERS_KEY = "flint-users";
const SESSION_KEY = "flint-session";

function getStoredUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setStoredUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

function setSession(email: string | null) {
  if (email) {
    localStorage.setItem(SESSION_KEY, email);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function toPublicUser(u: AuthUser): User {
  const { password, ...rest } = u;
  void password;
  return rest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const email = getSession();
    if (email) {
      const users = getStoredUsers();
      const found = users.find((u) => u.email === email);
      if (found) setUser(toPublicUser(found));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email);
    if (!found) return { ok: false, error: "존재하지 않는 계정입니다." };
    if (found.password !== password) return { ok: false, error: "비밀번호가 일치하지 않습니다." };
    setSession(email);
    setUser(toPublicUser(found));
    return { ok: true };
  }, []);

  const register = useCallback(
    (name: string, email: string, password: string) => {
      const users = getStoredUsers();
      if (users.find((u) => u.email === email)) {
        return { ok: false, error: "이미 사용 중인 이메일입니다." };
      }
      const newUser: AuthUser = {
        id: crypto.randomUUID(),
        email,
        name,
        role: "READER" as Role,
        coverSectors: [],
        createdAt: new Date().toISOString().slice(0, 10),
        password,
      };
      const updated = [...users, newUser];
      setStoredUsers(updated);
      setSession(email);
      setUser(toPublicUser(newUser));
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx === -1) return;
      users[idx] = { ...users[idx], ...updates };
      setStoredUsers(users);
      setUser(toPublicUser(users[idx]));
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
