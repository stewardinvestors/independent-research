import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/intro/AppShell";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "독립리서치 | 증권사가 다루지 않는 기업의 이야기",
  description:
    "상장사의 85%는 아무도 분석하지 않습니다. 독립리서치는 증권사 커버리지 바깥의 중소형 상장기업에 대한 독립 기업분석 리포트를 제공합니다.",
  keywords: ["독립리서치", "기업분석", "중소형주", "리포트", "투자"],
  openGraph: {
    title: "독립리서치 | 증권사가 다루지 않는 기업의 이야기",
    description:
      "상장사의 85%는 아무도 분석하지 않습니다. 독립 기업분석 리포트 플랫폼.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
