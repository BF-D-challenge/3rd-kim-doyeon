"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, type EventRow, type RsvpRow } from "@/lib/supabase";
import { getTheme } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeEffect } from "@/components/ThemeEffect";
import { cn } from "@/lib/utils";

type Status = "going" | "maybe" | "no";

const STATUS_META: Record<Status, { label: string; emoji: string }> = {
  going: { label: "갈게", emoji: "🙌" },
  maybe: { label: "고민중", emoji: "🤔" },
  no: { label: "못가", emoji: "😢" },
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

  async function copyMessage() {
    await navigator.clipboard.writeText(shareMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 1800);
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

    if (existing) {
      await supabase
        .from("rsvps")
        .update({ guest_name: name.trim(), status })
        .eq("id", (existing as { id: string }).id);
    } else {
      await supabase.from("rsvps").insert({
        event_id: event.id,
        guest_name: name.trim(),
        status,
        guest_token: token,
      });
    }
    setSubmitting(false);
    setDone(true);
    fetchRsvps();
  }

  async function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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
          <p className="mb-2 text-sm font-medium">🎉 완성! 이 문구를 카톡방에 붙여요</p>
          <div className="whitespace-pre-line rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            {shareMessage}
          </div>
          <div className="mt-2 flex gap-2">
            <Button onClick={copyMessage} size="sm" className="flex-1">
              {copiedMsg ? "복사됨 ✓" : "초대 문구 복사"}
            </Button>
            <Button onClick={copyLink} size="sm" variant="outline">
              {copied ? "✓" : "링크만"}
            </Button>
          </div>
        </div>
      )}

      <section
        className={cn(
          "relative overflow-hidden bg-gradient-to-br px-6 pb-14 pt-16 text-center text-white",
          theme.gradient
        )}
      >
        <ThemeEffect emojis={theme.particles} />
        <div className="relative z-10">
          <div className="mb-4 text-6xl">{theme.emoji}</div>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight drop-shadow-sm">
            {event.title}
          </h1>
          {event.description && (
            <p className="mb-6 text-lg text-white/90">{event.description}</p>
          )}
          <div className="inline-flex flex-col gap-1 rounded-2xl bg-black/20 px-5 py-3 text-sm backdrop-blur">
            <span>🗓 {dateLabel}</span>
            <span>📍 {event.place ?? "미정"}</span>
          </div>
        </div>
      </section>

      <section className="-mt-6 px-6">
        <Card className="rounded-3xl p-6 shadow-xl">
          {!done ? (
            <>
              <p className="mb-4 text-center font-medium">올 거예요? 이름만 남겨줘요 🙂</p>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                className="mb-4 h-12 text-center text-base"
              />
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(STATUS_META) as Status[]).map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant="outline"
                    disabled={!name.trim() || submitting}
                    onClick={() => submit(s)}
                    className="flex h-auto flex-col gap-1 py-3"
                  >
                    <span className="text-2xl">{STATUS_META[s].emoji}</span>
                    <span className="text-xs">{STATUS_META[s].label}</span>
                  </Button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                가입·전화번호 없이 이름만 · 명단은 서로 볼 수 있어요
              </p>
            </>
          ) : (
            <div className="py-2 text-center">
              <p className="mb-1 text-lg font-semibold">
                {name}님 {myStatus ? STATUS_META[myStatus].label : ""}!{" "}
                {myStatus === "going" ? "🎉" : ""}
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

      <section className="px-6 py-8">
        <div className="mb-5 flex justify-around text-center">
          {(Object.keys(STATUS_META) as Status[]).map((s) => {
            const count = { going, maybe, no }[s].length;
            return (
              <div key={s}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">
                  {STATUS_META[s].emoji} {STATUS_META[s].label}
                </div>
              </div>
            );
          })}
        </div>

        <NameList title="🙌 갈게" people={going} highlight />
        <NameList title="🤔 고민중" people={maybe} />
        <NameList title="😢 못가" people={no} />

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
  title,
  people,
  highlight,
}: {
  title: string;
  people: RsvpRow[];
  highlight?: boolean;
}) {
  if (people.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        {people.map((p) => (
          <Badge
            key={p.id}
            variant={highlight ? "default" : "secondary"}
            className="rounded-full px-3 py-1 text-sm font-normal"
          >
            {p.guest_name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
