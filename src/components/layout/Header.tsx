"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/reports", label: "리포트" },
  { href: "/write", label: "리포트 작성" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D2137]">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[#0D2137]">독립리서치</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0D2137]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#F7F8FA] hover:text-[#0D2137]">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/my">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-[#0D2137] text-[#0D2137] hover:bg-[#0D2137] hover:text-white"
            >
              <User className="mr-1.5 h-4 w-4" />
              로그인
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#F7F8FA]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/my"
              className="rounded-xl px-4 py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#F7F8FA]"
              onClick={() => setMobileOpen(false)}
            >
              마이페이지
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
