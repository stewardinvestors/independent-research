"use client";

import { useState, useMemo, useRef } from "react";
import { Search, Upload, FileUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/report/ReportCard";
import { mockReports, reportTypeLabels } from "@/data/mock";
import { useLang } from "@/contexts/LanguageContext";
import type { Market, ReportType } from "@/types";

export default function ReportsPage() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<Market | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<ReportType | "ALL">("ALL");
  const [sort, setSort] = useState<"latest" | "views" | "likes">("latest");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markets: { label: string; value: Market | "ALL" }[] = [
    { label: t("전체", "All"), value: "ALL" },
    { label: t("코스피", "KOSPI"), value: "KOSPI" },
    { label: t("코스닥", "KOSDAQ"), value: "KOSDAQ" },
  ];

  const reportTypes: { label: string; value: ReportType | "ALL" }[] = [
    { label: t("전체", "All"), value: "ALL" },
    ...Object.entries(reportTypeLabels).map(([value, label]) => ({
      label: t(label, value === "COMPANY" ? "Company Analysis" : value === "INDUSTRY" ? "Industry Analysis" : value === "EARNINGS" ? "Earnings Update" : "IPO Analysis"),
      value: value as ReportType,
    })),
  ];

  const sortOptions = [
    { label: t("최신순", "Latest"), value: "latest" as const },
    { label: t("조회순", "Most Viewed"), value: "views" as const },
    { label: t("좋아요순", "Most Liked"), value: "likes" as const },
  ];

  const filteredReports = useMemo(() => {
    let reports = [...mockReports];

    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.stock?.name.toLowerCase().includes(q) ||
          r.stock?.code.includes(q) ||
          r.tags.some((tag) => tag.toLowerCase().includes(q))
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          {t("리포트", "Reports")}
        </h1>
        <p className="mt-2 text-[#6B7280]">
          {t("독립 애널리스트가 작성한 기업분석 리포트", "Corporate analysis reports by independent analysts")}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
        <Input
          placeholder={t("종목명, 종목코드, 키워드로 검색", "Search by stock name, code, or keyword")}
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
          {reportTypes.map((tp) => (
            <button
              key={tp.value}
              onClick={() => setSelectedType(tp.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedType === tp.value
                  ? "bg-[#1C1917] text-white"
                  : "bg-[#FAFAF9] text-[#6B7280] hover:bg-[#E5E7EB]"
              }`}
            >
              {tp.label}
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
          {filteredReports.length}{t("개 리포트", " reports")}
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
            {t("검색 결과가 없습니다", "No results found")}
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            {t("다른 키워드로 검색해보세요", "Try different keywords")}
          </p>
        </div>
      )}

      {/* Upload FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#EA580C] text-white shadow-lg transition-all hover:scale-105 hover:bg-[#C2410C] hover:shadow-xl"
        title={t("리포트 업로드", "Upload Report")}
      >
        <Upload className="h-6 w-6" />
      </button>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {t("리포트 업로드", "Upload Report")}
              </h3>
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); }}
                className="rounded-lg p-1 text-[#6B7280] hover:bg-[#FAFAF9]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-[#E5E7EB] p-8 text-center transition-colors hover:border-[#EA580C]"
            >
              <FileUp className="mx-auto h-10 w-10 text-[#6B7280]" />
              <p className="mt-2 text-sm text-[#6B7280]">
                {t("PDF 파일을 클릭하여 업로드", "Click to upload PDF file")}
              </p>
              <p className="mt-1 text-xs text-[#78716C]">{t("최대 50MB", "Max 50MB")}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadFile && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FAFAF9] px-4 py-3">
                <FileUp className="h-4 w-4 text-[#EA580C]" />
                <span className="flex-1 truncate text-sm text-[#1A1A1A]">{uploadFile.name}</span>
                <button onClick={() => setUploadFile(null)}>
                  <X className="h-4 w-4 text-[#6B7280]" />
                </button>
              </div>
            )}

            <Button
              disabled={!uploadFile}
              className="mt-4 h-12 w-full rounded-xl bg-[#EA580C] hover:bg-[#C2410C]"
              onClick={() => {
                alert(t("리포트가 업로드되었습니다.", "Report has been uploaded."));
                setShowUpload(false);
                setUploadFile(null);
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              {t("업로드", "Upload")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
