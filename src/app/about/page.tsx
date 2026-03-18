"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Shield, Eye, Users, BarChart3, Globe, Lightbulb, TrendingUp } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const values = [
  {
    icon: Target,
    titleKo: "독립성",
    titleEn: "Independence",
    descKo: "증권사의 이해관계에서 벗어난 독립적이고 객관적인 기업 분석을 제공합니다.",
    descEn: "We provide independent and objective corporate analysis, free from brokerage conflicts of interest.",
  },
  {
    icon: Shield,
    titleKo: "투명성",
    titleEn: "Transparency",
    descKo: "모든 분석 과정과 이해관계를 투명하게 공개하며, 투자자의 신뢰를 최우선으로 합니다.",
    descEn: "We transparently disclose all analytical processes and interests, prioritizing investor trust.",
  },
  {
    icon: Eye,
    titleKo: "접근성",
    titleEn: "Accessibility",
    descKo: "누구나 양질의 기업 분석 정보에 접근할 수 있어야 한다고 믿습니다.",
    descEn: "We believe everyone should have access to quality corporate analysis.",
  },
  {
    icon: Lightbulb,
    titleKo: "전문성",
    titleEn: "Expertise",
    descKo: "각 섹터 전문 애널리스트가 심층적이고 차별화된 분석을 제공합니다.",
    descEn: "Sector-specialized analysts deliver deep, differentiated analysis.",
  },
];

const services = [
  {
    icon: BarChart3,
    titleKo: "독립 리서치",
    titleEn: "Independent Research",
    descKo: "증권사 커버리지 밖 2,292개 기업에 대한 심층 기업분석 리포트를 발간합니다.",
    descEn: "We publish in-depth analysis reports on 2,292 companies outside brokerage coverage.",
    bgColor: "from-[#EA580C]/10 to-[#EA580C]/5",
  },
  {
    icon: Users,
    titleKo: "애널리스트 네트워크",
    titleEn: "Analyst Network",
    descKo: "검증된 독립 애널리스트들이 각자의 전문 분야에서 양질의 리포트를 작성합니다.",
    descEn: "Verified independent analysts produce quality reports in their areas of expertise.",
    bgColor: "from-[#3B82F6]/10 to-[#3B82F6]/5",
  },
  {
    icon: Globe,
    titleKo: "정보 민주화",
    titleEn: "Information Democracy",
    descKo: "기관 투자자만 접근 가능했던 정보를 모든 투자자에게 무료로 제공합니다.",
    descEn: "We provide free access to information that was previously available only to institutional investors.",
    bgColor: "from-[#10B981]/10 to-[#10B981]/5",
  },
  {
    icon: TrendingUp,
    titleKo: "시장 효율성 제고",
    titleEn: "Market Efficiency",
    descKo: "정보 비대칭을 해소하여 더 효율적인 자본시장을 만들어갑니다.",
    descEn: "We eliminate information asymmetry to create a more efficient capital market.",
    bgColor: "from-[#8B5CF6]/10 to-[#8B5CF6]/5",
  },
];

const stats = [
  { valueKo: "2,292개", valueEn: "2,292", labelKo: "분석 대상 기업", labelEn: "Target Companies" },
  { valueKo: "85.7%", valueEn: "85.7%", labelKo: "정보 사각지대", labelEn: "Information Blind Spot" },
  { valueKo: "24명", valueEn: "24", labelKo: "독립 애널리스트", labelEn: "Independent Analysts" },
  { valueKo: "150+", valueEn: "150+", labelKo: "발간 리포트", labelEn: "Published Reports" },
];

export default function AboutPage() {
  const { t } = useLang();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const missionRef = useRef(null);
  const missionInView = useInView(missionRef, { once: true, margin: "-100px" });
  const valuesRef = useRef(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" });
  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <div>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm font-medium tracking-widest uppercase text-[#78716C]"
          >
            About Flint
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[56px]"
          >
            {t("작은 불꽃이", "A small spark")}
            <br />
            {t("시장을 밝힙니다", "illuminates the market")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#A8A29E] sm:text-lg"
          >
            {t(
              "Flint는 증권사 커버리지 바깥의 중소형 상장기업에 대한 독립 기업분석 리포트를 제공하는 플랫폼입니다.",
              "Flint is a platform providing independent corporate analysis reports on small-to-mid cap listed companies outside brokerage coverage."
            )}
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Mission */}
      <section ref={missionRef} className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="rounded-3xl bg-[#FAFAF9] p-8 sm:p-12"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-[#EA580C]">
              {t("우리의 미션", "Our Mission")}
            </p>
            <h2 className="mt-4 text-2xl font-bold leading-snug text-[#1A1A1A] sm:text-3xl">
              {t(
                "모든 투자자는 정보를 받을 자격이 있습니다",
                "Every investor deserves access to information"
              )}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#78716C] sm:text-lg">
              {t(
                "한국 상장사 2,674개 중 증권사 리서치 커버리지를 받는 기업은 14.3%에 불과합니다. 나머지 85.7%, 2,292개의 기업은 어떤 전문 분석도 받지 못한 채 정보의 사각지대에 놓여 있습니다. Flint는 이 문제를 해결하기 위해 탄생했습니다. 우리는 독립 애널리스트 네트워크를 통해 소외된 기업에 빛을 비추고, 모든 투자자가 공정한 정보를 바탕으로 의사결정할 수 있는 시장을 만들어갑니다.",
                "Out of 2,674 listed companies in Korea, only 14.3% receive research coverage from securities firms. The remaining 85.7% — 2,292 companies — are left in an information blind spot without any professional analysis. Flint was created to solve this problem. Through our independent analyst network, we shine a light on overlooked companies and build a market where every investor can make informed decisions."
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="bg-gradient-to-br from-[#1C1917] to-[#292524] py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKo}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-white sm:text-4xl">
                  {t(stat.valueKo, stat.valueEn)}
                </p>
                <p className="mt-2 text-sm text-[#A8A29E]">
                  {t(stat.labelKo, stat.labelEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section ref={valuesRef} className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              {t("핵심 가치", "Core Values")}
            </h2>
            <p className="mt-3 text-[#6B7280]">
              {t("Flint를 이끄는 네 가지 원칙", "Four principles that guide Flint")}
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.titleKo}
                initial={{ opacity: 0, y: 30 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                className="rounded-2xl border border-[#E5E7EB] p-8 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EA580C]/10">
                  <v.icon className="h-6 w-6 text-[#EA580C]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#1A1A1A]">
                  {t(v.titleKo, v.titleEn)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#78716C]">
                  {t(v.descKo, v.descEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section ref={servicesRef} className="bg-[#FAFAF9] py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              {t("Flint가 바꾸는 금융", "Finance Flint Will Change")}
            </h2>
            <p className="mt-3 text-[#6B7280]">
              {t(
                "정보의 사각지대를 밝히는 네 가지 방법",
                "Four ways we illuminate information blind spots"
              )}
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {services.map((s, i) => (
              <motion.div
                key={s.titleKo}
                initial={{ opacity: 0, y: 30 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.bgColor} p-8 transition-all hover:-translate-y-0.5 hover:shadow-lg`}
              >
                <s.icon className="h-8 w-8 text-[#1A1A1A]" />
                <h3 className="mt-4 text-xl font-bold text-[#1A1A1A]">
                  {t(s.titleKo, s.titleEn)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#78716C]">
                  {t(s.descKo, s.descEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
            {t("함께하는 사람들", "Our Team")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#78716C] sm:text-lg">
            {t(
              "Flint는 금융, 기술, 데이터 분야의 전문가들이 모여 만든 팀입니다. 우리는 한국 자본시장의 정보 비대칭 문제를 해결하겠다는 공동의 목표로 뭉쳤습니다.",
              "Flint is a team of experts in finance, technology, and data. We are united by a shared goal of solving the information asymmetry problem in the Korean capital market."
            )}
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                nameKo: "김서연",
                nameEn: "Seoyeon Kim",
                roleKo: "리서치 총괄",
                roleEn: "Head of Research",
              },
              {
                nameKo: "박준혁",
                nameEn: "Junhyuk Park",
                roleKo: "프로덕트 리드",
                roleEn: "Product Lead",
              },
              {
                nameKo: "이하은",
                nameEn: "Haeun Lee",
                roleKo: "데이터 엔지니어",
                roleEn: "Data Engineer",
              },
            ].map((member) => (
              <div
                key={member.nameKo}
                className="rounded-2xl border border-[#E5E7EB] p-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1C1917] text-xl font-bold text-white">
                  {t(member.nameKo[0], member.nameEn[0])}
                </div>
                <p className="mt-4 font-semibold text-[#1A1A1A]">
                  {t(member.nameKo, member.nameEn)}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {t(member.roleKo, member.roleEn)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
