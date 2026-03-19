"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  Plus,
  X,
  GripVertical,
  FileUp,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockStocks } from "@/data/mock";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Stock, ReportType, Opinion } from "@/types";

const REPORTS_KEY = "flint-custom-reports";

export default function WritePage() {
  const { t } = useLang();
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const reportTypes: { label: string; value: ReportType }[] = [
    { label: t("기업분석", "Company Analysis"), value: "COMPANY" },
    { label: t("산업분석", "Industry Analysis"), value: "INDUSTRY" },
    { label: t("실적 업데이트", "Earnings Update"), value: "EARNINGS" },
    { label: t("IPO 분석", "IPO Analysis"), value: "IPO" },
  ];

  const scenarioOptions: { label: string; value: Opinion; color: string }[] = [
    { label: t("긍정 시나리오", "Bull Case"), value: "BULL", color: "bg-[#EA580C] text-white" },
    { label: t("기본 시나리오", "Base Case"), value: "BASE", color: "bg-[#6B7280] text-white" },
    { label: t("부정 시나리오", "Bear Case"), value: "BEAR", color: "bg-[#C94040] text-white" },
    { label: t("시나리오 미제시", "No Scenario"), value: "NONE", color: "bg-[#9CA3AF] text-white" },
  ];

  const [step, setStep] = useState(1);
  const [stockSearch, setStockSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReportType>("COMPANY");
  const [focusScenario, setFocusScenario] = useState<Opinion>("BASE");
  const [bullDesc, setBullDesc] = useState("");
  const [baseDesc, setBaseDesc] = useState("");
  const [bearDesc, setBearDesc] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const filteredStocks = stockSearch
    ? mockStocks.filter(
        (s) =>
          s.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
          s.code.includes(stockSearch)
      )
    : [];

  const addKeyPoint = () => {
    if (keyPoints.length < 5) setKeyPoints([...keyPoints, ""]);
  };

  const removeKeyPoint = (idx: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== idx));
  };

  const updateKeyPoint = (idx: number, value: string) => {
    const updated = [...keyPoints];
    updated[idx] = value;
    setKeyPoints(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handlePublish = () => {
    if (!user || !isAdmin || !selectedStock || !title || !content) return;
    setPublishing(true);

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) + "-" + Date.now().toString(36);

    const scenarios = [];
    if (bullDesc.trim()) scenarios.push({ type: "BULL" as const, label: "긍정 시나리오", description: bullDesc.trim() });
    if (baseDesc.trim()) scenarios.push({ type: "BASE" as const, label: "기본 시나리오", description: baseDesc.trim() });
    if (bearDesc.trim()) scenarios.push({ type: "BEAR" as const, label: "부정 시나리오", description: bearDesc.trim() });

    const newReport = {
      id: `custom-${crypto.randomUUID()}`,
      title,
      slug,
      type,
      status: "PUBLISHED",
      opinion: focusScenario,
      scenarios,
      keyPoints: keyPoints.filter((p) => p.trim()),
      tags,
      viewCount: 0,
      likeCount: 0,
      readTime: Math.max(5, Math.ceil(content.length / 500)),
      authorId: user.id,
      author: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        coverSectors: user.coverSectors,
        createdAt: user.createdAt,
      },
      stockId: selectedStock.id,
      stock: selectedStock,
      content,
      publishedAt: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
      existing.unshift(newReport);
      localStorage.setItem(REPORTS_KEY, JSON.stringify(existing));
    } catch {
      localStorage.setItem(REPORTS_KEY, JSON.stringify([newReport]));
    }

    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EA580C] border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <ShieldAlert className="h-8 w-8 text-[#C94040]" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[#1A1A1A]">
          {t("접근 권한이 없습니다", "Access Denied")}
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {t(
            "리포트 작성은 관리자만 가능합니다.",
            "Only administrators can write reports."
          )}
        </p>
        <Button
          onClick={() => router.push("/reports")}
          variant="outline"
          className="mt-6 rounded-xl"
        >
          {t("리포트 목록으로", "Go to Reports")}
        </Button>
      </div>
    );
  }

  if (published) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle2 className="h-8 w-8 text-[#10B981]" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[#1A1A1A]">
          {t("리포트가 발행되었습니다!", "Report Published!")}
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {t("리포트 목록에서 확인하실 수 있습니다.", "You can find it in the reports list.")}
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => router.push("/reports")}
            className="rounded-xl bg-[#1C1917] text-white hover:bg-[#292524]"
          >
            {t("리포트 목록", "View Reports")}
          </Button>
          <Button
            onClick={() => {
              setPublished(false);
              setStep(1);
              setSelectedStock(null);
              setTitle("");
              setContent("");
              setKeyPoints([""]);
              setTags([]);
              setBullDesc("");
              setBaseDesc("");
              setBearDesc("");
              setStockSearch("");
            }}
            variant="outline"
            className="rounded-xl"
          >
            {t("새 리포트 작성", "Write Another")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-2 flex items-center gap-2">
        <Badge className="rounded-full bg-[#EA580C] text-xs text-white">
          ADMIN
        </Badge>
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          {t("리포트 작성", "Write Report")}
        </h1>
      </div>
      <p className="mt-2 text-[#6B7280]">
        {t("독립 기업분석 리포트를 작성하고 발간하세요", "Write and publish independent corporate analysis reports")}
      </p>

      {/* Step indicator */}
      <div className="mt-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step >= s
                  ? "bg-[#1C1917] text-white"
                  : "bg-[#E5E7EB] text-[#6B7280]"
              }`}
            >
              {s}
            </button>
            {s < 3 && (
              <ChevronRight className="h-4 w-4 text-[#E5E7EB]" />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm text-[#6B7280]">
          {step === 1 && t("종목 선택", "Select Stock")}
          {step === 2 && t("시나리오 설정", "Set Scenarios")}
          {step === 3 && t("본문 작성", "Write Content")}
        </span>
      </div>

      {/* Step 1: Stock selection */}
      {step === 1 && (
        <div className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              placeholder={t("종목명 또는 종목코드 검색", "Search by stock name or code")}
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="h-12 rounded-xl pl-12"
            />
          </div>

          {filteredStocks.length > 0 && (
            <div className="mt-2 rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
              {filteredStocks.map((stock) => (
                <button
                  key={stock.id}
                  onClick={() => {
                    setSelectedStock(stock);
                    setStockSearch(stock.name);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#FAFAF9]"
                >
                  <div>
                    <span className="font-medium text-[#1A1A1A]">
                      {stock.name}
                    </span>
                    <span className="ml-2 text-sm text-[#6B7280]">
                      {stock.code}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-[#78716C]/10 text-xs"
                  >
                    {stock.market}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {selectedStock && (
            <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-5">
              <p className="text-sm text-[#6B7280]">{t("선택된 종목", "Selected Stock")}</p>
              <p className="mt-1 text-lg font-bold text-[#1C1917]">
                {selectedStock.name}{" "}
                <span className="text-sm font-normal text-[#6B7280]">
                  {selectedStock.code}
                </span>
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary" className="rounded-full text-xs">
                  {selectedStock.market}
                </Badge>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {selectedStock.sector}
                </Badge>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedStock}
              className="h-12 rounded-xl bg-[#1C1917] px-8 hover:bg-[#292524]"
            >
              {t("다음", "Next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Scenarios & Metadata */}
      {step === 2 && (
        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("리포트 제목", "Report Title")} *
            </label>
            <Input
              placeholder={t("리포트 제목을 입력하세요", "Enter report title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("리포트 유형", "Report Type")}
            </label>
            <div className="flex flex-wrap gap-2">
              {reportTypes.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setType(rt.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    type === rt.value
                      ? "bg-[#1C1917] text-white"
                      : "bg-[#FAFAF9] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("주요 시나리오 (가장 가능성 높은 시나리오)", "Focus Scenario (most likely)")}
            </label>
            <div className="flex flex-wrap gap-2">
              {scenarioOptions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFocusScenario(o.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    focusScenario === o.value
                      ? o.color
                      : "bg-[#FAFAF9] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario descriptions */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#1A1A1A]">
              {t("시나리오 설명", "Scenario Descriptions")}
            </label>
            <div>
              <p className="mb-1 text-xs font-medium text-[#EA580C]">
                {t("긍정 시나리오 (Bull Case)", "Bull Case")}
              </p>
              <Input
                placeholder={t("긍정 시나리오 설명", "Describe the bull case scenario")}
                value={bullDesc}
                onChange={(e) => setBullDesc(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#6B7280]">
                {t("기본 시나리오 (Base Case)", "Base Case")}
              </p>
              <Input
                placeholder={t("기본 시나리오 설명", "Describe the base case scenario")}
                value={baseDesc}
                onChange={(e) => setBaseDesc(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-[#C94040]">
                {t("부정 시나리오 (Bear Case)", "Bear Case")}
              </p>
              <Input
                placeholder={t("부정 시나리오 설명", "Describe the bear case scenario")}
                value={bearDesc}
                onChange={(e) => setBearDesc(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("핵심 포인트 (3~5개)", "Key Points (3-5)")}
            </label>
            <div className="space-y-2">
              {keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 cursor-grab text-[#6B7280]" />
                  <Input
                    placeholder={`${t("핵심 포인트", "Key Point")} ${idx + 1}`}
                    value={point}
                    onChange={(e) => updateKeyPoint(idx, e.target.value)}
                    className="h-10 rounded-xl"
                  />
                  {keyPoints.length > 1 && (
                    <button
                      onClick={() => removeKeyPoint(idx)}
                      className="text-[#6B7280] hover:text-[#C94040]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {keyPoints.length < 5 && (
              <button
                onClick={addKeyPoint}
                className="mt-2 flex items-center gap-1 text-sm text-[#78716C] hover:text-[#1C1917]"
              >
                <Plus className="h-4 w-4" /> {t("포인트 추가", "Add Point")}
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("태그 (최대 5개)", "Tags (max 5)")}
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("태그 입력 후 Enter", "Enter tag and press Enter")}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="h-10 rounded-xl"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addTag}
                className="rounded-xl"
              >
                {t("추가", "Add")}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 rounded-full bg-[#1C1917]/5"
                  >
                    {tag}
                    <button
                      onClick={() => setTags(tags.filter((tg) => tg !== tag))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="h-12 rounded-xl"
            >
              {t("이전", "Back")}
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!title}
              className="h-12 rounded-xl bg-[#1C1917] px-8 hover:bg-[#292524]"
            >
              {t("다음", "Next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Content */}
      {step === 3 && (
        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("본문 작성", "Write Content")}
            </label>
            <textarea
              placeholder={t("리포트 본문을 작성하세요...", "Write your report content...")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-96 w-full rounded-xl border border-[#E5E7EB] p-4 text-sm leading-relaxed focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("또는 PDF 업로드", "Or Upload PDF")}
            </label>
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] p-8 transition-colors hover:border-[#78716C]">
              <div className="text-center">
                <FileUp className="mx-auto h-10 w-10 text-[#6B7280]" />
                <p className="mt-2 text-sm text-[#6B7280]">
                  {t("PDF 파일을 드래그하거나 클릭하여 업로드", "Drag or click to upload PDF file")}
                </p>
                <p className="mt-1 text-xs text-[#6B7280]">{t("최대 50MB", "Max 50MB")}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="h-12 rounded-xl"
            >
              {t("이전", "Back")}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl"
              >
                {t("임시저장", "Save Draft")}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!content.trim() || publishing}
                className="h-12 rounded-xl bg-[#EA580C] px-8 hover:bg-[#C2410C] disabled:opacity-50"
              >
                {publishing ? t("발행 중...", "Publishing...") : t("발행하기", "Publish")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
