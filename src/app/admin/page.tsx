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

const statsCards = [
  {
    label: "총 리포트",
    value: "156",
    change: "+12",
    icon: FileText,
    color: "#0D2137",
  },
  {
    label: "검토 대기",
    value: "3",
    change: null,
    icon: Clock,
    color: "#F59E0B",
  },
  {
    label: "등록 애널리스트",
    value: "24",
    change: "+2",
    icon: Users,
    color: "#2E8B57",
  },
  {
    label: "이번 달 조회수",
    value: "45,200",
    change: "+15%",
    icon: TrendingUp,
    color: "#4A6D8C",
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          관리자 대시보드
        </h1>
        <p className="mt-2 text-[#6B7280]">플랫폼 운영 현황을 확인하세요</p>
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
                  className="rounded-full bg-[#2E8B57]/10 text-xs text-[#2E8B57]"
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
          검토 대기 리포트
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
                  className="rounded-lg bg-[#2E8B57] hover:bg-[#247048]"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  승인
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-[#C94040] text-[#C94040] hover:bg-[#C94040] hover:text-white"
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  반려
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent analysts */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-[#1A1A1A]">
          등록 애널리스트
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockAnalysts.map((analyst) => (
            <div
              key={analyst.id}
              className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0D2137] font-bold text-white">
                {analyst.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#1A1A1A]">{analyst.name}</p>
                <p className="text-xs text-[#6B7280]">
                  리포트 {analyst.reportCount}건 | 조회{" "}
                  {formatNumber(analyst.totalViews)}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full bg-[#2E8B57]/10 text-xs text-[#2E8B57]"
              >
                활동중
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
