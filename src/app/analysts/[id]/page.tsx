"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Eye, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAnalysts, mockReports, formatNumber } from "@/data/mock";
import { ReportCard } from "@/components/report/ReportCard";
import { useLang } from "@/contexts/LanguageContext";

export default function AnalystPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLang();
  const analyst = mockAnalysts.find((a) => a.id === id);
  const analystReports = mockReports.filter((r) => r.authorId === id);

  if (!analyst) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {t("애널리스트를 찾을 수 없습니다", "Analyst not found")}
        </h1>
        <Link
          href="/reports"
          className="mt-4 text-sm text-[#1C1917] hover:underline"
        >
          {t("리포트 목록으로 돌아가기", "Back to reports")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/reports"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1C1917]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("뒤로", "Back")}
      </Link>

      {/* Profile card */}
      <div className="mb-10 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1C1917] text-2xl font-bold text-white">
            {analyst.name[0]}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {analyst.name}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {analyst.bio}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {analyst.coverSectors.map((sector) => (
                <Badge
                  key={sector}
                  variant="secondary"
                  className="rounded-full bg-[#1C1917]/5 text-xs text-[#1C1917]"
                >
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
          <Button className="rounded-xl bg-[#EA580C] hover:bg-[#C2410C]">
            <UserPlus className="mr-1.5 h-4 w-4" />
            {t("팔로우", "Follow")}
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-[#FAFAF9] p-4">
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <FileText className="h-3 w-3" /> {t("리포트", "Reports")}
            </p>
            <p className="mt-1 text-xl font-bold text-[#1C1917]">
              {analyst.reportCount}
            </p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-xs text-[#6B7280]">
              <Eye className="h-3 w-3" /> {t("총 조회수", "Total Views")}
            </p>
            <p className="mt-1 text-xl font-bold text-[#1C1917]">
              {formatNumber(analyst.totalViews)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#6B7280]">{t("평균 조회수", "Avg. Views")}</p>
            <p className="mt-1 text-xl font-bold text-[#1C1917]">
              {analyst.reportCount > 0
                ? formatNumber(
                    Math.round(analyst.totalViews / analyst.reportCount)
                  )
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Reports */}
      <h2 className="mb-6 text-xl font-bold text-[#1A1A1A]">{t("발간 리포트", "Published Reports")}</h2>
      {analystReports.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {analystReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] py-16">
          <p className="text-[#6B7280]">{t("아직 발간된 리포트가 없습니다", "No reports published yet")}</p>
        </div>
      )}
    </div>
  );
}
