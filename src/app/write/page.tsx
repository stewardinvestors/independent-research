"use client";

import { useState } from "react";
import {
  Search,
  ChevronRight,
  Plus,
  X,
  GripVertical,
  FileUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockStocks } from "@/data/mock";
import { useLang } from "@/contexts/LanguageContext";
import type { Stock, ReportType, Opinion } from "@/types";

export default function WritePage() {
  const { t } = useLang();

  const reportTypes: { label: string; value: ReportType }[] = [
    { label: t("기업분석", "Company Analysis"), value: "COMPANY" },
    { label: t("산업분석", "Industry Analysis"), value: "INDUSTRY" },
    { label: t("실적 업데이트", "Earnings Update"), value: "EARNINGS" },
    { label: t("IPO 분석", "IPO Analysis"), value: "IPO" },
  ];

  const opinions: { label: string; value: Opinion; color: string }[] = [
    { label: t("매수", "Buy"), value: "BUY", color: "bg-[#EA580C] text-white" },
    { label: t("중립", "Hold"), value: "HOLD", color: "bg-[#F59E0B] text-white" },
    { label: t("매도", "Sell"), value: "SELL", color: "bg-[#C94040] text-white" },
    { label: t("의견 없음", "No Opinion"), value: "NONE", color: "bg-[#6B7280] text-white" },
  ];
  const [step, setStep] = useState(1);
  const [stockSearch, setStockSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReportType>("COMPANY");
  const [opinion, setOpinion] = useState<Opinion>("BUY");
  const [targetPrice, setTargetPrice] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [content, setContent] = useState("");

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
        {t("리포트 작성", "Write Report")}
      </h1>
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
          {step === 2 && t("메타데이터 입력", "Enter Metadata")}
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

      {/* Step 2: Metadata */}
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
              {t("투자의견", "Investment Opinion")}
            </label>
            <div className="flex flex-wrap gap-2">
              {opinions.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOpinion(o.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    opinion === o.value
                      ? o.color
                      : "bg-[#FAFAF9] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              {t("목표가", "Target Price")} ({t("원", "KRW")})
            </label>
            <Input
              type="number"
              placeholder={t("목표가를 입력하세요", "Enter target price")}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="h-12 rounded-xl"
            />
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
            <p className="mt-1 text-xs text-[#6B7280]">
              {t("* 추후 Tiptap 리치 에디터가 적용될 예정입니다", "* Rich text editor (Tiptap) will be available soon")}
            </p>
          </div>

          {/* PDF upload */}
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
              <Button className="h-12 rounded-xl bg-[#EA580C] px-8 hover:bg-[#C2410C]">
                {t("발행하기", "Publish")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
