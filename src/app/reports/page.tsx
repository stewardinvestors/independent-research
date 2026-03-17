"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "@/components/report/ReportCard";
import { mockReports, reportTypeLabels } from "@/data/mock";
import type { Market, ReportType } from "@/types";

const markets: { label: string; value: Market | "ALL" }[] = [
  { label: "전체", value: "ALL" },
  { label: "코스피", value: "KOSPI" },
  { label: "코스닥", value: "KOSDAQ" },
  { label: "코넥스", value: "KONEX" },
];

const reportTypes: { label: string; value: ReportType | "ALL" }[] = [
  { label: "전체", value: "ALL" },
  ...Object.entries(reportTypeLabels).map(([value, label]) => ({
    label,
    value: value as ReportType,
  })),
];

const sortOptions = [
  { label: "최신순", value: "latest" },
  { label: "조회순", value: "views" },
  { label: "좋아요순", value: "likes" },
] as const;

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<Market | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<ReportType | "ALL">("ALL");
  const [sort, setSort] = useState<"latest" | "views" | "likes">("latest");

  const filteredReports = useMemo(() => {
    let reports = [...mockReports];

    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.stock?.name.toLowerCase().includes(q) ||
          r.stock?.code.includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedMarket !== "ALL") {
      reports = reports.filter((r) => r.stock?.market === selectedMarket);
    }

    if (selectedType !== "ALL") {
      reports = reports.filter((r) => r.type === selectedType);
    }

    switch (sort) {
      case "views":
        reports.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "likes":
        reports.sort((a, b) => b.likeCount - a.likeCount);
        break;
      default:
        reports.sort(
          (a, b) =>
            new Date(b.publishedAt ?? 0).getTime() -
            new Date(a.publishedAt ?? 0).getTime()
        );
    }

    return reports;
  }, [search, selectedMarket, selectedType, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          리포트
        </h1>
        <p className="mt-2 text-[#6B7280]">
          독립 애널리스트가 작성한 기업분석 리포트
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
        <Input
          placeholder="종목명, 종목코드, 키워드로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-xl border-[#E5E7EB] pl-12 text-sm focus:border-[#EA580C] focus:ring-[#EA580C]"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Market filter */}
        <div className="flex flex-wrap gap-2">
          {markets.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMarket(m.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedMarket === m.value
                  ? "bg-[#1C1917] text-white"
                  : "bg-[#FAFAF9] text-[#6B7280] hover:bg-[#E5E7EB]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedType === t.value
                  ? "bg-[#1C1917] text-white"
                  : "bg-[#FAFAF9] text-[#6B7280] hover:bg-[#E5E7EB]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          {sortOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`text-sm font-medium transition-colors ${
                sort === s.value
                  ? "text-[#EA580C] underline underline-offset-4"
                  : "text-[#6B7280] hover:text-[#1A1A1A]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <Badge variant="secondary" className="rounded-full bg-[#FAFAF9] text-xs text-[#6B7280]">
          {filteredReports.length}개 리포트
        </Badge>
      </div>

      {/* Report grid */}
      {filteredReports.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-[#1A1A1A]">
            검색 결과가 없습니다
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            다른 키워드로 검색해보세요
          </p>
        </div>
      )}
    </div>
  );
}
