"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  PartyPopper,
  Hourglass,
  Frown,
  Check,
  Copy,
  Link2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase, type EventRow, type RsvpRow } from "@/lib/supabase";
import { getTheme } from "@/lib/themes";
import type { Sticker } from "@/lib/stickers";
import { normalizeEffect } from "@/lib/effects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InviteHero } from "@/components/InviteHero";

type Status = "going" | "maybe" | "no";

const STATUS_META: Record<Status, { label: string; Icon: LucideIcon }> = {
  going: { label: "갈게", Icon: PartyPopper },
  maybe: { label: "고민중", Icon: Hourglass },
  no: { label: "못가", Icon: Frown },
};

function getGuestToken(eventId: string) {
  if (typeof window === "undefined") return "";
  const k = `modi_token_${eventId}`;
  let t = localStorage.getItem(k);
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(k, t);
  }
  return t;
}

export default function InviteClient({ event }: { event: EventRow }) {
  const theme = getTheme(event.theme);
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";

  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [myStatus, setMyStatus] = useState<Status | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href.split("?")[0]);
  }, []);

  const shareMessage = `${event.title}\n초대장 왔어요 🎉 이름만 남기면 참석 완료!\n👉 ${pageUrl}`;

  // 클립보드 API 실패 환경(카톡 인앱 등) 대비 폴백 포함
  async function copyText(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  async function copyMessage() {
    const url = window.location.href.split("?")[0];
    const ok = await copyText(`${event.title}\n초대장 왔어요 🎉 이름만 남기면 참석 완료!\n👉 ${url}`);
    if (ok) {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 1800);
    }
  }

  const fetchRsvps = useCallback(async () => {
    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: true });
    if (data) setRsvps(data as RsvpRow[]);
  }, [event.id]);

  useEffect(() => {
    fetchRsvps();
    // 실시간 명단 스노볼
    const channel = supabase
      .channel(`rsvps_${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvps", filter: `event_id=eq.${event.id}` },
        () => fetchRsvps()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id, fetchRsvps]);

  async function submit(status: Status) {
    if (!name.trim()) return;
    setSubmitting(true);
    setMyStatus(status);
    const token = getGuestToken(event.id);

    const { data: existing } = await supabase
      .from("rsvps")
      .select("id")
      .eq("event_id", event.id)
      .eq("guest_token", token)
      .maybeSingle();

    // comment 키는 값이 있을 때만 포함 (마이그레이션 전 DB에서도 안전)
    const extra = comment.trim() ? { comment: comment.trim() } : {};
    if (existing) {
      await supabase
        .from("rsvps")
        .update({ guest_name: name.trim(), status, ...extra })
        .eq("id", (existing as { id: string }).id);
    } else {
      await supabase.from("rsvps").insert({
        event_id: event.id,
        guest_name: name.trim(),
        status,
        guest_token: token,
        ...extra,
      });
    }
    setSubmitting(false);
    setDone(true);
    fetchRsvps();

    if (status === "going") {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.7 },
        colors: theme.confetti,
        disableForReducedMotion: true,
      });
    }
  }

  async function copyLink() {
    const ok = await copyText(window.location.href.split("?")[0]);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  const going = rsvps.filter((r) => r.status === "going");
  const maybe = rsvps.filter((r) => r.status === "maybe");
  const no = rsvps.filter((r) => r.status === "no");

  const dateLabel = event.starts_at
    ? new Date(event.starts_at).toLocaleString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "미정";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-background">
      {justCreated && (
        <div className="border-b bg-muted/50 px-5 py-4">
          <p className="mb-2 text-sm font-medium">완성! 이 문구를 카톡방에 붙여요</p>
          <div className="whitespace-pre-line rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            {shareMessage}
          </div>
          <div className="mt-2 flex gap-2">
            <Button onClick={copyMessage} size="sm" className="flex-1 gap-1.5">
              {copiedMsg ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedMsg ? "복사됨" : "초대 문구 복사"}
            </Button>
            <Button onClick={copyLink} size="sm" variant="outline" className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              링크
            </Button>
          </div>

          {/* 카톡 미리보기 (실제 OG 이미지) */}
          <p className="mb-1.5 mt-4 text-xs text-muted-foreground">카톡에 붙이면 이렇게 보여요</p>
          <div className="max-w-[260px] overflow-hidden rounded-xl border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/e/${event.slug}/opengraph-image`}
              alt="카톡 미리보기 카드"
              className="aspect-[1200/630] w-full object-cover"
            />
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {event.description ?? "이름만 남기면 참석 완료"}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground/70">
                {pageUrl.replace(/^https?:\/\//, "")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 초대장 히어로 (호스트가 꾸민 그대로) */}
      <InviteHero
        theme={theme}
        coverId={event.cover}
        title={event.title}
        description={event.description}
        dateLabel={dateLabel}
        placeLabel={event.place ?? "미정"}
        stickers={(Array.isArray(event.stickers) ? event.stickers : []) as Sticker[]}
        effect={normalizeEffect(event.effect)}
      />

      {/* RSVP */}
      <section className="-mt-6 px-6">
        <Card className="relative z-10 rounded-3xl p-6 shadow-xl">
          {!done ? (
            <>
              <p className="mb-4 text-center font-medium">올 거예요? 이름만 남겨줘요</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                className="mb-2 h-12 text-center text-base"
              />
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="한마디 (선택) — 모두에게 보여요"
                className="mb-4 h-11 text-center text-sm"
              />
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(STATUS_META) as Status[]).map((s) => {
                  const { label, Icon } = STATUS_META[s];
                  return (
                    <Button
                      key={s}
                      type="button"
                      variant="outline"
                      disabled={!name.trim() || submitting}
                      onClick={() => submit(s)}
                      className="flex h-auto flex-col gap-1.5 py-3.5 transition-transform active:scale-95"
                    >
                      <Icon
                        className="h-5 w-5"
                        strokeWidth={1.75}
                        style={{ color: theme.accent }}
                      />
                      <span className="text-xs">{label}</span>
                    </Button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                가입·전화번호 없이 이름만 · 명단은 서로 볼 수 있어요
              </p>
            </>
          ) : (
            <div className="py-2 text-center">
              <div
                className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${theme.accent}1a` }}
              >
                <Check className="h-5 w-5" style={{ color: theme.accent }} />
              </div>
              <p className="mb-1 text-lg font-semibold">
                {name}님 {myStatus ? STATUS_META[myStatus].label : ""}!
              </p>
              <button
                onClick={() => setDone(false)}
                className="text-sm text-muted-foreground underline underline-offset-2"
              >
                응답 바꾸기
              </button>
            </div>
          )}
        </Card>
      </section>

      {/* 명단 (스노볼) */}
      <section className="px-6 py-8">
        <div className="mb-5 flex justify-around text-center">
          {(Object.keys(STATUS_META) as Status[]).map((s) => {
            const count = { going, maybe, no }[s].length;
            const { label, Icon } = STATUS_META[s];
            return (
              <div key={s}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </div>
              </div>
            );
          })}
        </div>

        <NameList meta={STATUS_META.going} people={going} highlight />
        <NameList meta={STATUS_META.maybe} people={maybe} />
        <NameList meta={STATUS_META.no} people={no} />

        {rsvps.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            아직 아무도 없어요. 첫 번째로 남겨봐요!
          </p>
        )}
      </section>

      <footer className="pb-10 text-center text-xs text-muted-foreground/70">
        made with 모디 · 초대가 곧 기대감이 되는 앱
      </footer>
    </main>
  );
}

function NameList({
  meta,
  people,
  highlight,
}: {
  meta: { label: string; Icon: LucideIcon };
  people: RsvpRow[];
  highlight?: boolean;
}) {
  if (people.length === 0) return null;
  const { label, Icon } = meta;
  return (
    <div className="mb-5">
      <p className="mb-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </p>
      <div className="divide-y">
        {people.map((p) => (
          <div key={p.id} className="flex items-baseline gap-2 py-2.5">
            <span className={highlight ? "text-sm font-semibold" : "text-sm font-medium"}>
              {p.guest_name}
            </span>
            {p.comment && (
              <span className="truncate text-xs italic text-muted-foreground">
                &ldquo;{p.comment}&rdquo;
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
