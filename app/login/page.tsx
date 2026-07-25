"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });
    setSending(false);
    if (error) {
      setError("메일 발송에 실패했어요: " + error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 홈으로
      </Link>

      {sent ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Check className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">메일함을 확인해요</h1>
          <p className="leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span> 로
            <br />
            로그인 링크를 보냈어요. 링크를 누르면 바로 로그인돼요.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 text-sm text-muted-foreground underline underline-offset-2"
          >
            다른 메일로 다시 보내기
          </button>
        </div>
      ) : (
        <form onSubmit={sendLink}>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">호스트 로그인</h1>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            내가 만든 초대장을 모아보고 관리하려면 로그인해요.
            <br />
            비밀번호 없이 메일 링크로 끝. (게스트는 로그인 필요 없어요)
          </p>
          <Input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="mb-3 h-12"
          />
          {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            size="lg"
            disabled={!email.trim() || sending}
            className="h-12 w-full gap-1.5"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            로그인 링크 받기
          </Button>
        </form>
      )}
    </main>
  );
}
