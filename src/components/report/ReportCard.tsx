"use client";

import Link from "next/link";
import { Eye, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Report } from "@/types";
import { opinionLabels, formatNumber } from "@/data/mock";
import { useLang } from "@/contexts/LanguageContext";

const opinionLabelsEn: Record<string, string> = {
  BUY: "Buy",
  HOLD: "Hold",
  SELL: "Sell",
  NONE: "No Opinion",
};

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const { t } = useLang();
  const currentPrice = report.targetPrice
    ? Math.round(report.targetPrice * 0.75)
    : undefined;
  const upside =
    report.targetPrice && currentPrice
      ? ((report.targetPrice - currentPrice) / currentPrice) * 100
      : 0;

  return (
    <Link href={`/reports/${report.slug}`}>
      <article className="group flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {report.stock && (
            <Badge
              variant="secondary"
              className="rounded-full bg-[#1C1917]/5 text-xs text-[#1C1917]"
            >
              {report.stock.sector}
            </Badge>
          )}
          {report.stock && (
            <Badge
              variant="secondary"
              className="rounded-full bg-[#78716C]/10 text-xs text-[#78716C]"
            >
              {report.stock.market}
            </Badge>
          )}
        </div>

        {/* Stock info */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#EA580C]">
            {report.stock?.name ?? t("산업분석", "Industry Analysis")}
          </h3>
          {report.stock && (
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {report.stock.code}
            </p>
          )}
        </div>

        {/* Report title */}
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-[#78716C]">
          {report.title}
        </p>

        {/* Target price */}
        {report.opinion && report.targetPrice && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`text-xs font-semibold ${
                report.opinion === "BUY"
                  ? "text-[#EA580C]"
                  : report.opinion === "SELL"
                  ? "text-[#C94040]"
                  : "text-[#6B7280]"
              }`}
            >
              {t(opinionLabels[report.opinion], opinionLabelsEn[report.opinion])}
            </span>
            <span className="text-sm font-bold text-[#1A1A1A]">
              {formatNumber(report.targetPrice)}{t("원", " KRW")}
            </span>
            {upside > 0 ? (
              <span className="flex items-center gap-0.5 text-xs font-medium text-[#EA580C]">
                <TrendingUp className="h-3 w-3" />+{upside.toFixed(0)}%
              </span>
            ) : upside < 0 ? (
              <span className="flex items-center gap-0.5 text-xs font-medium text-[#C94040]">
                <TrendingDown className="h-3 w-3" />{upside.toFixed(0)}%
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs text-[#6B7280]">
                <Minus className="h-3 w-3" />0%
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="mt-4 flex items-center gap-3 border-t border-[#E5E7EB] pt-4 text-xs text-[#6B7280]">
          <span>{report.author.name}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {report.publishedAt}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatNumber(report.viewCount)}
          </span>
        </div>
      </article>
    </Link>
  );
}
