"use client";

import { useState } from "react";
import { Bookmark, Eye, Heart, UserCheck, FileText, Settings, LogOut, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockReports } from "@/data/mock";
import { ReportCard } from "@/components/report/ReportCard";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

export default function MyPage() {
  const { t } = useLang();
  const { user, isLoading, logout, updateProfile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  // bookmarks & recent stored per-user in localStorage
  const bookmarkKey = user ? `flint-bookmarks-${user.id}` : "";
  const getBookmarks = (): string[] => {
    if (!user) return [];
    try {
      return JSON.parse(localStorage.getItem(bookmarkKey) || "[]");
    } catch {
      return [];
    }
  };

  const bookmarkedIds = getBookmarks();
  const bookmarkedReports = mockReports.filter((r) => bookmarkedIds.includes(r.id));
  const recentReports = mockReports.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EA580C] border-t-transparent" />
      </div>
    );
  }

  // Not logged in → show login prompt
  if (!user) {
    return (
      <>
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A]">
            <Flame className="h-8 w-8 text-[#EA580C]" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-[#1A1A1A]">
            {t("로그인이 필요합니다", "Login Required")}
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            {t(
              "마이페이지를 이용하려면 로그인해주세요.",
              "Please log in to access your page."
            )}
          </p>
          <Button
            onClick={() => setAuthOpen(true)}
            className="mt-6 rounded-xl bg-[#1C1917] px-8 py-3 text-white hover:bg-[#292524]"
          >
            {t("로그인 / 회원가입", "Login / Sign Up")}
          </Button>
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  const handleSaveName = () => {
    if (editName.trim()) {
      updateProfile({ name: editName.trim() });
    }
    setEditing(false);
  };

  const roleLabel =
    user.role === "ADMIN"
      ? t("관리자", "Admin")
      : user.role === "ANALYST"
        ? t("애널리스트", "Analyst")
        : t("일반 사용자", "General User");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Profile section */}
      <div className="mb-10 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EA580C] text-xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 w-40 rounded-lg text-sm"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  />
                  <Button size="sm" onClick={handleSaveName} className="h-8 rounded-lg text-xs">
                    {t("저장", "Save")}
                  </Button>
                </div>
              ) : (
                <h1 className="text-xl font-bold text-[#1A1A1A]">{user.name}</h1>
              )}
              <p className="text-sm text-[#6B7280]">{user.email}</p>
              <Badge variant="secondary" className="mt-1 rounded-full text-xs">
                {roleLabel}
              </Badge>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setEditName(user.name);
                setEditing(true);
              }}
            >
              <Settings className="mr-1.5 h-4 w-4" />
              {t("프로필 수정", "Edit Profile")}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={logout}
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              {t("로그아웃", "Logout")}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl bg-[#FAFAF9] p-4">
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <Bookmark className="h-3 w-3" /> {t("북마크", "Bookmarks")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">{bookmarkedIds.length}</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <Eye className="h-3 w-3" /> {t("최근 본", "Recent")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">{recentReports.length}</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <UserCheck className="h-3 w-3" /> {t("팔로우", "Following")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">0</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <Heart className="h-3 w-3" /> {t("좋아요", "Likes")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">0</p>
          </div>
        </div>

        {/* Mobile actions */}
        <div className="mt-4 flex gap-2 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl text-xs"
            onClick={() => {
              setEditName(user.name);
              setEditing(true);
            }}
          >
            <Settings className="mr-1 h-3 w-3" />
            {t("프로필 수정", "Edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl text-xs text-red-600"
            onClick={logout}
          >
            <LogOut className="mr-1 h-3 w-3" />
            {t("로그아웃", "Logout")}
          </Button>
        </div>
      </div>

      {/* Bookmarks */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-[#EA580C]" />
          <h2 className="text-lg font-bold text-[#1A1A1A]">{t("북마크한 리포트", "Bookmarked Reports")}</h2>
        </div>
        {bookmarkedReports.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarkedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-[#A8A29E]" />
            <p className="mt-2 text-sm text-[#6B7280]">
              {t("아직 북마크한 리포트가 없습니다", "No bookmarked reports yet")}
            </p>
          </div>
        )}
      </section>

      {/* Recent */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-[#EA580C]" />
          <h2 className="text-lg font-bold text-[#1A1A1A]">{t("최근 본 리포트", "Recently Viewed Reports")}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
    </div>
  );
}
