"use client";

import { useState } from "react";
import { Send, Mail, MessageCircle, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

interface FAQ {
  questionKo: string;
  questionEn: string;
  answerKo: string;
  answerEn: string;
}

const faqs: FAQ[] = [
  {
    questionKo: "Flint 리포트는 무료인가요?",
    questionEn: "Are Flint reports free?",
    answerKo: "네, Flint의 모든 독립 기업분석 리포트는 무료로 제공됩니다. 회원가입 후 바로 이용하실 수 있습니다.",
    answerEn: "Yes, all independent corporate analysis reports on Flint are provided for free. You can access them immediately after signing up.",
  },
  {
    questionKo: "독립 애널리스트로 참여하려면 어떻게 해야 하나요?",
    questionEn: "How can I participate as an independent analyst?",
    answerKo: "hello@flint.kr로 이력서와 샘플 리포트를 보내주시면 검토 후 연락드리겠습니다. 금융투자분석사 자격증 보유자 또는 증권사 리서치 경력자를 우대합니다.",
    answerEn: "Please send your resume and sample report to hello@flint.kr. We will review and contact you. Preference is given to holders of financial analysis certifications or those with brokerage research experience.",
  },
  {
    questionKo: "리포트의 투자의견은 얼마나 신뢰할 수 있나요?",
    questionEn: "How reliable are the investment opinions in reports?",
    answerKo: "모든 리포트는 검증된 독립 애널리스트가 작성하며, 내부 품질 검토를 거칩니다. 다만, 투자 판단의 최종 책임은 투자자 본인에게 있습니다.",
    answerEn: "All reports are written by verified independent analysts and undergo internal quality review. However, the final responsibility for investment decisions lies with the investor.",
  },
  {
    questionKo: "리포트에 오류가 있으면 어떻게 제보하나요?",
    questionEn: "How do I report errors in a report?",
    answerKo: "리포트 하단의 문의하기 또는 hello@flint.kr로 해당 리포트와 오류 내용을 알려주시면, 확인 후 수정하겠습니다.",
    answerEn: "Please let us know about the report and error via the contact form below or at hello@flint.kr, and we will verify and correct it.",
  },
  {
    questionKo: "회원 탈퇴는 어떻게 하나요?",
    questionEn: "How do I delete my account?",
    answerKo: "마이페이지 > 계정 설정에서 회원 탈퇴를 진행하실 수 있습니다. 탈퇴 시 모든 개인 정보와 활동 기록이 삭제됩니다.",
    answerEn: "You can delete your account from My Page > Account Settings. Upon deletion, all personal information and activity records will be removed.",
  },
];

export default function SupportPage() {
  const { t } = useLang();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (name && email && message) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          {t("고객센터", "Support")}
        </h1>
        <p className="mt-2 text-[#6B7280]">
          {t("궁금한 점이 있으시면 언제든 문의해주세요", "Feel free to reach out anytime with questions")}
        </p>
      </div>

      {/* Contact info */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EA580C]/10">
            <Mail className="h-5 w-5 text-[#EA580C]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A1A]">
              {t("이메일 문의", "Email")}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">hello@flint.kr</p>
            <p className="mt-0.5 text-xs text-[#78716C]">
              {t("영업일 기준 1~2일 내 답변", "Response within 1-2 business days")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10">
            <MessageCircle className="h-5 w-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A1A1A]">
              {t("카카오톡 상담", "KakaoTalk")}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">@flint_kr</p>
            <p className="mt-0.5 text-xs text-[#78716C]">
              {t("평일 10:00 - 18:00", "Weekdays 10:00 - 18:00 KST")}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-10">
        <div className="mb-6 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#EA580C]" />
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            {t("자주 묻는 질문", "Frequently Asked Questions")}
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaqIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#FAFAF9]"
                >
                  <span className="pr-4 font-medium text-[#1A1A1A]">
                    {t(faq.questionKo, faq.questionEn)}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#6B7280]" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-[#E5E7EB] px-6 py-4">
                    <p className="text-sm leading-relaxed text-[#78716C]">
                      {t(faq.answerKo, faq.answerEn)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact form */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-[#1A1A1A]">
          {t("문의하기", "Contact Us")}
        </h2>
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF9] p-6">
          {submitted && (
            <div className="mb-4 rounded-xl bg-[#10B981]/10 px-4 py-3 text-sm text-[#10B981]">
              {t(
                "문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.",
                "Your inquiry has been submitted. We will respond as soon as possible."
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                {t("이름", "Name")} *
              </label>
              <Input
                placeholder={t("이름을 입력하세요", "Enter your name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                {t("이메일", "Email")} *
              </label>
              <Input
                type="email"
                placeholder={t("이메일을 입력하세요", "Enter your email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">
                {t("문의 내용", "Message")} *
              </label>
              <textarea
                placeholder={t("문의 내용을 입력하세요", "Enter your message")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-32 w-full rounded-xl border border-[#E5E7EB] p-4 text-sm leading-relaxed focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!name || !email || !message}
              className="h-12 w-full rounded-xl bg-[#1C1917] hover:bg-[#292524]"
            >
              <Send className="mr-2 h-4 w-4" />
              {t("문의하기", "Submit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
