"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Bell, Megaphone, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/contexts/LanguageContext";

interface Notice {
  id: string;
  type: "NOTICE" | "UPDATE" | "IMPORTANT";
  titleKo: string;
  titleEn: string;
  contentKo: string;
  contentEn: string;
  date: string;
}

const notices: Notice[] = [
  {
    id: "1",
    type: "IMPORTANT",
    titleKo: "[중요] Flint 서비스 정식 오픈 안내",
    titleEn: "[Important] Flint Service Official Launch",
    contentKo:
      "안녕하세요, Flint 팀입니다. Flint 독립 기업분석 리포트 플랫폼이 정식 오픈되었습니다. 증권사 커버리지 바깥의 중소형 상장기업에 대한 독립 기업분석 리포트를 무료로 제공합니다. 많은 관심 부탁드립니다.",
    contentEn:
      "Hello, this is the Flint team. The Flint independent corporate analysis report platform is now officially open. We provide free independent analysis reports on small-to-mid cap listed companies outside brokerage coverage. Thank you for your interest.",
    date: "2026-03-15",
  },
  {
    id: "2",
    type: "UPDATE",
    titleKo: "[업데이트] 리포트 검색 기능 개선",
    titleEn: "[Update] Report Search Feature Improvement",
    contentKo:
      "리포트 검색 기능이 개선되었습니다. 이제 종목명, 종목코드, 키워드 등 다양한 기준으로 리포트를 검색할 수 있습니다. 또한 시장별, 리포트 유형별 필터링 기능이 추가되었습니다.",
    contentEn:
      "The report search feature has been improved. You can now search reports by stock name, stock code, keywords, and more. Additionally, filtering by market and report type has been added.",
    date: "2026-03-12",
  },
  {
    id: "3",
    type: "NOTICE",
    titleKo: "[안내] 애널리스트 참여 신청 안내",
    titleEn: "[Notice] Analyst Participation Application Guide",
    contentKo:
      "Flint에서 독립 애널리스트로 활동하고 싶으신 분들을 모집합니다. 금융투자분석사(CFA, CIIA 등) 자격증 보유자 또는 증권사 리서치 경력자를 우대합니다. 자세한 내용은 hello@flint.kr로 문의해주세요.",
    contentEn:
      "We are recruiting independent analysts for Flint. Preference is given to holders of financial analysis certifications (CFA, CIIA, etc.) or those with brokerage research experience. For details, please contact hello@flint.kr.",
    date: "2026-03-10",
  },
  {
    id: "4",
    type: "UPDATE",
    titleKo: "[업데이트] 모바일 반응형 디자인 적용",
    titleEn: "[Update] Mobile Responsive Design Applied",
    contentKo:
      "모바일 환경에서도 편리하게 리포트를 읽을 수 있도록 반응형 디자인이 적용되었습니다. 모바일 브라우저에서도 최적화된 읽기 경험을 제공합니다.",
    contentEn:
      "Responsive design has been applied for convenient report reading on mobile devices. We provide an optimized reading experience on mobile browsers as well.",
    date: "2026-03-08",
  },
  {
    id: "5",
    type: "NOTICE",
    titleKo: "[안내] 투자 유의사항 안내",
    titleEn: "[Notice] Investment Disclaimer",
    contentKo:
      "Flint에 게시된 리포트는 투자 권유가 아니며, 투자 판단의 최종 책임은 투자자 본인에게 있습니다. 리포트 작성자의 의견은 작성 시점의 판단이며, 이후 변경될 수 있습니다. 리포트를 참고하여 투자할 경우 발생하는 손실에 대해 Flint는 책임을 지지 않습니다.",
    contentEn:
      "Reports posted on Flint do not constitute investment advice, and the final responsibility for investment decisions lies with the investor. The opinions of report authors reflect their judgment at the time of writing and may change subsequently. Flint is not responsible for any losses incurred from investments made based on these reports.",
    date: "2026-03-05",
  },
];

const typeConfig = {
  IMPORTANT: {
    icon: AlertCircle,
    labelKo: "중요",
    labelEn: "Important",
    color: "bg-[#C94040]/10 text-[#C94040]",
  },
  UPDATE: {
    icon: Bell,
    labelKo: "업데이트",
    labelEn: "Update",
    color: "bg-[#3B82F6]/10 text-[#3B82F6]",
  },
  NOTICE: {
    icon: Megaphone,
    labelKo: "안내",
    labelEn: "Notice",
    color: "bg-[#78716C]/10 text-[#78716C]",
  },
};

export default function NoticesPage() {
  const { t } = useLang();
  const [openId, setOpenId] = useState<string | null>("1");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          {t("공지사항", "Notices")}
        </h1>
        <p className="mt-2 text-[#6B7280]">
          {t("Flint의 새로운 소식과 업데이트를 확인하세요", "Check the latest news and updates from Flint")}
        </p>
      </div>

      <div className="space-y-3">
        {notices.map((notice) => {
          const config = typeConfig[notice.type];
          const isOpen = openId === notice.id;
          return (
            <div
              key={notice.id}
              className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : notice.id)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-[#FAFAF9]"
              >
                <Badge className={`shrink-0 rounded-full text-xs ${config.color}`}>
                  {t(config.labelKo, config.labelEn)}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#1A1A1A]">
                    {t(notice.titleKo, notice.titleEn)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#6B7280]">{notice.date}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-[#6B7280]" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#6B7280]" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-[#E5E7EB] px-6 py-5">
                  <p className="text-sm leading-relaxed text-[#78716C]">
                    {t(notice.contentKo, notice.contentEn)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
