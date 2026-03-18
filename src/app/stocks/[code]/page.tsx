"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockStocks, mockReports, formatMarketCap, opinionLabels } from "@/data/mock";
import { ReportCard } from "@/components/report/ReportCard";
import { useLang } from "@/contexts/LanguageContext";

export default function StockPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { t } = useLang();
  const stock = mockStocks.find((s) => s.code === code);
  const stockReports = mockReports.filter((r) => r.stock?.code === code);

  if (!stock) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {t("종목을 찾을 수 없습니다", "Stock not found")}
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

  const buyCount = stockReports.filter((r) => r.opinion === "BUY").length;
  const holdCount = stockReports.filter((r) => r.opinion === "HOLD").length;
  const sellCount = stockReports.filter((r) => r.opinion === "SELL").length;
  const total = buyCount + holdCount + sellCount;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/reports"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1C1917]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("뒤로", "Back")}
      </Link>

      {/* Stock header */}
      <div className="mb-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
            {stock.name}
          </h1>
          <span className="text-lg text-[#6B7280]">{stock.code}</span>
          <Badge
            variant="secondary"
            className="rounded-full bg-[#78716C]/10 text-sm text-[#78716C]"
          >
            {stock.market}
          </Badge>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-[#6B7280]">{t("시가총액", "Market Cap")}</p>
            <p className="mt-1 text-xl font-bold text-[#1A1A1A]">
              {formatMarketCap(stock.marketCap)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t("산업 분류", "Sector")}</p>
            <p className="mt-1 text-xl font-bold text-[#1A1A1A]">
              {stock.sector}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t("발간 리포트", "Published Reports")}</p>
            <p className="mt-1 text-xl font-bold text-[#1A1A1A]">
              {stockReports.length}{t("건", "")}
            </p>
          </div>
        </div>

        {/* Opinion consensus */}
        {total > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              {t("투자의견 컨센서스", "Opinion Consensus")}
            </p>
            <div className="flex h-6 overflow-hidden rounded-full">
              {buyCount > 0 && (
                <div
                  className="flex items-center justify-center bg-[#EA580C] text-xs font-medium text-white"
                  style={{ width: `${(buyCount / total) * 100}%` }}
                >
                  {t("매수", "Buy")} {buyCount}
                </div>
              )}
              {holdCount > 0 && (
                <div
                  className="flex items-center justify-center bg-[#F59E0B] text-xs font-medium text-white"
                  style={{ width: `${(holdCount / total) * 100}%` }}
                >
                  {t("중립", "Hold")} {holdCount}
                </div>
              )}
              {sellCount > 0 && (
                <div
                  className="flex items-center justify-center bg-[#C94040] text-xs font-medium text-white"
                  style={{ width: `${(sellCount / total) * 100}%` }}
                >
                  {t("매도", "Sell")} {sellCount}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reports timeline */}
      <h2 className="mb-6 text-xl font-bold text-[#1A1A1A]">{t("리포트 타임라인", "Report Timeline")}</h2>
      {stockReports.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stockReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] py-16">
          <TrendingUp className="h-10 w-10 text-[#E5E7EB]" />
          <p className="mt-4 text-[#6B7280]">{t("아직 발간된 리포트가 없습니다", "No reports published yet")}</p>
        </div>
      )}
    </div>
  );
}
