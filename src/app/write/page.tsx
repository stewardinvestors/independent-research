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
import type { Stock, ReportType, Opinion } from "@/types";

const reportTypes: { label: string; value: ReportType }[] = [
  { label: "기업분석", value: "COMPANY" },
  { label: "산업분석", value: "INDUSTRY" },
  { label: "실적 업데이트", value: "EARNINGS" },
  { label: "IPO 분석", value: "IPO" },
];

const opinions: { label: string; value: Opinion; color: string }[] = [
  { label: "매수", value: "BUY", color: "bg-[#EA580C] text-white" },
  { label: "중립", value: "HOLD", color: "bg-[#F59E0B] text-white" },
  { label: "매도", value: "SELL", color: "bg-[#C94040] text-white" },
  { label: "의견 없음", value: "NONE", color: "bg-[#6B7280] text-white" },
];

export default function WritePage() {
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
        리포트 작성
      </h1>
      <p className="mt-2 text-[#6B7280]">
        독립 기업분석 리포트를 작성하고 발간하세요
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
          {step === 1 && "종목 선택"}
          {step === 2 && "메타데이터 입력"}
          {step === 3 && "본문 작성"}
        </span>
      </div>

      {/* Step 1: Stock selection */}
      {step === 1 && (
        <div className="mt-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              placeholder="종목명 또는 종목코드 검색"
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
              <p className="text-sm text-[#6B7280]">선택된 종목</p>
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
              다음
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
              리포트 제목 *
            </label>
            <Input
              placeholder="리포트 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              리포트 유형
            </label>
            <div className="flex flex-wrap gap-2">
              {reportTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    type === t.value
                      ? "bg-[#1C1917] text-white"
                      : "bg-[#FAFAF9] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              투자의견
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
              목표가 (원)
            </label>
            <Input
              type="number"
              placeholder="목표가를 입력하세요"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              핵심 포인트 (3~5개)
            </label>
            <div className="space-y-2">
              {keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 cursor-grab text-[#6B7280]" />
                  <Input
                    placeholder={`핵심 포인트 ${idx + 1}`}
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
                <Plus className="h-4 w-4" /> 포인트 추가
              </button>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              태그 (최대 5개)
            </label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="태그 입력 후 Enter"
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
                추가
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
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
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
              이전
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!title}
              className="h-12 rounded-xl bg-[#1C1917] px-8 hover:bg-[#292524]"
            >
              다음
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
              본문 작성
            </label>
            <textarea
              placeholder="리포트 본문을 작성하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-96 w-full rounded-xl border border-[#E5E7EB] p-4 text-sm leading-relaxed focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
            />
            <p className="mt-1 text-xs text-[#6B7280]">
              * 추후 Tiptap 리치 에디터가 적용될 예정입니다
            </p>
          </div>

          {/* PDF upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
              또는 PDF 업로드
            </label>
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] p-8 transition-colors hover:border-[#78716C]">
              <div className="text-center">
                <FileUp className="mx-auto h-10 w-10 text-[#6B7280]" />
                <p className="mt-2 text-sm text-[#6B7280]">
                  PDF 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="mt-1 text-xs text-[#6B7280]">최대 50MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="h-12 rounded-xl"
            >
              이전
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl"
              >
                임시저장
              </Button>
              <Button className="h-12 rounded-xl bg-[#EA580C] px-8 hover:bg-[#C2410C]">
                발행하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
