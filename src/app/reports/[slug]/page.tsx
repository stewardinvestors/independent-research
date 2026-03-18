"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  Eye,
  Clock,
  Heart,
  CheckCircle2,
  Star,
  Calendar,
  ShoppingCart,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockReports, opinionLabels, formatNumber, reportTypeLabels } from "@/data/mock";
import { ReportCard } from "@/components/report/ReportCard";
import { CommentSection } from "@/components/report/CommentSection";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { event as gtagEvent } from "@/lib/gtag";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLang();
  const { user } = useAuth();
  const report = mockReports.find((r) => r.slug === slug);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bought, setBought] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);

  const bookmarkKey = user ? `flint-bookmarks-${user.id}` : "";

  const getBookmarks = useCallback((): string[] => {
    if (!user) return [];
    try {
      return JSON.parse(localStorage.getItem(bookmarkKey) || "[]");
    } catch {
      return [];
    }
  }, [user, bookmarkKey]);

  useEffect(() => {
    if (!report) return;
    const stored = localStorage.getItem(`flint-likes-${report.id}`);
    const storedCount = localStorage.getItem(`flint-like-count-${report.id}`);
    if (stored === "true") setLiked(true);
    setLikeCount(storedCount ? parseInt(storedCount, 10) : report.likeCount);
    const storedBought = localStorage.getItem(`flint-bought-${report.id}`);
    if (storedBought === "true") setBought(true);
    // Bookmark
    if (user) {
      const bm = getBookmarks();
      setBookmarked(bm.includes(report.id));
    }
  }, [report, user, getBookmarks]);

  // GA4: 스크롤 구간별 이벤트 (25%, 50%, 75%, 90%)
  useEffect(() => {
    if (!report) return;
    const thresholds = [25, 50, 75, 90];
    const fired = new Set<number>();
    const handleScroll = () => {
      const scrollPercent =
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100;
      for (const threshold of thresholds) {
        if (scrollPercent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          gtagEvent({
            action: threshold === 90 ? "report_read_complete" : "report_scroll_depth",
            category: "engagement",
            label: report.slug,
            report_id: report.id,
            stock_code: report.stock?.code ?? "",
            scroll_depth: threshold,
          });
        }
      }
      if (fired.size === thresholds.length) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [report]);

  const handleLike = () => {
    if (!report) return;
    if (!liked) {
      const newCount = likeCount + 1;
      setLiked(true);
      setLikeCount(newCount);
      localStorage.setItem(`flint-likes-${report.id}`, "true");
      localStorage.setItem(`flint-like-count-${report.id}`, String(newCount));
      gtagEvent({
        action: "report_helpful",
        category: "engagement",
        label: report.slug,
        report_id: report.id,
        stock_code: report.stock?.code ?? "",
      });
    } else {
      const newCount = likeCount - 1;
      setLiked(false);
      setLikeCount(newCount);
      localStorage.setItem(`flint-likes-${report.id}`, "false");
      localStorage.setItem(`flint-like-count-${report.id}`, String(newCount));
    }
  };

  const handleBought = () => {
    if (!report) return;
    if (!bought) {
      setBought(true);
      localStorage.setItem(`flint-bought-${report.id}`, "true");
      gtagEvent({
        action: "report_bought",
        category: "conversion",
        label: report.slug,
        report_id: report.id,
        stock_code: report.stock?.code ?? "",
      });
    } else {
      setBought(false);
      localStorage.setItem(`flint-bought-${report.id}`, "false");
    }
  };

  const handleBookmark = () => {
    if (!report || !user) return;
    const bm = getBookmarks();
    if (bookmarked) {
      const next = bm.filter((id) => id !== report.id);
      localStorage.setItem(bookmarkKey, JSON.stringify(next));
      setBookmarked(false);
    } else {
      bm.push(report.id);
      localStorage.setItem(bookmarkKey, JSON.stringify(bm));
      setBookmarked(true);
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const url = window.location.href;
    const text = `${report.title} - Flint`;
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    }
  };

  if (!report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {t("리포트를 찾을 수 없습니다", "Report not found")}
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

  const relatedReports = mockReports
    .filter(
      (r) =>
        r.id !== report.id &&
        (r.stock?.sector === report.stock?.sector ||
          r.stockId === report.stockId)
    )
    .slice(0, 3);

  const riskLevel = report.opinion === "BUY" ? 3 : report.opinion === "HOLD" ? 2 : 4;

  const opinionLabelsEn: Record<string, string> = {
    BUY: "Buy",
    HOLD: "Hold",
    SELL: "Sell",
    NONE: "No Opinion",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Back link */}
      <Link
        href="/reports"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1C1917]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("리포트 목록", "Reports")}
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Stock info */}
        {report.stock && (
          <div className="mb-4 flex items-center gap-2">
            <Link
              href={`/stocks/${report.stock.code}`}
              className="text-lg font-bold text-[#1C1917] hover:underline"
            >
              {report.stock.name}
            </Link>
            <span className="text-sm text-[#6B7280]">{report.stock.code}</span>
            <Badge
              variant="secondary"
              className="rounded-full bg-[#78716C]/10 text-xs text-[#78716C]"
            >
              {report.stock.market}
            </Badge>
          </div>
        )}

        <h1 className="text-2xl font-bold leading-tight text-[#1A1A1A] sm:text-3xl">
          {report.title}
        </h1>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {report.publishedAt}
          </span>
          <Link
            href={`/analysts/${report.author.id}`}
            className="font-medium text-[#1C1917] hover:underline"
          >
            {report.author.name}
          </Link>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {formatNumber(report.viewCount)}
          </span>
          {report.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {report.readTime}{t("분", "min")}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E5E7EB] text-[#6B7280] hover:text-[#1C1917]"
            onClick={() => {
              gtagEvent({
                action: "pdf_download",
                category: "download",
                label: report.slug,
                report_id: report.id,
                stock_code: report.stock?.code ?? "",
              });
              window.print();
            }}
          >
            <Download className="mr-1.5 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`rounded-xl border-[#E5E7EB] transition-colors ${
              bookmarked
                ? "border-[#EA580C] bg-[#EA580C]/5 text-[#EA580C]"
                : "text-[#6B7280] hover:text-[#1C1917]"
            }`}
            onClick={handleBookmark}
            disabled={!user}
            title={!user ? t("로그인이 필요합니다", "Login required") : ""}
          >
            {bookmarked ? (
              <BookmarkCheck className="mr-1.5 h-4 w-4" />
            ) : (
              <Bookmark className="mr-1.5 h-4 w-4" />
            )}
            {bookmarked ? t("북마크됨", "Bookmarked") : t("북마크", "Bookmark")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#E5E7EB] text-[#6B7280] hover:text-[#1C1917]"
            onClick={handleShare}
          >
            {shareMsg ? (
              <Check className="mr-1.5 h-4 w-4 text-[#10B981]" />
            ) : (
              <Share2 className="mr-1.5 h-4 w-4" />
            )}
            {shareMsg ? t("복사됨!", "Copied!") : t("공유", "Share")}
          </Button>
        </div>
      </header>

      {/* Investment summary card */}
      {report.opinion && (
        <div className="mb-10 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[#6B7280]">{t("투자의견", "Opinion")}</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  report.opinion === "BUY"
                    ? "text-[#EA580C]"
                    : report.opinion === "SELL"
                    ? "text-[#C94040]"
                    : "text-[#6B7280]"
                }`}
              >
                {t(opinionLabels[report.opinion], opinionLabelsEn[report.opinion])}
              </p>
            </div>
            {report.targetPrice && (
              <div>
                <p className="text-xs text-[#6B7280]">{t("목표가", "Target Price")}</p>
                <p className="mt-1 text-lg font-bold text-[#1A1A1A]">
                  {formatNumber(report.targetPrice)}{t("원", " KRW")}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#6B7280]">{t("리스크", "Risk")}</p>
              <div className="mt-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i <= riskLevel
                        ? "fill-[#F59E0B] text-[#F59E0B]"
                        : "text-[#E5E7EB]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {report.keyPoints.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">
                  {t("핵심 포인트", "Key Points")}
                </p>
                <ul className="space-y-2">
                  {report.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#78716C]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {/* Report body (mock content) */}
      <article className="prose prose-lg mx-auto max-w-none">
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          {t("1. 기업 개요", "1. Company Overview")}
        </h2>
        <p className="leading-relaxed text-[#78716C]">
          {report.stock?.name}({report.stock?.code}){t("은", " is a")}{" "}
          {report.stock?.sector}{" "}
          {t(
            `섹터에 속한 ${report.stock?.market} 상장 기업으로, 독자적인 기술력과 파이프라인을 기반으로 성장하고 있습니다. 현재 시가총액 기준으로 증권사 커버리지가 부재한 상태이며, 이에 따라 시장에서의 정보 비대칭이 존재합니다.`,
            ` company listed on ${report.stock?.market}, growing based on proprietary technology and pipeline. Currently, there is no brokerage coverage based on market capitalization, resulting in information asymmetry in the market.`
          )}
        </p>

        <h2 className="mt-8 text-xl font-bold text-[#1A1A1A]">
          {t("2. 투자 포인트", "2. Investment Points")}
        </h2>
        <p className="leading-relaxed text-[#78716C]">
          {t(
            "핵심 투자 포인트는 다음과 같습니다. 첫째, 기존 사업부의 안정적인 성장세가 지속되고 있습니다. 둘째, 신규 사업 영역으로의 확장을 통해 중장기 성장 동력을 확보하고 있습니다. 셋째, 경영진의 주주 친화적 정책이 기업 가치 제고에 기여하고 있습니다.",
            "The key investment points are as follows. First, the existing business division continues to show stable growth. Second, expansion into new business areas is securing medium-to-long-term growth drivers. Third, management's shareholder-friendly policies are contributing to corporate value enhancement."
          )}
        </p>

        {/* Mock financial table */}
        <h2 className="mt-8 text-xl font-bold text-[#1A1A1A]">
          {t("3. 주요 재무 지표", "3. Key Financial Indicators")}
        </h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAF9]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1A1A]">
                  {t("항목", "Item")}
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">
                  2024A
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">
                  2025E
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">
                  2026E
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              <tr>
                <td className="px-4 py-3 text-[#78716C]">
                  {t("매출액 (억원)", "Revenue (100M KRW)")}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  1,234
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  1,567
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#EA580C]">
                  2,103
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#78716C]">
                  {t("영업이익 (억원)", "Operating Profit (100M KRW)")}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#C94040]">
                  -89
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  45
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#EA580C]">
                  312
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#78716C]">
                  {t("순이익 (억원)", "Net Profit (100M KRW)")}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#C94040]">
                  -156
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  12
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#EA580C]">
                  245
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-xl font-bold text-[#1A1A1A]">
          {t("4. 리스크 요인", "4. Risk Factors")}
        </h2>
        <p className="leading-relaxed text-[#78716C]">
          {t(
            "주요 리스크 요인으로는 파이프라인 개발 지연 가능성, 경쟁 심화에 따른 마진 압박, 그리고 거시경제 불확실성이 있습니다. 다만, 이러한 리스크는 현재 주가에 상당 부분 반영되어 있다고 판단합니다.",
            "Key risk factors include potential pipeline development delays, margin pressure from intensified competition, and macroeconomic uncertainty. However, we believe these risks are largely reflected in the current stock price."
          )}
        </p>

        <h2 className="mt-8 text-xl font-bold text-[#1A1A1A]">
          {t("5. 밸류에이션 및 결론", "5. Valuation & Conclusion")}
        </h2>
        <p className="leading-relaxed text-[#78716C]">
          {t(
            `목표가 ${report.targetPrice ? formatNumber(report.targetPrice) : "-"}원은 2026년 추정 실적 기준 PER 배수를 적용하여 산출하였습니다. 현재가 대비 충분한 상승 여력이 있다고 판단하며, ${opinionLabels[report.opinion ?? "NONE"]} 의견을 제시합니다.`,
            `The target price of ${report.targetPrice ? formatNumber(report.targetPrice) : "-"} KRW was calculated by applying PER multiples based on 2026 estimated earnings. We believe there is sufficient upside from the current price and present a ${opinionLabelsEn[report.opinion ?? "NONE"]} opinion.`
          )}
        </p>
      </article>

      {/* Action buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleBought}
          className={`flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors ${
            bought
              ? "border-[#EA580C] bg-[#EA580C]/5 text-[#EA580C]"
              : "border-[#E5E7EB] text-[#6B7280] hover:border-[#EA580C] hover:text-[#EA580C]"
          }`}
        >
          <ShoppingCart className={`h-5 w-5 ${bought ? "fill-[#EA580C]" : ""}`} />
          {t("매수했어요", "I bought it")}
        </button>
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors ${
            liked
              ? "border-[#C94040] bg-[#C94040]/5 text-[#C94040]"
              : "border-[#E5E7EB] text-[#6B7280] hover:border-[#C94040] hover:text-[#C94040]"
          }`}
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-[#C94040]" : ""}`} />
          {t("도움이 됐어요", "Helpful")} {formatNumber(likeCount)}
        </button>
      </div>

      {/* Author card */}
      <div className="mt-10 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1C1917] text-lg font-bold text-white">
            {report.author.name[0]}
          </div>
          <div>
            <Link
              href={`/analysts/${report.author.id}`}
              className="font-semibold text-[#1A1A1A] hover:underline"
            >
              {report.author.name} {t("애널리스트", "Analyst")}
            </Link>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              {report.author.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <details className="mt-8 rounded-2xl border border-[#E5E7EB] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[#6B7280]">
          {t("투자 유의사항 및 법적 고지", "Investment Disclaimer & Legal Notice")}
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#6B7280]">
          <p>
            {t(
              "본 리포트는 투자 참고 자료이며, 투자 권유를 목적으로 하지 않습니다. 투자 판단의 최종 책임은 투자자 본인에게 있습니다.",
              "This report is for reference purposes only and does not constitute investment advice. The final responsibility for investment decisions lies with the investor."
            )}
          </p>
          <p>
            {t(
              "작성자는 본 리포트에 언급된 종목에 대해 작성 시점 기준 이해관계가 없음을 고지합니다.",
              "The author discloses no conflicts of interest regarding the stocks mentioned in this report as of the time of writing."
            )}
          </p>
          <p>
            {t(
              "본 리포트의 내용은 작성 시점의 판단이며, 이후 시장 상황 변화에 따라 변경될 수 있습니다.",
              "The contents of this report reflect judgment at the time of writing and may change with market conditions."
            )}
          </p>
        </div>
      </details>

      {/* Comments */}
      <CommentSection reportId={report.id} />

      {/* Related reports */}
      {relatedReports.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-[#1A1A1A]">
            {t("관련 리포트", "Related Reports")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedReports.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
