"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { mockReports, mockStocks } from "@/data/mock";
import { useLang } from "@/contexts/LanguageContext";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();

  const matchedReports = q
    ? mockReports.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          r.stock?.name.toLowerCase().includes(q)
      )
    : [];

  const matchedStocks = q
    ? mockStocks.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.includes(q) ||
          s.sector.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl mx-4 rounded-2xl bg-white shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4">
          <Search className="h-5 w-5 text-[#6B7280]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("리포트, 종목, 키워드 검색...", "Search reports, stocks, keywords...")}
            className="flex-1 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#A8A29E]"
          />
          <button onClick={onClose} className="rounded-lg p-1 text-[#6B7280] hover:text-[#1C1917]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-3">
          {!q && (
            <p className="px-3 py-6 text-center text-sm text-[#A8A29E]">
              {t("검색어를 입력하세요", "Enter a search term")}
            </p>
          )}

          {q && matchedReports.length === 0 && matchedStocks.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-[#A8A29E]">
              {t("검색 결과가 없습니다", "No results found")}
            </p>
          )}

          {matchedStocks.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 px-3 text-xs font-semibold text-[#6B7280]">
                {t("종목", "Stocks")}
              </p>
              {matchedStocks.map((stock) => (
                <Link
                  key={stock.id}
                  href={`/stocks/${stock.code}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-[#FAFAF9]"
                >
                  <span className="text-sm font-medium text-[#1A1A1A]">{stock.name}</span>
                  <span className="text-xs text-[#6B7280]">
                    {stock.code} · {stock.market}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {matchedReports.length > 0 && (
            <div>
              <p className="mb-1 px-3 text-xs font-semibold text-[#6B7280]">
                {t("리포트", "Reports")}
              </p>
              {matchedReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.slug}`}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-2.5 hover:bg-[#FAFAF9]"
                >
                  <p className="text-sm font-medium text-[#1A1A1A]">{report.title}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {report.stock?.name} · {report.author.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
