import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import "./globals.css";

// 한글 본문 기본 폰트 (Geist엔 한글 글리프가 없어 fallback으로 떨어지던 문제 해결)
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-sans",
  weight: "45 920",
  display: "swap",
});
// 라틴/숫자 표기용 (선택적) — display 계층
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-display",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "모디 — 초대가 곧 기대감이 되는 앱",
  description: "밋밋한 단톡방 공지 말고, 테마 입힌 초대장 하나로. 이름만 입력하면 참석 완료.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn(pretendard.variable, geistSans.variable, geistMono.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
