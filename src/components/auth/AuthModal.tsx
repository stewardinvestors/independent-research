"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

type Mode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

export function AuthModal({ open, onClose, initialMode = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setShowPw(false);
  };

  const switchMode = () => {
    reset();
    setMode((m) => (m === "login" ? "register" : "login"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError(t("이메일과 비밀번호를 입력해주세요.", "Please enter email and password."));
      setLoading(false);
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError(t("이름을 입력해주세요.", "Please enter your name."));
      setLoading(false);
      return;
    }
    if (password.length < 4) {
      setError(t("비밀번호는 4자 이상이어야 합니다.", "Password must be at least 4 characters."));
      setLoading(false);
      return;
    }

    setTimeout(() => {
      let result;
      if (mode === "login") {
        result = login(email, password);
      } else {
        result = register(name, email, password);
      }

      if (result.ok) {
        reset();
        onClose();
      } else {
        setError(result.error || t("오류가 발생했습니다.", "An error occurred."));
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[#6B7280] hover:bg-[#FAFAF9] hover:text-[#1C1917]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A0A0A]">
            <Flame className="h-6 w-6 text-[#EA580C]" />
          </div>
          <h2 className="mt-3 text-xl font-bold text-[#1C1917]">
            {mode === "login"
              ? t("로그인", "Login")
              : t("회원가입", "Sign Up")}
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            {mode === "login"
              ? t("Flint에 오신 것을 환영합니다", "Welcome back to Flint")
              : t("새 계정을 만들어보세요", "Create a new account")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1A1A1A]">
                {t("이름", "Name")}
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("이름을 입력하세요", "Enter your name")}
                className="rounded-xl"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1A1A1A]">
              {t("이메일", "Email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#1A1A1A]">
              {t("비밀번호", "Password")}
            </label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("비밀번호를 입력하세요", "Enter password")}
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1C1917]"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1C1917] py-3 text-white hover:bg-[#292524] disabled:opacity-50"
          >
            {loading
              ? t("처리 중...", "Processing...")
              : mode === "login"
                ? t("로그인", "Login")
                : t("가입하기", "Sign Up")}
          </Button>
        </form>

        {/* Switch mode */}
        <p className="mt-5 text-center text-sm text-[#6B7280]">
          {mode === "login"
            ? t("아직 계정이 없으신가요?", "Don't have an account?")
            : t("이미 계정이 있으신가요?", "Already have an account?")}{" "}
          <button
            onClick={switchMode}
            className="font-semibold text-[#EA580C] hover:underline"
          >
            {mode === "login"
              ? t("회원가입", "Sign Up")
              : t("로그인", "Login")}
          </button>
        </p>
      </div>
    </div>
  );
}
