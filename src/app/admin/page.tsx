"use client";

import {
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockReports, mockAnalysts, formatNumber } from "@/data/mock";
import { useLang } from "@/contexts/LanguageContext";

export default function AdminPage() {
  const { t } = useLang();

  const statsCards = [
    {
      label: t("총 리포트", "Total Reports"),
      value: "156",
      change: "+12",
      icon: FileText,
      color: "#1C1917",
    },
    {
      label: t("검토 대기", "Pending Review"),
      value: "3",
      change: null,
      icon: Clock,
      color: "#F59E0B",
    },
    {
      label: t("등록 애널리스트", "Registered Analysts"),
      value: "24",
      change: "+2",
      icon: Users,
      color: "#EA580C",
    },
    {
      label: t("이번 달 조회수", "Monthly Views"),
      value: "45,200",
      change: "+15%",
      icon: TrendingUp,
      color: "#78716C",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          {t("관리자 대시보드", "Admin Dashboard")}
        </h1>
        <p className="mt-2 text-[#6B7280]">{t("플랫폼 운영 현황을 확인하세요", "Monitor platform operations")}</p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              {stat.change && (
                <Badge
                  variant="secondary"
                  className="rounded-full bg-[#EA580C]/10 text-xs text-[#EA580C]"
                >
                  {stat.change}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold text-[#1A1A1A]">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending reviews */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">
          {t("검토 대기 리포트", "Pending Reports")}
        </h2>
        <div className="space-y-3">
          {mockReports.slice(0, 3).map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-[#1A1A1A]">{report.title}</p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {report.author.name} | {report.stock?.name} |{" "}
                  {report.createdAt}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-lg bg-[#EA580C] hover:bg-[#C2410C]"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  {t("승인", "Approve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-[#C94040] text-[#C94040] hover:bg-[#C94040] hover:text-white"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  {t("반려", "Reject")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent analysts */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">
          {t("등록 애널리스트", "Registered Analysts")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockAnalysts.map((analyst) => (
            <div
              key={analyst.id}
              className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1917] font-bold text-white">
                {analyst.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#1A1A1A]">{analyst.name}</p>
                <p className="text-xs text-[#6B7280]">
                  {t("리포트", "Reports")} {analyst.reportCount}{t("건", "")} | {t("조회", "Views")}{" "}
                  {formatNumber(analyst.totalViews)}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full bg-[#EA580C]/10 text-xs text-[#EA580C]"
              >
                {t("활동중", "Active")}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
