"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Search, User, Globe, LogOut, ChevronDown, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { SearchModal } from "@/components/search/SearchModal";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { href: "/reports", label: t("리포트", "Reports") },
    { href: "/about", label: t("회사소개", "About") },
    { href: "/notices", label: t("공지사항", "Notices") },
    { href: "/support", label: t("고객센터", "Support") },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="FLINT" width={36} height={36} className="rounded-lg bg-white p-0.5 dark:bg-white" />
            <span className="text-lg font-bold text-[#1C1917]">Flint</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#1C1917]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#FAFAF9] hover:text-[#1C1917]"
              title={theme === "light" ? t("다크 모드", "Dark mode") : t("라이트 모드", "Light mode")}
            >
              {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] transition-colors hover:border-[#1C1917] hover:text-[#1C1917]"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "ko" ? "ENG" : "KOR"}
            </button>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#FAFAF9] hover:text-[#1C1917]"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notification bell */}
            <NotificationBell />

            {user ? (
              /* Logged-in user menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#1C1917] transition-colors hover:bg-[#FAFAF9]"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EA580C] text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#6B7280]" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                      <div className="border-b border-[#E5E7EB] px-4 py-2">
                        <p className="text-sm font-medium text-[#1A1A1A]">{user.name}</p>
                        <p className="text-xs text-[#6B7280]">{user.email}</p>
                      </div>
                      <Link
                        href="/my"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#FAFAF9]"
                      >
                        <User className="h-4 w-4 text-[#6B7280]" />
                        {t("마이페이지", "My Page")}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/write"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#EA580C] hover:bg-[#FAFAF9]"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-[#EA580C] text-[10px] font-bold text-white">A</span>
                          {t("리포트 작성", "Write Report")}
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("로그아웃", "Logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Login button */
              <Button
                onClick={() => setAuthOpen(true)}
                variant="outline"
                className="h-10 rounded-xl border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-white"
              >
                <User className="mr-1.5 h-4 w-4" />
                {t("로그인", "Login")}
              </Button>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-[#6B7280]"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-[#6B7280]"
            >
              <Search className="h-5 w-5" />
            </button>
            <NotificationBell />
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 rounded-full border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold text-[#6B7280]"
            >
              <Globe className="h-3 w-3" />
              {lang === "ko" ? "EN" : "KO"}
            </button>
            <button
              className="rounded-lg p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAF9]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/my"
                    className="rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAF9]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("마이페이지", "My Page")}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    {t("로그아웃", "Logout")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setMobileOpen(false);
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-[#EA580C] hover:bg-[#FAFAF9]"
                >
                  {t("로그인 / 회원가입", "Login / Sign Up")}
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
