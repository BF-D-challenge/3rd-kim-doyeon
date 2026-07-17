"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Layers,
  Type,
  Shapes,
  Wand2,
  Loader2,
  Check,
} from "lucide-react";
import { themes, themeList, type ThemeKey } from "@/lib/themes";
import { covers } from "@/lib/covers";
import { stickerIcons, stickerIds, type Sticker } from "@/lib/stickers";
import { supabase } from "@/lib/supabase";
import { InviteHero } from "@/components/InviteHero";
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

type Tab = "theme" | "cover" | "text" | "sticker" | "effect";

const TABS: { key: Tab; label: string; Icon: typeof Palette }[] = [
  { key: "theme", label: "테마", Icon: Palette },
  { key: "cover", label: "커버", Icon: Layers },
  { key: "text", label: "문구", Icon: Type },
  { key: "sticker", label: "스티커", Icon: Shapes },
  { key: "effect", label: "이펙트", Icon: Wand2 },
];

export default function CreatePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("theme");

  const [themeKey, setThemeKey] = useState<ThemeKey>("birthday");
  const [coverId, setCoverId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateUndecided, setDateUndecided] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [placeUndecided, setPlaceUndecided] = useState(true);
  const [place, setPlace] = useState("");
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [effect, setEffect] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = themes[themeKey];

  const dateLabel =
    dateUndecided || !startsAt
      ? "미정"
      : new Date(startsAt).toLocaleString("ko-KR", {
          month: "long",
          day: "numeric",
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        });

  function addSticker(icon: string) {
    const s: Sticker = {
      uid: crypto.randomUUID(),
      icon,
      x: 15 + Math.random() * 70,
      y: 10 + Math.random() * 55,
      size: 26 + Math.round(Math.random() * 10),
      rot: -18 + Math.round(Math.random() * 36),
    };
    setStickers((prev) => [...prev, s]);
    setSelectedUid(s.uid);
  }

  async function handleSubmit() {
    setError(null);
    if (!title.trim()) {
      setError("제목은 필수예요.");
      setTab("text");
      return;
    }
    setLoading(true);
    const slug = randomSlug();
    const hostToken = crypto.randomUUID();
    const { data, error: dbError } = await supabase
      .from("events")
      .insert({
        slug,
        title: title.trim(),
        theme: themeKey,
        starts_at: dateUndecided || !startsAt ? null : new Date(startsAt).toISOString(),
        place: placeUndecided || !place.trim() ? null : place.trim(),
        description: description.trim() || null,
        cover: coverId,
        stickers,
        effect,
        host_token: hostToken,
      })
      .select("id")
      .single();
    setLoading(false);
    if (dbError) {
      setError("저장 실패: " + dbError.message);
      return;
    }
    // 호스트 식별 + '내가 만든 초대장' 목록 (브라우저 로컬)
    if (data) {
      localStorage.setItem(`modi_host_${(data as { id: string }).id}`, hostToken);
      const mine = JSON.parse(localStorage.getItem("modi_created") ?? "[]") as string[];
      localStorage.setItem("modi_created", JSON.stringify([...mine, slug]));
    }
    router.push(`/e/${slug}?created=1`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      {/* 상단 바 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold leading-none">초대장 만들기</p>
          <p className="mt-1 text-xs text-muted-foreground">캔버스를 직접 꾸며봐요</p>
        </div>
        <Button onClick={handleSubmit} disabled={loading} size="sm" className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          완성
        </Button>
      </div>

      {/* 캔버스 (실시간 미리보기) */}
      <InviteHero
        theme={theme}
        coverId={coverId}
        title={title}
        description={description || null}
        dateLabel={dateLabel}
        placeLabel={placeUndecided || !place.trim() ? "미정" : place.trim()}
        stickers={stickers}
        effect={effect}
        editable
        selectedUid={selectedUid}
        onSelect={setSelectedUid}
        onMove={(uid, x, y) =>
          setStickers((prev) => prev.map((s) => (s.uid === uid ? { ...s, x, y } : s)))
        }
        onRemove={(uid) => {
          setStickers((prev) => prev.filter((s) => s.uid !== uid));
          setSelectedUid(null);
        }}
      />

      {error && <p className="px-5 pt-3 text-sm text-destructive">{error}</p>}

      {/* 도구 패널 */}
      <div className="flex-1 px-5 py-5">
        {tab === "theme" && (
          <div>
            <Label className="mb-2 block">모임 종류 (아이콘·이펙트·기본 색)</Label>
            <div className="grid grid-cols-4 gap-2">
              {themeList.map((t) => {
                const Icon = t.Icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setThemeKey(t.key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border py-3 transition",
                      themeKey === t.key
                        ? "border-primary bg-accent ring-1 ring-primary"
                        : "border-input hover:bg-accent/50"
                    )}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${t.accent}14`, color: t.accent }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="text-xs text-muted-foreground">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "cover" && (
          <div>
            <Label className="mb-2 block">배경 커버</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCoverId(null)}
                className={cn(
                  "flex h-16 items-center justify-center rounded-xl border bg-gradient-to-br text-xs font-medium text-white",
                  theme.gradient,
                  coverId === null ? "ring-2 ring-primary ring-offset-2" : ""
                )}
              >
                테마 기본
              </button>
              {covers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCoverId(c.id)}
                  className={cn(
                    "flex h-16 items-center justify-center rounded-xl border bg-gradient-to-br text-xs font-medium text-white",
                    c.tw,
                    coverId === c.id ? "ring-2 ring-primary ring-offset-2" : ""
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-5">
            <div>
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
            <div>
              <Label htmlFor="desc" className="mb-2 block">한 줄 소개</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="집들이 핑계로 얼굴 좀 보자~"
              />
            </div>
            <div>
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
            <div>
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
          </div>
        )}

        {tab === "sticker" && (
          <div>
            <Label className="mb-2 block">스티커 — 탭해서 추가, 캔버스에서 드래그로 이동</Label>
            <div className="grid grid-cols-8 gap-2">
              {stickerIds.map((id) => {
                const Icon = stickerIcons[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => addSticker(id)}
                    className="flex aspect-square items-center justify-center rounded-lg border border-input text-foreground/80 transition hover:bg-accent active:scale-90"
                    aria-label={`${id} 스티커 추가`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>
            {stickers.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {stickers.length}개 배치됨 · 스티커를 탭하면 삭제(✕) 버튼이 떠요
              </p>
            )}
          </div>
        )}

        {tab === "effect" && (
          <div className="flex items-center justify-between rounded-xl border px-4 py-4">
            <div>
              <p className="text-sm font-medium">떠다니는 파티클</p>
              <p className="mt-0.5 text-xs text-muted-foreground">테마 아이콘이 은은하게 떠올라요</p>
            </div>
            <Switch checked={effect} onCheckedChange={setEffect} />
          </div>
        )}
      </div>

      {/* 하단 도구 탭 */}
      <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur">
        <div className="grid grid-cols-5">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs transition",
                tab === key ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={tab === key ? 2 : 1.5} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
