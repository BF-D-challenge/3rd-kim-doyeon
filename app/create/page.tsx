"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { themeList } from "@/lib/themes";
import type { ThemeKey } from "@/lib/themes";
import { supabase, supabaseReady } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function randomSlug(len = 6) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function CreatePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeKey>("birthday");
  const [title, setTitle] = useState("");
  const [dateUndecided, setDateUndecided] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [placeUndecided, setPlaceUndecided] = useState(true);
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("제목은 필수예요.");
      return;
    }
    if (!supabaseReady) {
      setError("Supabase 환경변수(.env.local)가 아직 설정되지 않았어요.");
      return;
    }
    setLoading(true);
    const slug = randomSlug();
    const { error: dbError } = await supabase.from("events").insert({
      slug,
      title: title.trim(),
      theme,
      starts_at: dateUndecided || !startsAt ? null : new Date(startsAt).toISOString(),
      place: placeUndecided || !place.trim() ? null : place.trim(),
      description: description.trim() || null,
    });
    setLoading(false);
    if (dbError) {
      setError("저장 실패: " + dbError.message);
      return;
    }
    router.push(`/e/${slug}?created=1`);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-background px-6 py-10">
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold tracking-tight">초대장 만들기</h1>
        <p className="mb-8 mt-1 text-sm text-muted-foreground">
          제목만 있으면 돼요. 나머지는 미정이어도 OK.
        </p>

        <Label className="mb-2 block">테마</Label>
        <div className="mb-6 grid grid-cols-4 gap-2">
          {themeList.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTheme(t.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border py-3 transition",
                theme === t.key
                  ? "border-primary bg-accent ring-1 ring-primary"
                  : "border-input hover:bg-accent/50"
              )}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs text-muted-foreground">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <Label htmlFor="title" className="mb-2 block">
            제목 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="도연이네 집들이"
          />
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="date-toggle">날짜 / 시간</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">미정</span>
              <Switch id="date-toggle" checked={dateUndecided} onCheckedChange={setDateUndecided} />
            </div>
          </div>
          {!dateUndecided && (
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          )}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="place-toggle">장소</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">미정</span>
              <Switch id="place-toggle" checked={placeUndecided} onCheckedChange={setPlaceUndecided} />
            </div>
          </div>
          {!placeUndecided && (
            <Input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="성수동 우리집"
            />
          )}
        </div>

        <div className="mb-8">
          <Label htmlFor="desc" className="mb-2 block">한 줄 소개</Label>
          <Input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="집들이 핑계로 얼굴 좀 보자~"
          />
        </div>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={loading} className="h-14 w-full rounded-xl text-base">
          {loading ? "만드는 중…" : "초대장 완성 →"}
        </Button>
      </form>
    </main>
  );
}
