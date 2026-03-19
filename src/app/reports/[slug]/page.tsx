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
  Calendar,
  Check,
  TrendingUp,
  Minus,
  TrendingDown,
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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const opinionLabelsEn: Record<string, string> = {
  BULL: "Bull Case",
  BASE: "Base Case",
  BEAR: "Bear Case",
  NONE: "No Scenario",
};

const scenarioColors: Record<string, string> = {
  BULL: "border-[#EA580C]/30 bg-[#EA580C]/5",
  BASE: "border-[#6B7280]/30 bg-[#6B7280]/5",
  BEAR: "border-[#C94040]/30 bg-[#C94040]/5",
};

const scenarioTextColors: Record<string, string> = {
  BULL: "text-[#EA580C]",
  BASE: "text-[#6B7280]",
  BEAR: "text-[#C94040]",
};

const scenarioIcons: Record<string, typeof TrendingUp> = {
  BULL: TrendingUp,
  BASE: Minus,
  BEAR: TrendingDown,
};

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLang();
  const { user } = useAuth();
  const report = mockReports.find((r) => r.slug === slug);
  const useSupabase = isSupabaseConfigured();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
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

    if (useSupabase) {
      supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("report_id", report.id)
        .then(({ count }) => {
          setLikeCount(count ?? report.likeCount);
        });

      if (user) {
        supabase
          .from("likes")
          .select("id")
          .eq("report_id", report.id)
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            setLiked(!!data);
          });

        supabase
          .from("bookmarks")
          .select("id")
          .eq("report_id", report.id)
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            setBookmarked(!!data);
          });
      }
    } else {
      const stored = localStorage.getItem(`flint-likes-${report.id}`);
      const storedCount = localStorage.getItem(`flint-like-count-${report.id}`);
      if (stored === "true") setLiked(true);
      setLikeCount(storedCount ? parseInt(storedCount, 10) : report.likeCount);
      if (user) {
        const bm = getBookmarks();
        setBookmarked(bm.includes(report.id));
      }
    }
  }, [report, user, useSupabase, getBookmarks]);

  // GA4: 스크롤 구간별 이벤트
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

  const handleLike = async () => {
    if (!report) return;

    if (useSupabase) {
      if (!user) return;
      if (!liked) {
        const { error } = await supabase.from("likes").insert({
          user_id: user.id,
          report_id: report.id,
        });
        if (!error) {
          setLiked(true);
          setLikeCount((c) => c + 1);
          gtagEvent({
            action: "report_helpful",
            category: "engagement",
            label: report.slug,
            report_id: report.id,
            stock_code: report.stock?.code ?? "",
          });
        }
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("report_id", report.id);
        if (!error) {
          setLiked(false);
          setLikeCount((c) => c - 1);
        }
      }
    } else {
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
    }
  };

  const handleBookmark = async () => {
    if (!report || !user) return;

    if (useSupabase) {
      if (bookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("report_id", report.id);
        if (!error) setBookmarked(false);
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          user_id: user.id,
          report_id: report.id,
        });
        if (!error) setBookmarked(true);
      }
    } else {
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

      {/* Scenario analysis card */}
      {report.scenarios && report.scenarios.length > 0 && (
        <div className="mb-10 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-6">
          <p className="mb-4 text-sm font-semibold text-[#1A1A1A]">
            {t("시나리오 분석", "Scenario Analysis")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {report.scenarios.map((scenario) => {
              const Icon = scenarioIcons[scenario.type];
              const isFocused = report.opinion === scenario.type;
              return (
                <div
                  key={scenario.type}
                  className={`rounded-xl border p-4 transition-all ${
                    isFocused
                      ? scenarioColors[scenario.type]
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-4 w-4 ${scenarioTextColors[scenario.type]}`} />
                    <span className={`text-xs font-semibold ${scenarioTextColors[scenario.type]}`}>
                      {t(scenario.label, scenario.type === "BULL" ? "Bull Case" : scenario.type === "BASE" ? "Base Case" : "Bear Case")}
                    </span>
                    {isFocused && (
                      <Badge className="ml-auto rounded-full bg-[#1C1917] px-2 py-0 text-[10px] text-white">
                        {t("주요", "Focus")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#78716C]">
                    {scenario.description}
                  </p>
                </div>
              );
            })}
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

      {/* Report body */}
      <article className="prose prose-lg mx-auto max-w-none">
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          {t("1. 기업 개요", "1. Company Overview")}
        </h2>
        <p className="leading-relaxed text-[#78716C]">
          {report.stock?.name}({report.stock?.code}){t("은", " is a")}{" "}
          {report.stock?.sector}{" "}
          {t(
            `섹터에 속한 ${report.stock?.market} 상장 기업으로, 독자적인 기술력을 기반으로 사업을 영위하고 있습니다. 현재 시가총액 기준으로 증권사 커버리지가 전무한 상태이며, 이에 따라 시장에서의 정보 비대칭이 상당합니다.`,
            ` company listed on ${report.stock?.market}, operating based on proprietary technology. Currently, there is zero brokerage coverage, resulting in significant information asymmetry in the market.`
          )}
        </p>

        <h2 className="mt-8 text-xl font-bold text-[#1A1A1A]">
          {t("2. 분석 포인트", "2. Analysis Points")}
        </h2>
        <p className="leading-relaxed text-[#78716C]">
          {t(
            "본 리포트에서 주목하는 핵심 분석 포인트는 다음과 같습니다. 첫째, 기존 사업부의 매출 추이와 수익성 변화를 추적합니다. 둘째, 신규 사업 또는 시장 환경 변화가 기업에 미칠 수 있는 영향을 시나리오별로 분석합니다. 셋째, 현재 밸류에이션 수준과 과거 실적 대비 위치를 점검합니다.",
            "The key analysis points in this report are as follows. First, we track revenue trends and profitability changes in the existing business. Second, we analyze the potential impact of new businesses or market changes through multiple scenarios. Third, we review current valuation levels relative to historical performance."
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
                  187
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  215
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#EA580C]">
                  268
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#78716C]">
                  {t("영업이익 (억원)", "Operating Profit (100M KRW)")}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  12
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  18
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#EA580C]">
                  32
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#78716C]">
                  {t("순이익 (억원)", "Net Profit (100M KRW)")}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  8
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#1A1A1A]">
                  14
                </td>
                <td className="px-4 py-3 text-right font-mono text-[#EA580C]">
                  25
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
            "주요 리스크 요인으로는 소형주 특성상 유동성 부족, 소수 고객사 의존도, 그리고 거시경제 불확실성에 따른 수주 변동성이 있습니다. 커버리지 부재로 인해 기업 정보 접근이 제한적이라는 점도 투자자 입장에서 고려해야 할 사항입니다.",
            "Key risk factors include liquidity constraints typical of small-cap stocks, dependency on a limited number of customers, and order volatility due to macroeconomic uncertainty. The lack of coverage also means limited access to corporate information, which investors should consider."
          )}
        </p>

        <h2 className="mt-8 text-xl font-bold text-[#1A1A1A]">
          {t("5. 시나리오별 전망", "5. Scenario Outlook")}
        </h2>
        <p className="leading-relaxed text-[#78716C]">
          {t(
            "본 리포트는 특정 투자 의견이나 목표 주가를 제시하지 않습니다. 대신, 긍정·기본·부정 시나리오를 통해 기업의 가능한 성장 경로를 제시하며, 각 시나리오의 실현 가능성은 독자께서 직접 판단하시기 바랍니다. 핵심 변수의 변화에 따라 어떤 시나리오가 현실화될지 지속적으로 모니터링할 예정입니다.",
            "This report does not provide specific investment opinions or target prices. Instead, it presents possible growth paths through bull, base, and bear scenarios. Readers are encouraged to assess the probability of each scenario independently. We will continue to monitor how key variables evolve."
          )}
        </p>
      </article>

      {/* Action buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
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
          {t("면책 고지 및 유의사항", "Disclaimer & Notice")}
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#6B7280]">
          <p>
            {t(
              "본 리포트는 특정 금융투자상품에 대한 매수·매도 의견이나 목표 주가를 제시하지 않으며, 투자 권유를 목적으로 하지 않습니다. 본 플랫폼은 유사투자자문업에 해당하지 않습니다.",
              "This report does not provide buy/sell recommendations or target prices for specific financial products, and does not constitute investment solicitation. This platform is not a registered investment advisory service."
            )}
          </p>
          <p>
            {t(
              "리포트에 포함된 시나리오 분석은 다양한 가능성을 검토하기 위한 참고 자료이며, 특정 시나리오의 실현을 보장하지 않습니다. 투자 판단의 최종 책임은 투자자 본인에게 있습니다.",
              "Scenario analyses included in reports are reference materials for examining various possibilities and do not guarantee the realization of any specific scenario. The final responsibility for investment decisions lies with the investor."
            )}
          </p>
          <p>
            {t(
              "작성자는 본 리포트에 언급된 종목에 대해 작성 시점 기준 이해관계가 없음을 고지합니다.",
              "The author discloses no conflicts of interest regarding the stocks mentioned in this report as of the time of writing."
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
