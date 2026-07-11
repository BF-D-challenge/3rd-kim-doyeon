import type { Metadata } from "next";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
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
    <html lang="ko" className={cn(geistSans.variable, geistMono.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
