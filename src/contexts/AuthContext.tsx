"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Role } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
  updateProfile: async () => {},
});

// ── Supabase mode ──
function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as Role,
        avatar: data.avatar,
        bio: data.bio,
        coverSectors: data.cover_sectors || [],
        createdAt: data.created_at,
      });
      return data;
    }
    // Profile 없으면 직접 생성 시도 (트리거 실패 대비)
    if (email) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email,
          name: email.split("@")[0],
          role: email === "admin@flint.kr" ? "ADMIN" : "READER",
        })
        .select()
        .single();
      if (newProfile) {
        setUser({
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.role as Role,
          avatar: newProfile.avatar,
          bio: newProfile.bio,
          coverSectors: newProfile.cover_sectors || [],
          createdAt: newProfile.created_at,
        });
        return newProfile;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // 이메일 미인증 에러 처리
        if (error.message.includes("Email not confirmed") || error.message.includes("not confirmed")) {
          return { ok: false, error: "이메일 인증이 필요합니다. 이메일을 확인해주세요." };
        }
        if (error.message.includes("Invalid login")) {
          return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
        }
        return { ok: false, error: error.message };
      }
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "로그인 중 오류가 발생했습니다." };
    }
  }, [fetchProfile]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          return { ok: false, error: "이미 가입된 이메일입니다." };
        }
        return { ok: false, error: error.message };
      }

      // 세션이 바로 반환되면 (이메일 인증 비활성화 시) 즉시 로그인 상태
      if (data.session && data.user) {
        // 프로필 생성 (트리거가 안됐을 경우 대비)
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          name,
          role: email === "admin@flint.kr" ? "ADMIN" : "READER",
        }, { onConflict: "id" });
        await fetchProfile(data.user.id, email);
        return { ok: true };
      }

      // 세션이 없으면 이메일 인증 필요
      if (data.user && !data.session) {
        return {
          ok: true,
          error: "가입 완료! 이메일 인증 링크를 확인한 후 로그인해주세요.",
        };
      }

      return { ok: true };
    } catch (e) {
      return { ok: false, error: "회원가입 중 오류가 발생했습니다." };
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    await supabase.from("profiles").update({
      name: updates.name,
      bio: updates.bio,
      avatar: updates.avatar,
    }).eq("id", user.id);
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  }, [user]);

  return { user, isLoading, isAdmin: user?.role === "ADMIN", login, register, logout, updateProfile };
}

// ── localStorage fallback ──
interface AuthUser extends User { password?: string; }
const USERS_KEY = "flint-users";
const SESSION_KEY = "flint-session";
const ADMIN: AuthUser = {
  id: "admin-001", email: "admin@flint.kr", name: "FLINT Admin",
  role: "ADMIN", coverSectors: [], createdAt: "2024-01-01", password: "flint2026!",
};

function getStored(): AuthUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function setStored(u: AuthUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function ensureAdmin() {
  const u = getStored();
  if (!u.some((x) => x.email === ADMIN.email)) setStored([ADMIN, ...u]);
}
function pub(u: AuthUser): User {
  const { password, ...rest } = u; void password; return rest;
}

function useLocalAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ensureAdmin();
    const email = localStorage.getItem(SESSION_KEY);
    if (email) {
      const found = getStored().find((u) => u.email === email);
      if (found) setUser(pub(found));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    ensureAdmin();
    const found = getStored().find((u) => u.email === email);
    if (!found) return { ok: false, error: "존재하지 않는 계정입니다." };
    if (found.password !== password) return { ok: false, error: "비밀번호가 일치하지 않습니다." };
    localStorage.setItem(SESSION_KEY, email);
    setUser(pub(found));
    return { ok: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const users = getStored();
    if (users.find((u) => u.email === email)) return { ok: false, error: "이미 사용 중인 이메일입니다." };
    const nu: AuthUser = {
      id: crypto.randomUUID(), email, name, role: "READER",
      coverSectors: [], createdAt: new Date().toISOString().slice(0, 10), password,
    };
    setStored([...users, nu]);
    localStorage.setItem(SESSION_KEY, email);
    setUser(pub(nu));
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const users = getStored();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...updates };
    setStored(users);
    setUser(pub(users[idx]));
  }, [user]);

  return { user, isLoading, isAdmin: user?.role === "ADMIN", login, register, logout, updateProfile };
}

// ── Provider ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const sbAuth = useSupabaseAuth();
  const localAuth = useLocalAuth();
  const auth = configured ? sbAuth : localAuth;

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
