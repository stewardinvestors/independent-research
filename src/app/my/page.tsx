"use client";

import { Bookmark, Eye, Heart, UserCheck, FileText, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockReports } from "@/data/mock";
import { ReportCard } from "@/components/report/ReportCard";
import { useLang } from "@/contexts/LanguageContext";

export default function MyPage() {
  const { t } = useLang();
  const bookmarkedReports = mockReports.slice(0, 3);
  const recentReports = mockReports.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Profile section */}
      <div className="mb-10 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1C1917] text-xl font-bold text-white">
              G
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">{t("게스트 사용자", "Guest User")}</h1>
              <p className="text-sm text-[#6B7280]">guest@example.com</p>
              <Badge variant="secondary" className="mt-1 rounded-full text-xs">
                {t("일반 사용자", "General User")}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="hidden rounded-xl sm:flex"
          >
            <Settings className="mr-1.5 h-4 w-4" />
            {t("설정", "Settings")}
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl bg-[#FAFAF9] p-4">
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <Bookmark className="h-3 w-3" /> {t("북마크", "Bookmarks")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">3</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <Eye className="h-3 w-3" /> {t("최근 본", "Recent")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">12</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <UserCheck className="h-3 w-3" /> {t("팔로우", "Following")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">2</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <Heart className="h-3 w-3" /> {t("좋아요", "Likes")}
            </p>
            <p className="mt-1 text-lg font-bold text-[#1C1917]">8</p>
          </div>
        </div>
      </div>

      {/* Bookmarks */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-[#EA580C]" />
          <h2 className="text-lg font-bold text-[#1A1A1A]">{t("북마크한 리포트", "Bookmarked Reports")}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
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
