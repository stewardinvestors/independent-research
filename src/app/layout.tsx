import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/intro/AppShell";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flint | 작은 불꽃이 시장을 밝힙니다",
  description:
    "상장사의 85%는 아무도 분석하지 않습니다. Flint는 증권사 커버리지 바깥의 중소형 상장기업에 대한 독립 기업분석 리포트를 제공합니다.",
  keywords: ["Flint", "기업분석", "중소형주", "리포트", "투자"],
  openGraph: {
    title: "Flint | 작은 불꽃이 시장을 밝힙니다",
    description:
      "상장사의 85%는 아무도 분석하지 않습니다. Flint 독립 기업분석 리포트 플랫폼.",
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
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
