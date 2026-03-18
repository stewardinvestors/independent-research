"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, Flame, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();

  const navLinks = [
    { href: "/reports", label: t("리포트", "Reports") },
    { href: "/about", label: t("회사소개", "About") },
    { href: "/notices", label: t("공지사항", "Notices") },
    { href: "/support", label: t("고객센터", "Support") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1917]">
            <Flame className="h-4 w-4 text-white" />
          </div>
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
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#6B7280] transition-colors hover:border-[#1C1917] hover:text-[#1C1917]"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "ko" ? "ENG" : "KOR"}
          </button>
          <button className="rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#FAFAF9] hover:text-[#1C1917]">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/my">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-white"
            >
              <User className="mr-1.5 h-4 w-4" />
              {t("로그인", "Login")}
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-full border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold text-[#6B7280]"
          >
            <Globe className="h-3 w-3" />
            {lang === "ko" ? "ENG" : "KOR"}
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
          <nav className="flex flex-col gap-3">
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
            <Link
              href="/my"
              className="rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAF9]"
              onClick={() => setMobileOpen(false)}
            >
              {t("마이페이지", "My Page")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
