"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Eye, EyeOff } from "lucide-react";
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

/* Simple inline SVG icons for social providers */
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.87 5.27 4.68 6.67-.15.53-.97 3.4-.99 3.61 0 0-.02.17.09.24.11.06.24.01.24.01.32-.04 3.72-2.44 4.31-2.86.55.08 1.1.12 1.67.12 5.52 0 10-3.58 10-7.79C22 6.58 17.52 3 12 3z" fill="#3C1E1E"/>
    </svg>
  );
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

    setTimeout(async () => {
      let result;
      if (mode === "login") {
        result = await login(email, password);
      } else {
        result = await register(name, email, password);
      }

      if (result.ok) {
        if (result.error) {
          // 가입 성공했지만 이메일 인증 필요 등 안내 메시지
          setError(result.error);
          setLoading(false);
          return;
        }
        reset();
        onClose();
      } else {
        setError(result.error || t("오류가 발생했습니다.", "An error occurred."));
      }
      setLoading(false);
    }, 300);
  };

  const handleSocialLogin = (provider: "google" | "kakao") => {
    // Simulate social login — creates/logs in with a demo account
    const socialEmail = `${provider}@demo.flint.kr`;
    const socialName = provider === "google" ? "Google User" : "카카오 사용자";
    const socialPw = `${provider}-demo-2026`;

    setLoading(true);
    setTimeout(async () => {
      // Try login first, register if not exists
      let result = await login(socialEmail, socialPw);
      if (!result.ok) {
        result = await register(socialName, socialEmail, socialPw);
      }
      if (result.ok) {
        reset();
        onClose();
      } else {
        setError(result.error || t("오류가 발생했습니다.", "An error occurred."));
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#1C1917] p-6 shadow-2xl sm:p-8">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-[#6B7280] hover:bg-[#FAFAF9] hover:text-[#1C1917]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <Image src="/logo.jpg" alt="FLINT" width={48} height={48} className="rounded-xl bg-white p-0.5" />
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

        {/* Social login buttons */}
        <div className="mb-5 space-y-2.5">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-[#FAFAF9] disabled:opacity-50"
          >
            <GoogleIcon />
            {t("Google로 계속하기", "Continue with Google")}
          </button>
          <button
            onClick={() => handleSocialLogin("kakao")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-4 py-3 text-sm font-medium text-[#3C1E1E] transition-colors hover:bg-[#FDD800] disabled:opacity-50"
          >
            <KakaoIcon />
            {t("카카오로 계속하기", "Continue with Kakao")}
          </button>
        </div>

        {/* Divider */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E5E7EB]" />
          <span className="text-xs text-[#A8A29E]">{t("또는", "or")}</span>
          <div className="h-px flex-1 bg-[#E5E7EB]" />
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
                ? t("이메일로 로그인", "Login with Email")
                : t("이메일로 가입하기", "Sign Up with Email")}
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
