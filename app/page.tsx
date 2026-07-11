import Link from "next/link";
import { Button } from "@/components/ui/button";
import { themeList } from "@/lib/themes";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6 py-16">
      <div className="text-center">
        <p className="mb-4 text-xs font-medium tracking-[0.2em] text-muted-foreground">
          MODI · 모디
        </p>
        <h1 className="mb-4 text-[2.5rem] font-bold leading-[1.2] tracking-tight">
          초대가 곧<br />기대감이 되는 앱
        </h1>
        <p className="mb-8 leading-relaxed text-muted-foreground">
          밋밋한 단톡방 공지 말고,<br />
          테마 입힌 초대장 하나로.<br />
          <span className="text-foreground/70">받는 순간 &ldquo;오 뭐야 ㅋㅋ&rdquo;</span>
        </p>
        <div className="mb-10 flex justify-center gap-3 text-3xl">
          {themeList.map((t) => (
            <span key={t.key} title={t.label} aria-label={t.label}>
              {t.emoji}
            </span>
          ))}
        </div>
      </div>
      <Button asChild size="lg" className="h-14 w-full rounded-xl text-base">
        <Link href="/create">초대장 만들기 →</Link>
      </Button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        가입 없이 10초 · 게스트는 이름만 입력하면 끝
      </p>
    </main>
  );
}
