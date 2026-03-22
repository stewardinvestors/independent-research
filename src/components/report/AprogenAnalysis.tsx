"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart } from "recharts";

const C = {
  orange: "#E8713A", darkOrange: "#C45A2B", charcoal: "#1A1A2E", dark: "#16213E",
  navy: "#0F3460", accent: "#E94560", bg: "#FAFAF8", card: "#FFFFFF",
  text: "#2D2D2D", sub: "#6B7280", light: "#F3F4F6", green: "#10B981",
  red: "#EF4444", blue: "#3B82F6", purple: "#8B5CF6", amber: "#F59E0B",
};

const revenueData = [
  { year: "2021", 매출: 564.8, 영업이익: -38, 원가율: null },
  { year: "2022", 매출: 651.9, 영업이익: -54.3, 원가율: 58.1 },
  { year: "2023", 매출: 873.6, 영업이익: -574.8, 원가율: 113.4 },
  { year: "2024", 매출: 673.8, 영업이익: -528.2, 원가율: 111.2 },
  { year: "25E", 매출: 732.3, 영업이익: -603.8, 원가율: null },
];

const mixData = [
  { name: "제약(합성)", value: 85.4, fill: C.orange },
  { name: "바이오", value: 14.0, fill: C.charcoal },
  { name: "기타", value: 0.6, fill: "#D1D5DB" },
];

const netDebtData = [
  { year: "2021", value: -3037, color: C.green },
  { year: "2022", value: 502, color: C.orange },
  { year: "2023", value: 1446, color: C.red },
  { year: "2024", value: 1186, color: C.red },
];

const capaData = [
  { name: "삼성바이오", value: 62, fill: "#94A3B8" },
  { name: "셀트리온", value: 25, fill: "#94A3B8" },
  { name: "에이프로젠(환산)", value: 27, fill: C.darkOrange },
  { name: "에이프로젠(실제)", value: 0.8, fill: C.orange },
];

const quarterlyOPM = [
  { q: "23.1Q", opm: -69 }, { q: "23.2Q", opm: -47.6 }, { q: "23.3Q", opm: -71.3 }, { q: "23.4Q", opm: -80.2 },
  { q: "24.1Q", opm: -73.7 }, { q: "24.2Q", opm: -80.8 }, { q: "24.3Q", opm: -89.7 }, { q: "24.4Q", opm: -72.4 },
];

const pbrComp = [
  { name: "에이프로젠", pbr: 0.22, fill: C.orange },
  { name: "이연제약", pbr: 0.81, fill: "#94A3B8" },
  { name: "동구바이오", pbr: 1.36, fill: "#94A3B8" },
  { name: "바이넥스", pbr: 2.11, fill: "#94A3B8" },
];

const bioRevData = [
  { year: "2022", 매출: 2.7, 영업이익: -20 },
  { year: "2023", 매출: 168.7, 영업이익: -549.5 },
  { year: "2024", 매출: 94.5, 영업이익: -450 },
];

const pipelines = [
  { code: "GS071", target: "레미케이드", indication: "자가면역질환", stage: "허가 완료", progress: 95, suite: "Suite 1", annual: "500kg", color: C.charcoal, status: "일본 허가. 미국·유럽 상업허가 미확인. 상업화 확대 시점 불분명." },
  { code: "AP063", target: "허셉틴", indication: "유방암", stage: "1상 완료 → 3상 생략 전략", progress: 65, suite: "Suite 2", annual: "720kg", color: C.orange, status: "가장 중요한 단일 이벤트. 3상 없이 1상 데이터만으로 허가 전략 추진 중. EMA/FDA 간소화 흐름과 맞닿아 있지만, 가이드라인 자체가 아직 초안(draft) 단계." },
  { code: "AP056", target: "리톡산", indication: "혈액암/자가면역", stage: "전임상 완료", progress: 25, suite: "Suite 3", annual: "-", color: "#94A3B8", status: "1상·3상 준비 중. 임상 시작 전이라 단기 의미 제한적." },
  { code: "AP096", target: "휴미라", indication: "자가면역질환", stage: "시료생산 완료, 1상 준비", progress: 40, suite: "Suite 4", annual: "1,240kg", color: C.blue, status: "AP063의 1.7배 볼륨. 오토인젝터 제형. 오송에서 201.5kg 시료 회수 실적. 중장기 가동률 트리거." },
];

const dilutionEvents = [
  { date: "2023.05", event: "유상증자 500억", type: "증자" },
  { date: "2024.01", event: "90% 무상감자", type: "감자" },
  { date: "2024.07", event: "유증 + CB 400억", type: "증자" },
  { date: "2025.03", event: "사모 CB 565억", type: "CB" },
  { date: "2026.02", event: "감자 결정", type: "감자" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(255,255,255,0.96)", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.text }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || p.fill, display: "flex", gap: 8 }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

function Section({ id, children }: any) {
  return <section id={id} style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>{children}</section>;
}

function SectionLabel({ text, color = C.orange }: any) {
  return <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color, marginBottom: 8 }}>{text}</div>;
}

function H2({ children }: any) {
  return <h2 style={{ fontSize: 28, fontWeight: 800, color: C.text, margin: "0 0 16px", lineHeight: 1.3, fontFamily: "'Noto Sans KR', sans-serif" }}>{children}</h2>;
}

function Desc({ children }: any) {
  return <p style={{ fontSize: 16, lineHeight: 1.7, color: C.sub, margin: "0 0 24px" }}>{children}</p>;
}

function MetricCard({ label, value, sub: subText, color = C.orange }: any) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: "20px 24px", border: "1px solid #E5E7EB", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Space Mono', monospace" }}>{value}</div>
      {subText && <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>{subText}</div>}
    </div>
  );
}

function ChartCard({ title, children, note }: any) {
  return (
    <div style={{ background: C.card, borderRadius: 12, border: "1px solid #E5E7EB", padding: "24px", marginBottom: 24 }}>
      {title && <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>{title}</div>}
      {children}
      {note && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 10 }}>{note}</div>}
    </div>
  );
}

function Callout({ children, color = C.orange, bg = "#FFF7ED" }: any) {
  return (
    <div style={{ background: bg, borderLeft: `4px solid ${color}`, borderRadius: "0 8px 8px 0", padding: "16px 20px", margin: "20px 0", fontSize: 15, lineHeight: 1.6, color: C.text }}>
      {children}
    </div>
  );
}

function PipelineCard({ pipe, isOpen, onClick }: any) {
  return (
    <div onClick={onClick} style={{ background: C.card, borderRadius: 12, border: `1px solid ${isOpen ? pipe.color : "#E5E7EB"}`, padding: "20px 24px", marginBottom: 12, cursor: "pointer", transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ background: pipe.color, color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{pipe.code}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{pipe.target} 바이오시밀러</span>
          <span style={{ fontSize: 12, color: C.sub }}>({pipe.indication})</span>
        </div>
        <span style={{ fontSize: 12, color: C.sub }}>{isOpen ? "▲" : "▼"}</span>
      </div>
      <div style={{ background: "#F3F4F6", borderRadius: 20, height: 8, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ background: pipe.color, height: "100%", width: `${pipe.progress}%`, borderRadius: 20, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.sub }}>
        <span>{pipe.stage}</span>
        <span>{pipe.suite} · 연 {pipe.annual}</span>
      </div>
      {isOpen && (
        <div style={{ marginTop: 16, padding: "14px 16px", background: "#F9FAFB", borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: C.text, borderLeft: `3px solid ${pipe.color}` }}>
          {pipe.status}
        </div>
      )}
    </div>
  );
}

export default function AprogenAnalysis() {
  const [openPipe, setOpenPipe] = useState<string | null>("AP063");
  const [activeScenario, setActiveScenario] = useState("base");

  const scenarios = {
    bull: { label: "BULL", color: C.green, title: "파이프라인이 터진다", env: "AP063 허가신청 접수 + 외부 CDMO 첫 수주 + EMA 간소화 경로 확정", result: "가동률 상승 → 원가율 정상화 → 적자 축소 → PBR 0.3~0.5배" },
    base: { label: "BASE", color: C.amber, title: "기다림이 계속된다", env: "AP063 허가 지연(2027~) + 바이오 매출 현 수준 + 추가 자본조달 1~2회", result: "적자 지속 + 감자·유증 반복 + PBR 0.15~0.25배 유지" },
    bear: { label: "BEAR", color: C.red, title: "파이프라인이 무산된다", env: "AP063 허가 실패 + 추가 대규모 감자 + 제약부문 급감", result: "가동률 반등 소멸 → 자본잠식 우려 → PBR 0.1배 이하" },
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.charcoal} 0%, ${C.dark} 50%, ${C.navy} 100%)`, padding: "80px 24px 60px", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, opacity: 0.5, marginBottom: 20 }}>FLINT RESEARCH · 2026.03.22</div>
          <h1 style={{ fontSize: 38, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>에이프로젠바이오로직스</h1>
          <div style={{ fontSize: 15, opacity: 0.5, marginBottom: 30 }}>KOSPI: 003060 · 현재가 336원 · 시총 667억</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: C.orange, marginBottom: 16 }}>초대형 바이오 공장이 있다. 그런데 아직 안 돌아간다.</div>
          <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.7, maxWidth: 700 }}>
            65년 된 제약회사가 오송에 바이오 공장을 지었다. 문제는 그 공장을 채울 제품이 아직 허가를 못 받았다는 것. 허가가 나면 게임이 바뀌고, 안 나면 적자와 주주 희석이 계속된다. 이 회사의 운명은 파이프라인에 달려 있다.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            {[{ l: "오송 캐파", v: "8,000L", c: C.orange }, { l: "PBR", v: "0.22x", c: C.darkOrange }, { l: "매출원가율", v: "111%", c: C.red }, { l: "외부 수주", v: "0건", c: C.accent }].map((m, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 20px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 11, opacity: 0.5 }}>{m.l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.c, fontFamily: "'Space Mono', monospace" }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 이 회사가 뭘 하는 곳인지 */}
      <Section id="overview">
        <SectionLabel text="BUSINESS OVERVIEW" />
        <H2>이 회사는 뭘 하는 곳인가</H2>
        <Desc>이름은 '바이오로직스'지만, 매출의 85%는 항생제·순환기제 같은 전통 제약에서 나온다. 바이오는 아직 14%. 그런데 오송에 초대형 바이오 공장(4suite, 8,000L)을 지어놨다. 아직 제대로 가동이 안 돼서 3년째 적자다.</Desc>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <ChartCard title="매출 구성 (2024)">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={mixData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                  {mixData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: C.sub }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="매출 vs 영업이익 (억원)">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.sub }} />
                <YAxis tick={{ fontSize: 11, fill: C.sub }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="매출" fill={C.orange} radius={[4, 4, 0, 0]} />
                <Bar dataKey="영업이익" fill={C.red} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <Callout>핵심은 간단하다. 큰 공장을 지었는데 아직 돌릴 게 없다. 공장을 돌리려면 바이오 신약이 허가를 받아야 한다.</Callout>
      </Section>

      <div style={{ borderTop: "1px solid #E5E7EB" }} />

      {/* 파이프라인 */}
      <Section id="pipeline">
        <SectionLabel text="PIPELINE" />
        <H2>파이프라인 — 공장의 운명을 결정할 것들</H2>
        <Desc>오송 공장에는 4개의 생산 라인(Suite)이 있고, 각각 다른 바이오시밀러에 배정되어 있다. 이 제품들이 허가를 받아야 공장이 돌아간다. 클릭해서 각 파이프라인의 현재 상태를 확인해보자.</Desc>

        {pipelines.map((pipe) => (
          <PipelineCard
            key={pipe.code}
            pipe={pipe}
            isOpen={openPipe === pipe.code}
            onClick={() => setOpenPipe(openPipe === pipe.code ? null : pipe.code)}
          />
        ))}

        <ChartCard title="제품별 연간 생산 계획 (kg)" note="AP096은 AP063 대비 1.7배 볼륨. 두 제품이 모두 상업화되면 공장 원가율 구조가 역전될 수 있다.">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[{ name: "GS071", kg: 500, fill: "#94A3B8" }, { name: "AP063", kg: 720, fill: C.orange }, { name: "AP096", kg: 1240, fill: C.blue }]} layout="vertical" margin={{ left: 60, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: C.sub }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.text, fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="kg" radius={[0, 6, 6, 0]}>
                {[{ fill: "#94A3B8" }, { fill: C.orange }, { fill: C.blue }].map((c, i) => <Cell key={i} fill={c.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Section>

      <div style={{ borderTop: "1px solid #E5E7EB" }} />

      {/* AP063 딥다이브 */}
      <Section id="ap063">
        <SectionLabel text="KEY EVENT" color={C.orange} />
        <H2>AP063 — 이 기업의 가장 중요한 한 가지</H2>
        <Desc>허셉틴(유방암 치료제) 바이오시밀러. 보통은 임상 3상까지 해야 허가를 받는데, 이 회사는 1상 데이터만으로 허가를 받겠다는 파격적인 전략을 추진 중이다.</Desc>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { l: "현재 단계", v: "1상 완료", s: "3상 생략 허가 전략 추진", c: C.orange },
            { l: "오송 배정", v: "Suite 2", s: "연 720kg / 480만 vial", c: C.charcoal },
            { l: "국내 권리", v: "5년 독점", s: "허가 완료 시 국내 독점판매권", c: C.green },
            { l: "수익배분", v: "vial당 $10", s: "최대 1,200만 vial 기준", c: C.blue },
          ].map((m, i) => <MetricCard key={i} label={m.l} value={m.v} sub={m.s} color={m.c} />)}
        </div>

        <Callout>
          <strong>왜 이게 가장 중요한가?</strong><br />
          AP063의 허가신청(MAA)이 접수되면 → 허가 타임라인이 구체화 → 오송 Suite2 상업 생산 준비 본격화 → 가동률 상승 → 매출원가율 111%가 내려가기 시작한다. 반대로 이게 지연되거나 실패하면 → 공장은 계속 적자를 생산하고 → 감자·유증이 반복된다.
        </Callout>

        <Callout color={C.red} bg="#FEF2F2">
          <strong>다만 아직 '전략'이지 '확정'이 아니다.</strong> EMA의 가이드라인 자체가 초안(draft) 단계이고, 실제 허가신청이 접수되었다는 공시는 아직 없다. 이 접수 공시가 나오는 순간이 진짜 분기점이다.
        </Callout>
      </Section>

      <div style={{ borderTop: "1px solid #E5E7EB" }} />

      {/* 공장 이야기 */}
      <Section id="factory">
        <SectionLabel text="OSEONG FACTORY" />
        <H2>오송 공장 — '27만L'의 진실</H2>
        <Desc>이 회사가 내세우는 가장 큰 자산. 그런데 숫자를 있는 그대로 읽으면 안 된다.</Desc>

        <ChartCard title="국내 바이오 CDMO 생산능력 비교 (만L)" note="에이프로젠의 '27만L'는 퍼퓨전→fed-batch 환산 마케팅 수치. 실제 탱크는 8,000L(=0.8만L). 삼성바이오·셀트리온은 실제 탱크 용량 기준.">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={capaData} layout="vertical" margin={{ left: 100, right: 40 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: C.sub }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {capaData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <MetricCard label="외부 CDMO 수주" value="0건" sub="유일 고객은 모회사" color={C.red} />
          <MetricCard label="가동률" value="미공개" sub="핵심 체크포인트" color={C.amber} />
          <MetricCard label="상업용 cGMP" value="미확인" sub="KGMP·EU QP는 통과" color={C.amber} />
        </div>
      </Section>

      <div style={{ borderTop: "1px solid #E5E7EB" }} />

      {/* 왜 소외되었나 */}
      <Section id="risk">
        <SectionLabel text="WHY NEGLECTED" color={C.red} />
        <H2>왜 시장이 이 회사를 불신하는가</H2>
        <Desc>시총 667억인데 자본총계는 3,787억이다. PBR 0.22배. 왜 이렇게까지 할인을 받을까?</Desc>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <ChartCard title="매출원가율 추이 (%) — 100% 초과 = 팔수록 손해">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData.filter(d => d.원가율)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.sub }} />
                <YAxis tick={{ fontSize: 11, fill: C.sub }} domain={[0, 130]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="원가율" radius={[4, 4, 0, 0]}>
                  {revenueData.filter(d => d.원가율).map((d, i) => <Cell key={i} fill={(d.원가율 ?? 0) > 100 ? C.red : C.orange} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="분기별 영업이익률 (%) — 8분기 연속 적자">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={quarterlyOPM}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="q" tick={{ fontSize: 10, fill: C.sub }} />
                <YAxis tick={{ fontSize: 11, fill: C.sub }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="opm" radius={[4, 4, 0, 0]}>
                  {quarterlyOPM.map((_, i) => <Cell key={i} fill={i < 4 ? C.orange : C.red} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="순차입금 추이 (억원) — 3년 만에 4,200억 포지션 변화" note="2021년 순현금 3,037억 → 2024년 순차입 1,186억. 바이오 전환 비용과 적자가 현금을 소진했다.">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={netDebtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: C.sub }} />
              <YAxis tick={{ fontSize: 11, fill: C.sub }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {netDebtData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 희석 이력 */}
        <div style={{ background: C.card, borderRadius: 12, border: "1px solid #E5E7EB", padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>감자·유증·CB 반복 이력 — 기존 주주 희석 구조</div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "10px 0" }}>
            {dilutionEvents.map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center", minWidth: 120 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: ev.type === "감자" ? C.red : ev.type === "CB" ? C.amber : C.darkOrange, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: "#fff", fontSize: 14, fontWeight: 700 }}>
                    {ev.type === "감자" ? "✂" : ev.type === "CB" ? "CB" : "+"}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{ev.event}</div>
                  <div style={{ fontSize: 10, color: C.sub }}>{ev.date}</div>
                </div>
                {i < dilutionEvents.length - 1 && <div style={{ width: 40, height: 2, background: "#E5E7EB", flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>

        <ChartCard title="PBR vs 동종업계 (배) — 에이프로젠은 극단적 할인">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pbrComp} layout="vertical" margin={{ left: 70, right: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: C.sub }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pbr" radius={[0, 6, 6, 0]}>
                {pbrComp.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Section>

      <div style={{ borderTop: "1px solid #E5E7EB" }} />

      {/* 시나리오 */}
      <Section id="scenario">
        <SectionLabel text="SCENARIOS" />
        <H2>세 가지 시나리오</H2>
        <Desc>결국 이 종목의 운명은 파이프라인에 달려 있다. 파이프라인이 터지느냐, 지연되느냐, 실패하느냐.</Desc>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {Object.entries(scenarios).map(([key, s]) => (
            <button key={key} onClick={() => setActiveScenario(key)}
              style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: `2px solid ${activeScenario === key ? s.color : "#E5E7EB"}`,
                background: activeScenario === key ? `${s.color}10` : C.card, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{s.title}</div>
            </button>
          ))}
        </div>

        {(() => {
          const s = scenarios[activeScenario as keyof typeof scenarios];
          return (
            <div style={{ background: C.card, borderRadius: 12, border: `2px solid ${s.color}`, padding: 28 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 12 }}>{s.label} — {s.title}</div>
              <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.7, marginBottom: 12 }}><strong style={{ color: C.text }}>환경:</strong> {s.env}</div>
              <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.7 }}><strong style={{ color: C.text }}>결과:</strong> {s.result}</div>
            </div>
          );
        })()}
      </Section>

      <div style={{ borderTop: "1px solid #E5E7EB" }} />

      {/* 체크리스트 */}
      <Section id="checklist">
        <SectionLabel text="MONITORING" />
        <H2>이런 뉴스가 나오면</H2>
        <Desc>이 종목을 관심 있게 보고 있다면, 아래 이벤트들을 DART 공시에서 모니터링하면 된다.</Desc>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "#F0FDF4", borderRadius: 12, padding: 24, border: "1px solid #BBF7D0" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.green, marginBottom: 16 }}>긍정 신호</div>
            {["AP063 MAA/BLA 접수 공시", "외부 CDMO 수주 계약 공시", "AP096 글로벌 1상 IND 접수", "분기 바이오 매출 200억+ 달성"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? "1px solid #D1FAE5" : "none" }}>
                <span style={{ color: C.green, fontWeight: 700, fontSize: 16 }}>+</span>
                <span style={{ fontSize: 14, color: C.text }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#FEF2F2", borderRadius: 12, padding: 24, border: "1px solid #FECACA" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 16 }}>부정 신호</div>
            {["감자·유상증자·CB 발행 공시", "AP063 허가 반려 또는 장기 지연", "자본잠식 / 감사의견 한정·거절", "매매거래 정지 공시"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 3 ? "1px solid #FEE2E2" : "none" }}>
                <span style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>–</span>
                <span style={{ fontSize: 14, color: C.text }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div style={{ background: C.charcoal, padding: "40px 24px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
        <div style={{ fontSize: 12, marginBottom: 8 }}>© 2026 Flint Research · flint@handong.ac.kr</div>
        <div style={{ fontSize: 11, maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
          본 자료는 정보 제공 목적이며 투자 권유를 구성하지 않습니다. 투자 판단의 책임은 투자자 본인에게 있습니다. 기준일: 2026.03.22
        </div>
      </div>
    </div>
  );
}
